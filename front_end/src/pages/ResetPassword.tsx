import React, { useState, useEffect } from 'react';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
    IonInput, IonButton, IonToast, IonLoading, IonBackButton, IonButtons, IonIcon
} from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import axios from 'axios';
import API_BASE_URL from '../services/api';
import './Login.css';

const ResetPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

    const history = useHistory();
    const location = useLocation();

    // Extraer automáticamente el email de la URL si venimos de ForgotPassword
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const emailParam = queryParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [location]);

    const handleResetPassword = async () => {
        if (!email || !otpCode || !newPassword) {
            setToastColor('danger');
            setToastMessage('Por favor completa todos los campos.');
            return;
        }

        if (otpCode.length !== 6) {
            setToastColor('danger');
            setToastMessage('El código OTP debe tener 6 dígitos exactos.');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/auth/reset-password`, { email, otpCode, newPassword });
            setToastColor('success');
            setToastMessage('¡Contraseña restablecida con éxito!');
            setTimeout(() => {
                history.push('/login');
            }, 2000);
        } catch (error: any) {
            console.error("Fallo al restablecer contraseña:", error);
            setToastColor('danger');
            setToastMessage(error.response?.data?.message || 'El código es incorrecto o ha expirado.');
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
                    <IonTitle>Nueva Contraseña</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding register-content">
                <div className="flex-center">
                    <div className="register-card">
                        <div className="register-header">
                            <h2>Validar Código</h2>
                            <p style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
                                Introduce los 6 dígitos que te hemos enviado por correo junto a tu nueva contraseña.
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
                                    readonly={!!location.search} // Solo lectura si ya viene relleno de la ventana anterior
                                />
                            </div>

                            <div className="input-group">
                                <IonInput
                                    label="Código de Seguridad (6 dígitos)"
                                    labelPlacement="floating"
                                    fill="outline"
                                    type="number"
                                    maxlength={6}
                                    value={otpCode}
                                    onIonInput={e => setOtpCode(e.detail.value!)}
                                />
                            </div>

                            <div className="input-group">
                                <div className="input-row">
                                    <IonInput
                                        label="Nueva Contraseña"
                                        labelPlacement="floating"
                                        fill="outline"
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onIonInput={e => setNewPassword(e.detail.value!)}
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

                            <IonButton expand="block" onClick={handleResetPassword} className="submit-button" style={{ marginTop: '20px' }}>
                                CAMBIAR CONTRASEÑA
                            </IonButton>
                        </div>
                    </div>
                </div>

                <IonLoading isOpen={loading} message={'Verificando...'} />
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

export default ResetPassword;
