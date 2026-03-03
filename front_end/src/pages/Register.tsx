import React, { useState } from 'react';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
    IonInput, IonButton, IonToast, IonBackButton, IonButtons, IonIcon
} from '@ionic/react';
import { authService } from '../services/api';
import { useHistory } from 'react-router-dom';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import './Register.css';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        fullName: '',
        password: '',
        confirmPassword: ''
    });

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [serverErrors, setServerErrors] = useState({ username: '', email: '' });
    const [isValidating, setIsValidating] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    const history = useHistory();

    const getPasswordStrength = (password: string) => {
        if (!password) return 0;
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const strength = getPasswordStrength(formData.password);

    const strengthConfig = [
        { color: 'var(--ion-color-danger)', label: 'Muy débil', width: '25%' },
        { color: '#ffa500', label: 'Débil', width: '50%' },
        { color: '#ffcc00', label: 'Media', width: '75%' },
        { color: 'var(--ion-color-success)', label: 'Fuerte', width: '100%' }
    ];

    const validateEmail = (email: string) => {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    };

    const checkAvailability = (field: 'username' | 'email', value: string) => {
        if (debounceTimer) clearTimeout(debounceTimer);
        setServerErrors(prev => ({ ...prev, [field]: '' }));

        if (value.length < 3) return;

        setIsValidating(true);
        const timer = setTimeout(async () => {
            try {
                const isAvailable = await authService.checkUnique(field, value);
                if (!isAvailable) {
                    setServerErrors(prev => ({
                        ...prev,
                        [field]: `Este ${field === 'username' ? 'usuario' : 'email'} ya está en uso`
                    }));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsValidating(false);
            }
        }, 600);

        setDebounceTimer(timer);
    };

    const handleRegister = async () => {
        const { username, email, password, confirmPassword, fullName } = formData;

        if (!username || !email || !password || !confirmPassword || !fullName) {
            setErrorMsg('Por favor, rellena todos los campos');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMsg('Las contraseñas no coinciden');
            return;
        }
        if (password.length < 8) {
            setErrorMsg('La contraseña debe tener al menos 8 caracteres');
            return;
        }
        if (serverErrors.username || serverErrors.email) {
            setErrorMsg('Corrige los errores de disponibilidad');
            return;
        }
        if (isValidating) return;

        try {
            await authService.register({ username, email, password, fullName });
            setSuccessMsg('¡Registro exitoso! Por favor inicia sesión.');
            setTimeout(() => history.replace('/login'), 2000);
        } catch (error: any) {
            if (error.response?.status === 409) {
                const msg = error.response.data?.message?.toLowerCase() || "";
                if (msg.includes("usuario") || msg.includes("username")) {
                    setServerErrors(prev => ({ ...prev, username: 'Este usuario ya existe' }));
                } else if (msg.includes("email") || msg.includes("correo")) {
                    setServerErrors(prev => ({ ...prev, email: 'Este email ya está en uso' }));
                } else {
                    setErrorMsg(error.response.data?.message || 'Error de duplicidad');
                }
            } else {
                setErrorMsg('Error de conexión con el servidor');
            }
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/login" />
                    </IonButtons>
                    <IonTitle>Crear Cuenta Valkyr</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding register-content">

                <div className="flex-center">


                    <div className="register-card">

                        <div className="register-header">
                            <h2>Crea tu cuenta</h2>
                            <p>Únete a la comunidad de Valkyr</p>
                        </div>

                        <div className="register-container">

                            <div className="input-group">
                                <IonInput
                                    label="Nombre Completo"
                                    labelPlacement="floating"
                                    fill="outline"
                                    value={formData.fullName}
                                    onIonInput={e => setFormData({ ...formData, fullName: e.detail.value! })}
                                />
                            </div>


                            <div className="input-group">
                                <IonInput
                                    label="Nombre de Usuario"
                                    labelPlacement="floating"
                                    fill="outline"
                                    className={`
                                        ${serverErrors.username ? 'ion-invalid ion-touched' : ''} 
                                        ${formData.username.length >= 3 && !serverErrors.username && !isValidating ? 'ion-valid ion-touched' : ''}
                                    `}
                                    value={formData.username}
                                    onIonInput={e => {
                                        const val = e.detail.value!;
                                        setFormData({ ...formData, username: val });
                                        checkAvailability('username', val);
                                    }}
                                    errorText={serverErrors.username}
                                />
                            </div>

                            <div className="input-group">
                                <IonInput
                                    label="Email"
                                    labelPlacement="floating"
                                    fill="outline"
                                    type="email"
                                    className={`
                                        ${serverErrors.email ? 'ion-invalid ion-touched' : ''} 
                                        ${formData.email && validateEmail(formData.email) && !serverErrors.email ? 'ion-valid ion-touched' : ''}
                                    `}
                                    value={formData.email}
                                    onIonInput={e => {
                                        const val = e.detail.value!;
                                        setFormData({ ...formData, email: val });
                                        if (validateEmail(val)) checkAvailability('email', val);
                                    }}
                                    errorText={serverErrors.email}
                                />
                            </div>

                            <div className="input-group">
                                <div className="input-row">
                                    <IonInput
                                        label="Contraseña"
                                        labelPlacement="floating"
                                        fill="outline"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        className={formData.password.length >= 8 ? 'ion-valid ion-touched' : formData.password.length > 0 ? 'ion-invalid ion-touched' : ''}
                                        onIonInput={e => setFormData({ ...formData, password: e.detail.value! })}
                                    />
                                    <IonButton
                                        fill="clear"
                                        onClick={(e) => { e.preventDefault(); setShowPassword(!showPassword); }}
                                        className="eye-button-overlay"
                                    >
                                        <IonIcon slot="icon-only" icon={showPassword ? eyeOffOutline : eyeOutline} />
                                    </IonButton>
                                </div>
                                {formData.password && (
                                    <div className="password-strength-wrapper">
                                        <div className="strength-bar-container">
                                            <div
                                                className="strength-bar-fill"
                                                style={{
                                                    width: strengthConfig[strength - 1]?.width || '5%',
                                                    backgroundColor: strengthConfig[strength - 1]?.color || 'gray'
                                                }}
                                            ></div>
                                        </div>
                                        <span className="strength-label" style={{ color: strengthConfig[strength - 1]?.color }}>
                                            {strengthConfig[strength - 1]?.label}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="input-group">
                                <div className="input-row">
                                    <IonInput
                                        label="Confirmar Contraseña"
                                        labelPlacement="floating"
                                        fill="outline"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        className={`
                                            ${formData.confirmPassword && formData.confirmPassword !== formData.password ? 'ion-invalid ion-touched' : ''}
                                            ${formData.confirmPassword && formData.confirmPassword === formData.password ? 'ion-valid ion-touched' : ''}
                                        `}
                                        onIonInput={e => setFormData({ ...formData, confirmPassword: e.detail.value! })}
                                    />
                                    <IonButton
                                        fill="clear"
                                        onClick={(e) => { e.preventDefault(); setShowConfirmPassword(!showConfirmPassword); }}
                                        className="eye-button-overlay"
                                    >
                                        <IonIcon slot="icon-only" icon={showConfirmPassword ? eyeOffOutline : eyeOutline} />
                                    </IonButton>
                                </div>
                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <span className="error-message-small">Las contraseñas no coinciden</span>
                                )}
                            </div>

                            <IonButton
                                expand="block"
                                onClick={handleRegister}
                                className="submit-button ion-margin-top"
                                disabled={isValidating || (formData.confirmPassword !== formData.password) || formData.password.length < 8}
                            >
                                {isValidating ? 'Comprobando...' : 'Registrarse'}
                            </IonButton>

                            <div className="auth-footer">
                                <p>
                                    ¿Ya tienes una cuenta?
                                    <span className="auth-link" onClick={() => history.push('/login')}>
                                        Inicia sesión
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <IonToast
                    isOpen={!!errorMsg}
                    message={errorMsg}
                    duration={3000}
                    onDidDismiss={() => setErrorMsg('')}
                    color="danger"
                />

                <IonToast
                    isOpen={!!successMsg}
                    message={successMsg}
                    duration={3000}
                    onDidDismiss={() => setSuccessMsg('')}
                    color="success"
                />
            </IonContent>
        </IonPage>
    );
};

export default Register;