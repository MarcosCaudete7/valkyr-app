import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSearchbar, IonList, IonItem, IonLabel, IonAvatar, IonListHeader, useIonViewWillEnter, IonIcon, IonBadge } from '@ionic/react';
import { chatbubbleEllipsesOutline } from 'ionicons/icons';
import './SocialPage.css';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { chatService } from '../services/chatService';
import { supabase } from '../supabaseClient';

const SocialPage: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [recentChats, setRecentChats] = useState<any[]>([]);
    const [myId, setMyId] = useState<string | null>(null);
    const history = useHistory();

    const loadChatsAndPreviews = async (userId: string) => {
        const storageKey = `valkyr_active_chats_${userId}`;
        const stored = localStorage.getItem(storageKey);
        let chats = stored ? JSON.parse(stored) : [];

        try {
            const messages = await chatService.getUserMessages(userId);

            chats = chats.map((chat: any) => {
                const latestMsg = messages.find((m: any) =>
                    m.sender_id === chat.friendId || m.receiver_id === chat.friendId
                );

                // Calculate unread count
                const unreadMsgs = messages.filter((m: any) =>
                    m.sender_id === chat.friendId &&
                    new Date(m.created_at).getTime() > new Date(chat.lastAccessed).getTime()
                );

                return {
                    ...chat,
                    lastMessage: latestMsg ? latestMsg.content : null,
                    lastMessageTime: latestMsg ? latestMsg.created_at : chat.lastAccessed,
                    isUnread: latestMsg ? latestMsg.sender_id === chat.friendId && new Date(latestMsg.created_at).getTime() > new Date(chat.lastAccessed).getTime() : false,
                    unreadCount: unreadMsgs.length
                };
            });

            const existingIds = new Set(chats.map((c: any) => c.friendId));
            messages.forEach((m: any) => {
                const otherId = m.sender_id === userId ? m.receiver_id : m.sender_id;
                if (!existingIds.has(otherId)) {
                    existingIds.add(otherId);
                    chats.push({
                        friendId: otherId,
                        friendName: 'Usuario',
                        lastAccessed: new Date(0).toISOString(), // Force all missing logic to count as unread if never accessed
                        lastMessage: m.content,
                        lastMessageTime: m.created_at,
                        isUnread: m.sender_id === otherId,
                        unreadCount: m.sender_id === otherId ? 1 : 0 // initial assumption
                    });
                }
            });

            chats.sort((a: any, b: any) => new Date(b.lastMessageTime || b.lastAccessed).getTime() - new Date(a.lastMessageTime || a.lastAccessed).getTime());

            setRecentChats(chats);
        } catch (error) {
            console.error("Error loading chat previews", error);
            setRecentChats(chats);
        }
    };

    useIonViewWillEnter(() => {
        const rawUserData = localStorage.getItem('user');
        if (rawUserData) {
            const userId = JSON.parse(rawUserData).id?.toString();
            setMyId(userId);
            if (userId) {
                loadChatsAndPreviews(userId);
            }
        }
    });

    useEffect(() => {
        if (!myId) return;

        const channel = supabase
            .channel(`social_chats_${myId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, (payload) => {
                const msg = payload.new;
                if (msg.sender_id === myId || msg.receiver_id === myId) {
                    loadChatsAndPreviews(myId);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [myId]);

    const handleSearch = async (query: string) => {
        if (query.length < 3) {
            setUsers([]);
            return;
        }
        try {
            const token = localStorage.getItem('token')?.replace(/"/g, '');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const res = await axios.get(`https://api.valkyrapp.com/api/users/search?query=${query}`, config);
            setUsers(res.data);
        } catch (err) {
            console.error("Error buscando usuarios", err);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Comunidad Valkyr</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding-bottom">
                <IonSearchbar
                    className="social-searchbar"
                    placeholder="Buscar amigos por nombre..."
                    onIonInput={(e) => handleSearch(e.detail.value!)}
                />

                {users.length > 0 && (
                    <IonList lines="none" style={{ background: 'transparent' }}>
                        <IonListHeader className="social-list-header">
                            <IonLabel>Resultados de búsqueda</IonLabel>
                        </IonListHeader>
                        {users.map(user => (
                            <IonItem className="social-user-item" key={user.id} button onClick={() => history.push(`/tabs/chat/${user.id}/${user.username}`)}>
                                <IonAvatar slot="start" className="social-avatar">
                                    <img src={`https://ui-avatars.com/api/?name=${user.username}&background=random`} />
                                </IonAvatar>
                                <IonLabel>
                                    <h2>{user.username}</h2>
                                    <p>Pulsa para chatear</p>
                                </IonLabel>
                            </IonItem>
                        ))}
                    </IonList>
                )}

                {users.length === 0 && recentChats.length > 0 && (
                    <IonList lines="none" style={{ background: 'transparent' }}>
                        <IonListHeader className="social-list-header">
                            <IonLabel>Chats Recientes</IonLabel>
                        </IonListHeader>
                        {recentChats.map((chat, idx) => (
                            <IonItem className="social-user-item" key={idx} button onClick={() => history.push(`/tabs/chat/${chat.friendId}/${chat.friendName}`)}>
                                <IonAvatar slot="start" className="social-avatar">
                                    <img src={`https://ui-avatars.com/api/?name=${chat.friendName}&background=random`} />
                                </IonAvatar>
                                <IonLabel>
                                    <h2 style={{ fontWeight: chat.isUnread ? 'bold' : '600', color: chat.isUnread ? 'var(--ion-color-primary)' : 'var(--ion-text-color)' }}>
                                        {chat.friendName}
                                    </h2>
                                    <p style={{ fontWeight: chat.isUnread ? 'bold' : 'normal', color: chat.isUnread ? 'var(--ion-text-color)' : 'var(--ion-color-medium)' }}>
                                        {chat.lastMessage ? chat.lastMessage : `Último acceso: ${new Date(chat.lastAccessed).toLocaleDateString()}`}
                                    </p>
                                </IonLabel>
                                {chat.unreadCount > 0 && (
                                    <IonBadge color="primary" slot="end" className="social-unread-badge">
                                        {chat.unreadCount}
                                    </IonBadge>
                                )}
                            </IonItem>
                        ))}
                    </IonList>
                )}

                {users.length === 0 && recentChats.length === 0 && (
                    <div className="social-empty-state">
                        <IonIcon icon={chatbubbleEllipsesOutline} className="social-empty-state-icon" />
                        <h2>Busca amigos para chatear</h2>
                        <p>Escribe su nombre en la barra superior y comienza a interactuar.</p>
                    </div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default SocialPage;