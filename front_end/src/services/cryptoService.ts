import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import { supabase } from '../supabaseClient';

export const cryptoService = {
    // Genera un par de llaves (Pública y Privada) para el usuario actual.
    // La privada se guarda en local (localStorage), la pública en Supabase.
    async generateAndPublishKeys(userId: string) {
        const existingPrivKey = localStorage.getItem(`privKey_${userId}`);
        if (existingPrivKey) {
            return; // Ya existen llaves
        }

        const keyPair = nacl.box.keyPair();
        const publicKeyBase64 = naclUtil.encodeBase64(keyPair.publicKey);
        const secretKeyBase64 = naclUtil.encodeBase64(keyPair.secretKey);

        // Guardar la llave privada LOCALMENTE. NUNCA DEBE SALIR DEL DISPOSITIVO.
        localStorage.setItem(`privKey_${userId}`, secretKeyBase64);

        // Subir la llave pública al servidor (Supabase)
        const { error } = await supabase
            .from('profiles')
            .upsert({ id: userId, public_key: publicKeyBase64 }, { onConflict: 'id' });

        if (error) {
            console.error("Error al publicar la clave pública", error);
        }
    },

    // Obtiene la llave pública de un amigo desde Supabase
    async getFriendPublicKey(friendId: string): Promise<Uint8Array | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('public_key')
            .eq('id', friendId)
            .single();

        if (error || !data?.public_key) {
            return null;
        }
        return naclUtil.decodeBase64(data.public_key);
    },

    // Obtiene la llave privada propia desde localStorage
    getMySecretKey(myId: string): Uint8Array | null {
        const privBase64 = localStorage.getItem(`privKey_${myId}`);
        if (!privBase64) return null;
        return naclUtil.decodeBase64(privBase64);
    },

    // Cifra un mensaje usando nuestra llave privada y la pública del amigo
    encryptMessage(myId: string, friendPublicKeyBase64: string, messageText: string): string {
        const secretKey = this.getMySecretKey(myId);
        if (!secretKey) throw new Error("Llave privada no encontrada");

        const friendPublicKey = naclUtil.decodeBase64(friendPublicKeyBase64);
        const nonce = nacl.randomBytes(nacl.box.nonceLength);
        const messageUint8 = naclUtil.decodeUTF8(messageText);

        // Cifrar envoltorio
        const encryptedBox = nacl.box(messageUint8, nonce, friendPublicKey, secretKey);

        // Empaquetar el nonce y el mensaje cifrado juntos para poderlos separar luego
        const fullMessage = new Uint8Array(nonce.length + encryptedBox.length);
        fullMessage.set(nonce);
        fullMessage.set(encryptedBox, nonce.length);

        return naclUtil.encodeBase64(fullMessage);
    },

    // Descifra un mensaje usando nuestra llave privada y la pública de quien lo envió
    decryptMessage(myId: string, friendPublicKeyBase64: string, encryptedMessageBase64: string): string | null {
        try {
            const secretKey = this.getMySecretKey(myId);
            if (!secretKey) return null;

            const friendPublicKey = naclUtil.decodeBase64(friendPublicKeyBase64);
            const fullMessage = naclUtil.decodeBase64(encryptedMessageBase64);

            // Desempaquetar
            const nonce = fullMessage.slice(0, nacl.box.nonceLength);
            const encryptedBox = fullMessage.slice(nacl.box.nonceLength);

            const decryptedUint8 = nacl.box.open(encryptedBox, nonce, friendPublicKey, secretKey);
            if (!decryptedUint8) {
                return null; // Falló la autenticación o las llaves no coinciden
            }

            return naclUtil.encodeUTF8(decryptedUint8);
        } catch (e) {
            // Fallará si intentamos descifrar mensajes viejos en texto plano antes de añadir E2EE
            return null;
        }
    }
};
