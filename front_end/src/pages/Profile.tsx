import React, { useState } from 'react';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
    IonButtons, IonButton, IonIcon, IonAvatar, IonGrid,
    IonRow, IonCol, IonLabel, useIonViewWillEnter
} from '@ionic/react';
import { settingsOutline, addCircleOutline, imageOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './Profile.css';

const Profile: React.FC = () => {
    const history = useHistory();
    const [user, setUser] = useState<{ id?: string, username?: string, name?: string } | null>(null);
    const [posts, setPosts] = useState<string[]>([]);

    useIonViewWillEnter(() => {
        const rawUserData = localStorage.getItem('user');
        if (rawUserData) {
            setUser(JSON.parse(rawUserData));
        }

        // Cargar posts guardados localmente para simulación
        const savedPosts = localStorage.getItem('valkyr_profile_posts');
        if (savedPosts) {
            setPosts(JSON.parse(savedPosts));
        }
    });

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newPost = e.target?.result as string;
                const updatedPosts = [newPost, ...posts];
                setPosts(updatedPosts);
                localStorage.setItem('valkyr_profile_posts', JSON.stringify(updatedPosts));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{user?.username || 'Perfil'}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => history.push('/tabs/settings')}>
                            <IonIcon icon={settingsOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="profile-content">
                {/* Cabecera del Perfil */}
                <div className="profile-header">
                    <IonAvatar className="profile-avatar">
                        <img src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&size=150&background=random`} alt="Profile" />
                    </IonAvatar>

                    <div className="profile-stats-container">
                        <div className="profile-stat">
                            <h2>{posts.length}</h2>
                            <p>Posts</p>
                        </div>
                        <div className="profile-stat">
                            <h2>245</h2>
                            <p>Seguidores</p>
                        </div>
                        <div className="profile-stat">
                            <h2>180</h2>
                            <p>Seguidos</p>
                        </div>
                    </div>
                </div>

                {/* Biografía */}
                <div className="profile-bio">
                    <IonLabel>
                        <h2>{user?.name || user?.username || 'Atleta de Valkyr'}</h2>
                        <p>Entusiasta del fitness 💪🔥</p>
                        <p>Mejorando día a día con Valkyr App.</p>
                    </IonLabel>
                </div>

                {/* Botón de Nueva Publicación */}
                <div className="profile-actions">
                    <input
                        type="file"
                        accept="image/*"
                        id="upload-post"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                    />
                    <IonButton expand="block" fill="outline" className="upload-btn" onClick={() => document.getElementById('upload-post')?.click()}>
                        <IonIcon slot="start" icon={addCircleOutline} />
                        Nueva publicación
                    </IonButton>
                </div>

                {/* Galería de Fotos */}
                <div className="profile-gallery-container">
                    {posts.length === 0 ? (
                        <div className="profile-empty-gallery">
                            <IonIcon icon={imageOutline} />
                            <h3>No hay publicaciones aún</h3>
                            <p>Comparte tu progreso con la comunidad</p>
                        </div>
                    ) : (
                        <IonGrid className="profile-grid">
                            <IonRow>
                                {posts.map((postImg, idx) => (
                                    <IonCol size="4" key={idx} className="profile-grid-col">
                                        <div className="profile-grid-item" style={{ backgroundImage: `url(${postImg})` }} />
                                    </IonCol>
                                ))}
                            </IonRow>
                        </IonGrid>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Profile;
