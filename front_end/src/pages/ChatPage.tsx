import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IonContent, IonPage, IonInput, IonButton, IonList, IonItem, IonLabel, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/react';
import { supabase } from '../supabaseClient';
import { chatService } from '../services/chatService'; // Asegúrate de que la ruta coincida con donde guardaste el service

const ChatPage: React.FC = () => {
    const { friendId, friendName } = useParams<{ friendId: string; friendName: string }>();

    const rawUserData = localStorage.getItem('userData');
    const myId = rawUserData ? JSON.parse(rawUserData).id?.toString() : null;

    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (!myId || !friendId) {
            console.error("Falta un ID. myId:", myId, "friendId:", friendId);
            return;
        }
        const fetchMessages = async () => {
            try {
                const data = await chatService.getMessages(myId, friendId);
                setMessages(data);
            } catch (error) {
                console.error("Error al cargar mensajes:", error);
            }
        };

        fetchMessages();

        const channel = supabase
            .channel(`chat_${myId}_${friendId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, (payload) => {
                const msg = payload.new;
                if ((msg.sender_id === myId && msg.receiver_id === friendId) ||
                    (msg.sender_id === friendId && msg.receiver_id === myId)) {
                    setMessages((prev) => [...prev, msg]);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [myId, friendId]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !myId || !friendId) return;

        try {
            await chatService.sendMessage(myId, friendId, newMessage);
            setNewMessage('');
        } catch (error) {
            console.error("Error al enviar el mensaje:", error);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/tabs/social" />
                    </IonButtons>
                    <IonTitle>Chat con {friendName}</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding">
                <IonList style={{ background: 'transparent' }}>
                    {messages.map((m) => {
                        const isMe = m.sender_id === myId;
                        return (
                            <IonItem key={m.id} lines="none" style={{ '--background': 'transparent' }}>
                                <div
                                    slot={isMe ? 'end' : 'start'}
                                    style={{
                                        background: isMe ? 'var(--ion-color-primary)' : 'var(--ion-color-step-100, #e0e0e0)',
                                        color: isMe ? '#fff' : 'inherit',
                                        padding: '10px 15px',
                                        borderRadius: isMe ? '15px 15px 0 15px' : '15px 15px 15px 0',
                                        maxWidth: '80%',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <IonLabel className="ion-text-wrap">{m.content}</IonLabel>
                                </div>
                            </IonItem>
                        );
                    })}
                </IonList>
            </IonContent>

            <div style={{ display: 'flex', padding: '10px', background: 'var(--ion-background-color)', borderTop: '1px solid var(--ion-color-step-150)' }}>
                <IonInput
                    value={newMessage}
                    placeholder="Escribe un mensaje..."
                    onIonInput={e => setNewMessage(e.detail.value!)}
                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                    style={{ background: 'var(--ion-color-step-50)', borderRadius: '20px', paddingLeft: '15px', marginRight: '10px' }}
                />
                <IonButton shape="round" onClick={handleSendMessage}>Enviar</IonButton>
            </div>
        </IonPage>
    );
};

export default ChatPage;