import { supabase } from '../supabaseClient';
import { cryptoService } from './cryptoService';
import naclUtil from 'tweetnacl-util';

export const chatService = {
    async sendMessage(senderId: string, receiverId: string, content: string) {
        // Obtenemos la llave pública del amigo. Si no tiene, enviaremos el mensaje en plano
        // por compatibilidad con cuentas antiguas, o podemos forzar que falle.
        // Para este caso, forzaremos encriptación si el amigo tiene llave.

        let finalContent = content;
        const friendPubKey = await cryptoService.getFriendPublicKey(receiverId);

        if (!friendPubKey) {
            throw new Error("E2EE_MISSING_KEY");
        }

        // Uint8Array to Base64 para guardarlo como string en la BD
        const friendPubKeyBase64 = naclUtil.encodeBase64(friendPubKey);
        try {
            finalContent = cryptoService.encryptMessage(senderId, friendPubKeyBase64, content);
        } catch (e) {
            console.error("Error al encriptar", e);
            throw new Error("E2EE_ENCRYPTION_FAILED");
        }

        const { data, error } = await supabase
            .from('messages')
            .insert([{ sender_id: senderId, receiver_id: receiverId, content: finalContent }]);
        if (error) throw error;
        return data;
    },

    async getMessages(myId: string, friendId: string, page: number = 0, limit: number = 50) {
        const start = page * limit;
        const end = start + limit - 1;

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq."${myId}",receiver_id.eq."${friendId}"),and(sender_id.eq."${friendId}",receiver_id.eq."${myId}")`)
            .order('created_at', { ascending: false })
            .range(start, end);

        if (error) throw error;

        // Intentar desencriptar los mensajes
        if (data && data.length > 0) {
            const friendPubKey = await cryptoService.getFriendPublicKey(friendId);
            const friendPubKeyBase64 = friendPubKey ? naclUtil.encodeBase64(friendPubKey) : null;

            const processedMsg = data.map((msg: any) => {
                if (friendPubKeyBase64) {
                    try {
                        const decrypted = cryptoService.decryptMessage(myId, friendPubKeyBase64, msg.content);
                        if (decrypted) {
                            return { ...msg, content: decrypted };
                        }
                    } catch (e) {
                        // Ignorar: probablemente era un mensaje antiguo en texto plano
                    }
                }
                return msg;
            });
            // Revertir para que lleguen en orden cronológico a la UI
            return processedMsg.reverse();
        }

        return data || [];
    },

    async getUserMessages(myId: string) {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq."${myId}",receiver_id.eq."${myId}"`)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;
        if (!data || data.length === 0) return [];

        // Colectar IDs únicos de los amigos en los mensajes y traer sus public_keys
        const friendIds = new Set<string>();
        data.forEach(m => {
            if (m.sender_id !== myId) friendIds.add(m.sender_id);
            if (m.receiver_id !== myId) friendIds.add(m.receiver_id);
        });

        const friendIdsArray = Array.from(friendIds);
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, public_key')
            .in('id', friendIdsArray);

        const keyMap: Record<string, string> = {};
        if (profiles) {
            profiles.forEach(p => {
                if (p.public_key) keyMap[p.id] = p.public_key;
            });
        }

        // Ya podemos mapear y desencriptar cada preview del inbox
        const processedMsg = data.map((msg: any) => {
            const friendId = msg.sender_id === myId ? msg.receiver_id : msg.sender_id;
            const friendPubKeyBase64 = keyMap[friendId];

            if (friendPubKeyBase64) {
                try {
                    const decrypted = cryptoService.decryptMessage(myId, friendPubKeyBase64, msg.content);
                    if (decrypted) return { ...msg, content: decrypted };
                } catch (e) {
                    // Ignorar si no se puede desencriptar (mensajes viejos)
                }
            }
            return msg;
        });

        return processedMsg;
    }
};