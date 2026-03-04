import React, { useEffect, useState, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonContent, IonPage, IonInput, IonButton, IonList, IonItem, IonLabel, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonIcon, useIonAlert, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/react';
import { send, personCircleOutline, lockClosedOutline } from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import { chatService } from '../services/chatService';
import { cryptoService } from '../services/cryptoService';
import naclUtil from 'tweetnacl-util';
import { API_BASE_URL } from '../services/api';
import './ChatPage.css';

const ChatPage: React.FC = () => {
    const { friendId, friendName } = useParams<{ friendId: string; friendName: string }>();
    const history = useHistory();
    const [presentAlert] = useIonAlert();

    const rawUserData = localStorage.getItem('user');
    const myId = rawUserData ? JSON.parse(rawUserData).id?.toString() : null;

    const [resolvedName, setResolvedName] = useState(friendName || 'Usuario');
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const contentRef = useRef<HTMLIonContentElement>(null);
    const friendPubKeyRef = useRef<string | null>(null);

    // Pagination State
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const isInitialLoad = useRef(true);

    const formatTime = (isoString?: string) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        if (myId && friendId && friendName) {
            const storageKey = `valkyr_active_chats_${myId}`;
            const storedChats = localStorage.getItem(storageKey);
            let activeChats = storedChats ? JSON.parse(storedChats) : [];
            activeChats = activeChats.filter((chat: any) => chat.friendId !== friendId);
            activeChats.unshift({ friendId, friendName, lastAccessed: Date.now() });
            localStorage.setItem(storageKey, JSON.stringify(activeChats.slice(0, 20)));
        }
    }, [myId, friendId, friendName]);

    useEffect(() => {
        if (isInitialLoad.current && messages.length > 0) {
            contentRef.current?.scrollToBottom(0); // Scroll inicial instantáneo
            isInitialLoad.current = false;
        }
    }, [messages]);

    const loadMessages = async (targetPage: number, event?: any) => {
        if (!myId || !friendId) return;

        try {
            if (targetPage === 0) {
                const key = await cryptoService.getFriendPublicKey(friendId);
                friendPubKeyRef.current = key ? naclUtil.encodeBase64(key) : null;
            }

            const data = await chatService.getMessages(myId, friendId, targetPage, 50);

            if (data.length < 50) {
                setHasMore(false);
            }

            if (targetPage === 0) {
                setMessages(data);
            } else {
                setMessages(prev => [...data, ...prev]);
            }
            setPage(targetPage);
        } catch (error) {
            console.error("Error al cargar mensajes:", error);
        } finally {
            if (event) event.target.complete();
        }
    };

    useEffect(() => {
        if (!myId || !friendId) {
            console.error("Falta un ID. myId:", myId, "friendId:", friendId);
            return;
        }

        loadMessages(0);

        const fetchFriendDetails = async () => {
            try {
                const token = localStorage.getItem('token')?.replace(/"/g, '');
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const res = await fetch(`${API_BASE_URL}/users/${friendId}`, config as any);
                if (res.ok) {
                    const friendData = await res.json();
                    if (friendData?.username) {
                        setResolvedName(friendData.username);
                    }
                }
            } catch (err) {
                console.warn("Could not fetch fresh user details", err);
            }
        };

        fetchFriendDetails();

        const channel = supabase
            .channel(`chat_${myId}_${friendId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, async (payload) => {
                const msg = payload.new;
                if ((msg.sender_id === myId && msg.receiver_id === friendId) ||
                    (msg.sender_id === friendId && msg.receiver_id === myId)) {

                    if (!friendPubKeyRef.current) {
                        const key = await cryptoService.getFriendPublicKey(friendId);
                        friendPubKeyRef.current = key ? naclUtil.encodeBase64(key) : null;
                    }

                    if (friendPubKeyRef.current) {
                        try {
                            const decrypted = cryptoService.decryptMessage(myId, friendPubKeyRef.current, msg.content);
                            if (decrypted) msg.content = decrypted;
                        } catch (e) {
                            // Leave as plaintext if decryption fails
                        }
                    }

                    setMessages((prev) => [...prev, msg]);
                    setTimeout(() => {
                        contentRef.current?.scrollToBottom(300);
                    }, 100);
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
        } catch (error: any) {
            console.error("Error al enviar el mensaje:", error);
            if (error.message === "E2EE_MISSING_KEY") {
                presentAlert({
                    header: 'Cifrado No Disponible',
                    subHeader: 'Atención',
                    message: `${resolvedName} aún no ha actualizado la app a la última versión. Los mensajes privados no se pueden encriptar hasta que inicie sesión.`,
                    buttons: ['Entendido']
                });
            } else {
                presentAlert({
                    header: 'Error',
                    message: 'Hubo un problema al enviar el mensaje secreto.',
                    buttons: ['OK']
                });
            }
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/tabs/social" />
                    </IonButtons>
                    <IonTitle style={{ fontSize: '1.1rem' }}>
                        {resolvedName}
                        <IonIcon icon={lockClosedOutline} style={{ fontSize: '0.8rem', marginLeft: '5px', color: 'var(--ion-color-success)' }} />
                    </IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => history.push(`/tabs/profile/${friendId}`)}>
                            <IonIcon icon={personCircleOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-content-chat" ref={contentRef}>
                <IonInfiniteScroll
                    position="top"
                    onIonInfinite={(e) => loadMessages(page + 1, e)}
                    disabled={!hasMore}
                >
                    <IonInfiniteScrollContent
                        loadingSpinner="bubbles"
                        loadingText="Cargando mensajes anteriores..."
                    />
                </IonInfiniteScroll>

                <IonList style={{ background: 'transparent', padding: '10px' }}>
                    {messages.map((m) => {
                        const isMe = m.sender_id === myId;
                        return (
                            <IonItem className="chat-message-item" key={m.id} lines="none">
                                <div
                                    slot={isMe ? 'end' : 'start'}
                                    className={`chat-bubble ${isMe ? 'chat-bubble-me' : 'chat-bubble-other'}`}
                                >
                                    <IonLabel className="ion-text-wrap">{m.content}</IonLabel>
                                    <span className="chat-message-time">{formatTime(m.created_at)}</span>
                                </div>
                            </IonItem>
                        );
                    })}
                </IonList>
            </IonContent>

            <div className="chat-input-container">
                <IonInput
                    className="chat-input"
                    value={newMessage}
                    placeholder="Escribe un mensaje..."
                    onIonInput={e => setNewMessage(e.detail.value!)}
                    onKeyUp={e => e.key === 'Enter' && handleSendMessage()}
                />
                <IonButton shape="round" className="chat-send-btn" onClick={handleSendMessage}>
                    <IonIcon icon={send} slot="icon-only" />
                </IonButton>
            </div>
        </IonPage>
    );
};

export default ChatPage;