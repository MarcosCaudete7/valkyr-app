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
            const response = await authService.login(credentials);
            localStorage.setItem('user', JSON.stringify(response.data));
            history.push('/tabs/tab1');
        } catch (error: any) {
            const message = error.response?.status === 401
                ? 'Credenciales inválidas'
                : 'Error de conexión con el servidor';
            setErrorMsg(message);
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

                            <div className="auth-footer">
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