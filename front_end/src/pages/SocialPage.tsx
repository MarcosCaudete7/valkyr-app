import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSearchbar, IonList, IonItem, IonLabel, IonAvatar, IonListHeader, useIonViewWillEnter, IonIcon } from '@ionic/react';
import { chatbubbleEllipsesOutline } from 'ionicons/icons';
import './SocialPage.css';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const SocialPage: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [recentChats, setRecentChats] = useState<any[]>([]);
    const history = useHistory();

    useIonViewWillEnter(() => {
        const rawUserData = localStorage.getItem('user');
        if (rawUserData) {
            const myId = JSON.parse(rawUserData).id;
            const storageKey = `valkyr_active_chats_${myId}`;
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                setRecentChats(JSON.parse(stored));
            }
        }
    });

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
                                    <h2>{chat.friendName}</h2>
                                    <p>Último acceso: {new Date(chat.lastAccessed).toLocaleDateString()}</p>
                                </IonLabel>
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