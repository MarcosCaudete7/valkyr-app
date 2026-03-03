import React, { useState } from 'react';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
    IonInput, IonButton, IonToast, IonLoading, IonIcon
} from '@ionic/react';
import { authService } from '../services/api';
import { useHistory } from 'react-router-dom';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import './Login.css';

const Login: React.FC = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const history = useHistory();

    const handleLogin = async () => {
        if (!credentials.username || !credentials.password) {
            setErrorMsg('Por favor, rellena todos los campos');
            return;
        }

        setLoading(true);
        try {
            console.log('Intetando login con:', credentials.username);
            const response = await authService.login(credentials);
            console.log('Respuesta login:', response);

            let token = response.data.token || response.headers['authorization'];

            if (token) {
                if (token.startsWith('Bearer ')) {
                    token = token.substring(7);
                }

                console.log('Token encontrado:', token);
                localStorage.setItem('token', token);
                const userData = response.data;
                console.log('Guardando usuario:', userData);
                localStorage.setItem('user', JSON.stringify(userData));
                console.log('Redirigiendo a /tabs/myroutines');
                history.push('/tabs/myroutines');
            } else {
                console.error('No se encontró token en la respuesta');
                setErrorMsg('Error: No se recibió el token de acceso');
            }
        } catch (error: any) {
            console.error("Fallo de login:", error);
            setErrorMsg(error.response?.data?.message || 'Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Valkyr Login</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding register-content">
                <div className="flex-center">
                    <div className="register-card">
                        <div className="register-header">
                            <h2>Bienvenido</h2>
                            <p>Inicia sesión para continuar en Valkyr</p>
                        </div>

                        <div className="register-container">
                            {/* Usuario */}
                            <div className="input-group">
                                <IonInput
                                    label="Nombre de Usuario"
                                    labelPlacement="floating"
                                    fill="outline"
                                    value={credentials.username}
                                    onIonInput={e => setCredentials({ ...credentials, username: e.detail.value! })}
                                />
                            </div>

                            {/* Contraseña */}
                            <div className="input-group">
                                <div className="input-row">
                                    <IonInput
                                        label="Contraseña"
                                        labelPlacement="floating"
                                        fill="outline"
                                        type={showPassword ? 'text' : 'password'}
                                        value={credentials.password}
                                        onIonInput={e => setCredentials({ ...credentials, password: e.detail.value! })}
                                    />
                                    <IonButton
                                        fill="clear"
                                        onClick={(e) => { e.preventDefault(); setShowPassword(!showPassword); }}
                                        className="eye-button-overlay"
                                    >
                                        <IonIcon slot="icon-only" icon={showPassword ? eyeOffOutline : eyeOutline} />
                                    </IonButton>
                                </div>
                            </div>

                            <IonButton expand="block" onClick={handleLogin} className="submit-button">
                                ENTRAR
                            </IonButton>

                            <div className="auth-footer" style={{ marginTop: '16px' }}>
                                <span className="auth-link" onClick={() => history.push('/forgot-password')} style={{ display: 'block', marginBottom: '16px' }}>
                                    ¿Olvidaste tu contraseña?
                                </span>
                                <p>
                                    ¿No tienes cuenta?
                                    <span className="auth-link" onClick={() => history.push('/register')}>
                                        Regístrate
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <IonLoading isOpen={loading} message={'Autenticando...'} />
                <IonToast
                    isOpen={!!errorMsg}
                    message={errorMsg}
                    duration={3000}
                    onDidDismiss={() => setErrorMsg('')}
                    color="danger"
                />
            </IonContent>
        </IonPage>
    );
};

export default Login;