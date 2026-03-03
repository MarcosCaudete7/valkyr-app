import React, { useState } from 'react';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
    IonInput, IonButton, IonToast, IonLoading, IonBackButton, IonButtons
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../services/api';
import './Login.css';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
    const history = useHistory();

    const handleSendCode = async () => {
        if (!email) {
            setToastColor('danger');
            setToastMessage('Por favor, ingresa tu correo electrónico');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
            setToastColor('success');
            setToastMessage('Si el correo existe, hemos enviado un código.');
            // Le damos unos milisegundos para que lea el toast y lo mandamos a resetear
            setTimeout(() => {
                history.push(`/reset-password?email=${encodeURIComponent(email)}`);
            }, 2000);
        } catch (error: any) {
            console.error("Fallo al pedir recuperación:", error);
            setToastColor('danger');
            setToastMessage('Hubo un problema de conexión al solicitar el código.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/login" />
                    </IonButtons>
                    <IonTitle>Recuperar</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding register-content">
                <div className="flex-center">
                    <div className="register-card">
                        <div className="register-header">
                            <h2>¿Contraseña olvidada?</h2>
                            <p style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
                                Ingresa el correo asociado a tu cuenta para recibir un código de seguridad de 6 dígitos.
                            </p>
                        </div>

                        <div className="register-container">
                            <div className="input-group">
                                <IonInput
                                    label="Correo Electrónico"
                                    labelPlacement="floating"
                                    fill="outline"
                                    type="email"
                                    value={email}
                                    onIonInput={e => setEmail(e.detail.value!)}
                                />
                            </div>

                            <IonButton expand="block" onClick={handleSendCode} className="submit-button" style={{ marginTop: '20px' }}>
                                ENVIAR CÓDIGO
                            </IonButton>
                        </div>
                    </div>
                </div>

                <IonLoading isOpen={loading} message={'Enviando correo...'} />
                <IonToast
                    isOpen={!!toastMessage}
                    message={toastMessage}
                    duration={3000}
                    onDidDismiss={() => setToastMessage('')}
                    color={toastColor}
                />
            </IonContent>
        </IonPage>
    );
};

export default ForgotPassword;
