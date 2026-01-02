import React, { useState } from 'react';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
    IonInput, IonItem, IonLabel, IonButton, IonToast, IonLoading
} from '@ionic/react';
import { authService } from '../services/api';
import { useHistory } from 'react-router-dom';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const history = useHistory();

    const handleLogin = async () => {
        if (!username || !password) {
            setErrorMsg('Por favor, rellena todos los campos');
            return;
        }

        setLoading(true);
        try {
            const response = await authService.login({ username, password });

            console.log('Login exitoso:', response.data);

            localStorage.setItem('user', JSON.stringify(response.data));

            history.push('/tab1');
        } catch (error: any) {
            const message = error.response?.status === 401
                ? 'Credenciales inválidas'
                : 'Error de conexión con el servidor';
            setErrorMsg(message);
        } finally {
            setLoading(false);
        }
    };

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        fullName: '',
        password: '',
        confirmPassword: ''
    });


    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Valkyr Login</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonItem>
                    <IonLabel position="floating">Usuario</IonLabel>
                    <IonInput
                        value={username}
                        onIonChange={e => setUsername(e.detail.value!)}
                    />
                </IonItem>

                <IonItem>
                    <IonLabel position="floating">Contraseña</IonLabel>
                    <IonInput
                        type="password"
                        value={password}
                        onIonChange={e => setPassword(e.detail.value!)}
                    />
                </IonItem>

                <IonButton shape="round" onClick={handleLogin} className="ion-margin-top">
                    Entrar
                </IonButton>

                <IonButton fill="clear" onClick={() => history.push('/register')}>
                    ¿No tienes cuenta? Regístrate
                </IonButton>

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
