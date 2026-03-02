import React, { useState, useEffect } from 'react';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
    IonButtons, IonButton, IonIcon, IonAvatar, IonGrid,
    IonRow, IonCol, IonLabel, useIonViewWillEnter, IonBackButton, IonModal, IonItem, IonInput, IonTextarea
} from '@ionic/react';
import { settingsOutline, addCircleOutline, imageOutline, chatbubbleOutline, personAddOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import { socialService, UserProfile } from '../services/socialService';
import './Profile.css';

const Profile: React.FC = () => {
    const history = useHistory();
    const { targetId } = useParams<{ targetId?: string }>();

    // Auth User
    const [authUserId, setAuthUserId] = useState<string | null>(null);

    // Profile Data
    const [isOwnProfile, setIsOwnProfile] = useState(true);
    const [user, setUser] = useState<any>(null); // From API (username, name)
    const [socialProfile, setSocialProfile] = useState<UserProfile | null>(null); // From Supabase (bio, etc)
    const [posts, setPosts] = useState<string[]>([]);

    // Stats
    const [followers, setFollowers] = useState(0);
    const [following, setFollowing] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);

    // Edit Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editBio, setEditBio] = useState('');

    const token = localStorage.getItem('token')?.replace(/"/g, '');
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    const loadProfileData = async (userId: string, isOwn: boolean, currentAuthUserId: string | null) => {
        try {
            // 1. Fetch User Data from Spring Boot API
            if (isOwn) {
                const rawUserData = localStorage.getItem('user');
                if (rawUserData) setUser(JSON.parse(rawUserData));
            } else {
                const res = await axios.get(`https://api.valkyrapp.com/api/users/${userId}`, config);
                setUser(res.data);
            }

            // 2. Fetch Extended Profile from Supabase
            const profile = await socialService.getProfile(userId);
            setSocialProfile(profile);
            setEditBio(profile?.bio || '');

            // 3. Fetch Follows
            const fCount = await socialService.getFollowersCount(userId);
            const rCount = await socialService.getFollowingCount(userId);
            setFollowers(fCount);
            setFollowing(rCount);

            // 4. Check if following (if not own profile)
            if (!isOwn && currentAuthUserId) {
                const followingStatus = await socialService.checkIsFollowing(currentAuthUserId, userId);
                setIsFollowing(followingStatus);
            }

            // 5. Load Posts (Simulation for now)
            const savedPosts = localStorage.getItem(`valkyr_profile_posts_${userId}`);
            setPosts(savedPosts ? JSON.parse(savedPosts) : []);

        } catch (error) {
            console.error("Error cargando el perfil", error);
        }
    };

    useIonViewWillEnter(() => {
        const rawUserData = localStorage.getItem('user');
        const myId = rawUserData ? JSON.parse(rawUserData).id?.toString() : null;
        setAuthUserId(myId);

        if (targetId && targetId !== myId) {
            setIsOwnProfile(false);
            if (myId) loadProfileData(targetId, false, myId);
        } else {
            setIsOwnProfile(true);
            if (myId) loadProfileData(myId, true, myId);
        }
    });

    const handleFollowToggle = async () => {
        if (!authUserId || !targetId) return;
        try {
            if (isFollowing) {
                await socialService.unfollowUser(authUserId, targetId);
                setFollowers(prev => Math.max(0, prev - 1));
                setIsFollowing(false);
            } else {
                await socialService.followUser(authUserId, targetId);
                setFollowers(prev => prev + 1);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error("Error changing follow status", error);
        }
    };

    const handleMessage = () => {
        if (user) {
            history.push(`/tabs/chat/${user.id}/${user.username}`);
        }
    };

    const handleSaveProfile = async () => {
        if (!authUserId) return;
        try {
            await socialService.updateProfile(authUserId, editBio, '');
            setSocialProfile({ id: authUserId, bio: editBio, website: '' });
            setShowEditModal(false);
        } catch (error) {
            console.error("Error guardando perfil", error);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && authUserId) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newPost = e.target?.result as string;
                const updatedPosts = [newPost, ...posts];
                setPosts(updatedPosts);
                localStorage.setItem(`valkyr_profile_posts_${authUserId}`, JSON.stringify(updatedPosts));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    {!isOwnProfile && (
                        <IonButtons slot="start">
                            <IonBackButton defaultHref="/tabs/social" />
                        </IonButtons>
                    )}
                    <IonTitle>{user?.username || 'Perfil'}</IonTitle>
                    {isOwnProfile && (
                        <IonButtons slot="end">
                            <IonButton onClick={() => history.push('/tabs/settings')}>
                                <IonIcon icon={settingsOutline} />
                            </IonButton>
                        </IonButtons>
                    )}
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
                            <h2>{followers}</h2>
                            <p>Seguidores</p>
                        </div>
                        <div className="profile-stat">
                            <h2>{following}</h2>
                            <p>Seguidos</p>
                        </div>
                    </div>
                </div>

                {/* Biografía */}
                <div className="profile-bio">
                    <IonLabel>
                        <h2>{user?.fullName || user?.username || 'Atleta de Valkyr'}</h2>
                        {socialProfile?.bio ? (
                            <p style={{ whiteSpace: 'pre-wrap' }}>{socialProfile.bio}</p>
                        ) : (
                            <p>Atleta de Valkyr 💪🔥</p>
                        )}
                    </IonLabel>
                </div>

                {/* Botones de Acción */}
                <div className="profile-actions" style={{ display: 'flex', gap: '10px' }}>
                    {isOwnProfile ? (
                        <>
                            <IonButton expand="block" fill="outline" className="upload-btn" style={{ flex: 1 }} onClick={() => setShowEditModal(true)}>
                                Editar Perfil
                            </IonButton>
                            <input
                                type="file" accept="image/*" id="upload-post"
                                style={{ display: 'none' }} onChange={handleFileUpload}
                            />
                            <IonButton expand="block" fill="outline" className="upload-btn" style={{ flex: 1 }} onClick={() => document.getElementById('upload-post')?.click()}>
                                <IonIcon slot="start" icon={addCircleOutline} />
                                Nuevo Post
                            </IonButton>
                        </>
                    ) : (
                        <>
                            <IonButton expand="block" color={isFollowing ? "medium" : "primary"} className="upload-btn" style={{ flex: 1 }} onClick={handleFollowToggle}>
                                <IonIcon slot="start" icon={isFollowing ? checkmarkCircleOutline : personAddOutline} />
                                {isFollowing ? 'Siguiendo' : 'Seguir'}
                            </IonButton>
                            <IonButton expand="block" fill="outline" color="primary" className="upload-btn" style={{ flex: 1 }} onClick={handleMessage}>
                                <IonIcon slot="start" icon={chatbubbleOutline} />
                                Mensaje
                            </IonButton>
                        </>
                    )}
                </div>

                {/* Galería de Fotos */}
                <div className="profile-gallery-container">
                    {posts.length === 0 ? (
                        <div className="profile-empty-gallery">
                            <IonIcon icon={imageOutline} />
                            <h3>No hay publicaciones aún</h3>
                            {isOwnProfile ? <p>Comparte tu progreso con la comunidad</p> : <p>Este usuario no tiene fotos públicas.</p>}
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

                {/* Modal de Edición de Perfil */}
                <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
                    <IonHeader>
                        <IonToolbar>
                            <IonTitle>Editar Perfil</IonTitle>
                            <IonButtons slot="end">
                                <IonButton onClick={() => setShowEditModal(false)}>Cerrar</IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent className="ion-padding">
                        <IonItem>
                            <IonLabel position="stacked">Biografía</IonLabel>
                            <IonTextarea
                                rows={4}
                                value={editBio}
                                placeholder="Escribe algo sobre ti..."
                                onIonChange={e => setEditBio(e.detail.value!)}
                            />
                        </IonItem>
                        <IonButton expand="block" className="ion-margin-top" onClick={handleSaveProfile}>
                            Guardar Cambios
                        </IonButton>
                    </IonContent>
                </IonModal>

            </IonContent>
        </IonPage>
    );
};

export default Profile;
