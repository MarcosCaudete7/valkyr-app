import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSearchbar, IonList, IonItem, IonLabel, IonAvatar, IonListHeader, useIonViewWillEnter, IonIcon, IonBadge, IonSegment, IonSegmentButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, useIonAlert, IonButton } from '@ionic/react';
import { chatbubbleEllipsesOutline, shieldOutline, trophyOutline, addCircleOutline, exitOutline } from 'ionicons/icons';
import './SocialPage.css';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { chatService } from '../services/chatService';
import { socialService, UserProfile } from '../services/socialService';
import { guildService, Guild } from '../services/guildService';
import { API_BASE_URL } from '../services/api';
import { supabase } from '../supabaseClient';

const SocialPage: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [recentChats, setRecentChats] = useState<any[]>([]);
    const [myId, setMyId] = useState<string | null>(null);
    const [segment, setSegment] = useState<'chats' | 'clanes'>('chats');
    const [myGuild, setMyGuild] = useState<Guild | null>(null);
    const [rankings, setRankings] = useState<Guild[]>([]);
    const [presentAlert] = useIonAlert();
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
            const missingIds = new Set<string>();
            const missingMessages: any[] = [];

            messages.forEach((m: any) => {
                const otherId = m.sender_id === userId ? m.receiver_id : m.sender_id;
                if (!existingIds.has(otherId) && !missingIds.has(otherId)) {
                    missingIds.add(otherId);
                    missingMessages.push({ otherId, m });
                }
            });

            if (missingIds.size > 0) {
                // Fetch usernames for missing IDs
                const { data: profiles } = await supabase
                    .from('users')
                    .select('id, username')
                    .in('id', Array.from(missingIds));

                const profileMap = new Map(profiles?.map(p => [p.id, p.username]) || []);

                missingMessages.forEach(({ otherId, m }) => {
                    existingIds.add(otherId);
                    chats.push({
                        friendId: otherId,
                        friendName: profileMap.get(otherId) || 'Usuario',
                        lastAccessed: new Date(0).toISOString(),
                        lastMessage: m.content,
                        lastMessageTime: m.created_at,
                        isUnread: m.sender_id === otherId,
                        unreadCount: m.sender_id === otherId ? 1 : 0
                    });
                });
            }

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
                loadGuildInfo(userId);
            }
        }
    });

    const loadGuildInfo = async (userId: string) => {
        const g = await guildService.getMyGuild(userId);
        setMyGuild(g);
        const rks = await guildService.getGlobalRankings();
        setRankings(rks);
    };

    const handleCreateGuild = () => {
        presentAlert({
            header: 'Crear Nuevo Clan',
            inputs: [
                { name: 'name', type: 'text', placeholder: 'Nombre del Clan (Único)' },
                { name: 'description', type: 'textarea', placeholder: 'Descripción (Opcional)' }
            ],
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Crear',
                    handler: async (data) => {
                        if (!data.name) return false;
                        if (myId) {
                            try {
                                const newG = await guildService.createGuild(myId, data.name, data.description);
                                setMyGuild(newG);
                                loadGuildInfo(myId);
                            } catch (e: any) {
                                presentAlert({ header: 'Error', message: e.message, buttons: ['OK'] });
                            }
                        }
                    }
                }
            ]
        });
    };

    const handleJoinGuild = async (guildId: string) => {
        if (!myId) return;
        try {
            await guildService.joinGuild(myId, guildId);
            loadGuildInfo(myId);
        } catch (e: any) {
            presentAlert({ header: 'Error', message: e.message, buttons: ['OK'] });
        }
    };

    const handleLeaveGuild = async () => {
        if (!myId) return;
        try {
            await guildService.leaveGuild(myId);
            setMyGuild(null);
            loadGuildInfo(myId);
        } catch(e: any) {
            presentAlert({ header: 'Error', message: e.message, buttons: ['OK'] });
        }
    };

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
            const res = await axios.get(`${API_BASE_URL}/users/search?query=${query}`, config);
            setUsers(res.data);
        } catch (err) {
            console.error("Error buscando usuarios", err);
        }
    };

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar color="primary">
                    <IonTitle>Social & Clanes</IonTitle>
                </IonToolbar>
                <IonToolbar style={{ '--background': 'var(--ion-color-light)' }}>
                    <IonSegment value={segment} onIonChange={e => setSegment(e.detail.value as any)}>
                        <IonSegmentButton value="chats">
                            <IonLabel>Chats</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value="clanes">
                            <IonLabel>Ranking Clanes</IonLabel>
                        </IonSegmentButton>
                    </IonSegment>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding-bottom">
                
                {segment === 'chats' && (
                    <>
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
                                    <p>Enviar mensaje</p>
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
                    </>
                )}

                {segment === 'clanes' && (
                    <div className="guilds-section" style={{ padding: '15px' }}>
                        {myGuild ? (
                            <IonCard className="my-guild-card">
                                <IonCardHeader>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <IonIcon icon={shieldOutline} style={{ fontSize: '24px', color: 'var(--ion-color-primary)' }} />
                                        <IonCardTitle>{myGuild.name}</IonCardTitle>
                                    </div>
                                    <IonLabel color="medium">Tu Clan Actual</IonLabel>
                                </IonCardHeader>
                                <IonCardContent>
                                    <p>{myGuild.description || 'Sin descripción'}</p>
                                    <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
                                        <IonButton fill="clear" color="danger" onClick={handleLeaveGuild}>
                                            <IonIcon slot="start" icon={exitOutline} /> Abandonar Clan
                                        </IonButton>
                                    </div>
                                </IonCardContent>
                            </IonCard>
                        ) : (
                            <IonCard className="no-guild-card">
                                <IonCardContent style={{ textAlign: 'center', padding: '30px 15px' }}>
                                    <IonIcon icon={shieldOutline} style={{ fontSize: '48px', color: 'var(--ion-color-medium)', marginBottom: '15px' }} />
                                    <h2>No perteneces a ningún Clan</h2>
                                    <p style={{ color: 'var(--ion-color-medium)' }}>Únete a uno de la lista inferior o crea el tuyo propio para competir en el Ránking Global.</p>
                                    <IonButton expand="block" shape="round" style={{ marginTop: '20px' }} onClick={handleCreateGuild}>
                                        <IonIcon slot="start" icon={addCircleOutline} /> Crear Nuevo Clan
                                    </IonButton>
                                </IonCardContent>
                            </IonCard>
                        )}

                        <IonListHeader className="social-list-header" style={{ marginTop: '20px' }}>
                            <IonIcon icon={trophyOutline} style={{ marginRight: '8px', color: 'gold' }} />
                            <IonLabel>Ránking Global (Media Kg)</IonLabel>
                        </IonListHeader>

                        <IonList lines="full" style={{ background: 'transparent' }}>
                            {rankings.map((guild, index) => (
                                <IonItem key={guild.id} style={{ '--background': index < 3 ? 'rgba(var(--ion-color-warning-rgb), 0.05)' : 'transparent' }}>
                                    <div slot="start" style={{ width: '30px', textAlign: 'center', fontWeight: 'bold', color: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'var(--ion-color-medium)' }}>
                                        {index + 1}°
                                    </div>
                                    <IonLabel>
                                        <h2 style={{ fontWeight: '600' }}>{guild.name}</h2>
                                        <p>{guild.description || 'Sin descripción'}</p>
                                    </IonLabel>
                                    <div slot="end" style={{ textAlign: 'right' }}>
                                        <IonBadge color="primary">{guild.averageKg} kg/entreno</IonBadge>
                                        {!myGuild && (
                                            <div style={{ marginTop: '5px' }}>
                                                <IonButton size="small" fill="outline" onClick={() => handleJoinGuild(guild.id)}>Unirme</IonButton>
                                            </div>
                                        )}
                                    </div>
                                </IonItem>
                            ))}
                        </IonList>
                    </div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default SocialPage;