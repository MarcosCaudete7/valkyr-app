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

    async getMessages(myId: string, friendId: string) {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq."${myId}",receiver_id.eq."${friendId}"),and(sender_id.eq."${friendId}",receiver_id.eq."${myId}")`)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Intentar desencriptar los mensajes
        if (data && data.length > 0) {
            const friendPubKey = await cryptoService.getFriendPublicKey(friendId);
            const friendPubKeyBase64 = friendPubKey ? naclUtil.encodeBase64(friendPubKey) : null;

            return data.map((msg: any) => {
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

        // Como aquí hay mensajes de múltiples amigos, necesitaríamos las llaves de todos.
        // Por simplicidad en esta vista general (Inbox), intentaremos descifrar si podemos,
        // pero idealmente deberíamos hacer un batch fetch de llaves. 
        // Lo dejamos tal cual para la vista de inbox o implementamos un caché de llaves.

        // Vamos a optimizar: solo descifrar en el chat 1 a 1, el inbox puede ignorarse o
        // requerir un refactor mayor. Por ahora, si es cifrado, en el inbox saldrá gibberish
        // a menos que también carguemos la llave.
        return data || [];
    }
};