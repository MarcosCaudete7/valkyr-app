import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSearchbar, IonList, IonItem, IonLabel, IonAvatar } from '@ionic/react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const SocialPage: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const history = useHistory();

    const handleSearch = async (query: string) => {
        if (query.length < 3) return;
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
            <IonContent>
                <IonSearchbar
                    placeholder="Buscar amigos por nombre..."
                    onIonInput={(e) => handleSearch(e.detail.value!)}
                />
                <IonList>
                    {users.map(user => (
                        <IonItem key={user.id} button onClick={() => history.push(`/tabs/chat/${user.id}/${user.username}`)}>
                            <IonAvatar slot="start">
                                <img src={`https://ui-avatars.com/api/?name=${user.username}`} />
                            </IonAvatar>
                            <IonLabel>
                                <h2>{user.username}</h2>
                                <p>Pulsa para chatear</p>
                            </IonLabel>
                        </IonItem>
                    ))}
                </IonList>
            </IonContent>
        </IonPage>
    );
};

export default SocialPage;