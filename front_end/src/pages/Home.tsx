import React, { useState, useEffect } from 'react';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
    IonGrid, IonRow, IonCol, IonCard, IonIcon, IonText, IonRefresher, IonRefresherContent,
    IonButton, IonCardHeader, IonCardTitle, IonCardContent, IonInput, IonFab, IonFabButton, IonSpinner, useIonAlert
} from '@ionic/react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { walkOutline, flameOutline, mapOutline, timeOutline, informationCircleOutline, barbellOutline, downloadOutline, logInOutline, cameraOutline } from 'ionicons/icons';
import { healthService, HealthData } from '../services/healthService';
import { analyzeFoodImage } from '../services/aiService';
import './Home.css';

const Home: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [healthData, setHealthData] = useState<HealthData | null>(null);
    const [weight, setWeight] = useState<string>('');
    const [reps, setReps] = useState<string>('5');
    const [oneRM, setOneRM] = useState<number | null>(null);

    const [isAnalyzingFood, setIsAnalyzingFood] = useState(false);
    const [presentAlert] = useIonAlert();

    const loadData = async (event?: CustomEvent) => {
        // 1. Cargar Usuario
        const rawUserData = localStorage.getItem('user');
        if (rawUserData) {
            setUser(JSON.parse(rawUserData));
        }

        // 2. Cargar Health Data (Google Fit / Health Connect)
        const data = await healthService.getHealthData();
        setHealthData(data);

        if (event) event.detail.complete();
    };

    useEffect(() => {
        loadData();
    }, []);

    // Extra tool: Format number with dots (6500 -> 6.500)
    const formatNumber = (num: number) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const calculate1RM = () => {
        const w = parseFloat(weight);
        const r = parseInt(reps);
        if (w > 0 && r > 0) {
            // Formula de Epley: 1RM = Weight * (1 + Reps/30)
            const result = w * (1 + r / 30);
            setOneRM(Math.round(result));
        } else {
            setOneRM(null);
        }
    };

    useEffect(() => {
        calculate1RM();
    }, [weight, reps]);

    const takeFoodPhoto = async () => {
        try {
            const image = await Camera.getPhoto({
                quality: 60,
                allowEditing: false,
                resultType: CameraResultType.Base64,
                source: CameraSource.Prompt
            });

            if (image.base64String) {
                setIsAnalyzingFood(true);
                const result = await analyzeFoodImage(image.base64String);

                // Asumimos que la IA responde con { "foodName": "...", "calories": ..., "protein": ... }
                presentAlert({
                    header: 'Análisis Nutricional',
                    subHeader: result.foodName || 'Alimento detectado',
                    message: `Estimación (por ración):<br><br><b>Calorías:</b> ${result.calories} kcal<br><b>Proteína:</b> ${result.protein}g<br><b>Carbos:</b> ${result.carbs}g<br><b>Grasas:</b> ${result.fat}g`,
                    buttons: ['Cerrar']
                });
            }
        } catch (error) {
            console.error("No se tomó foto o hubo fallo:", error);
        } finally {
            setIsAnalyzingFood(false);
        }
    };

    return (
        <IonPage className="home-page">
            <IonHeader className="ion-no-border">
                <IonToolbar color="primary" className="home-toolbar">
                    <IonTitle>Valkyr</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="home-content">
                <IonRefresher slot="fixed" onIonRefresh={loadData}>
                    <IonRefresherContent />
                </IonRefresher>

                <div className="home-header-bg"></div>

                <div className="home-welcome-section">
                    <h1 className="welcome-title">
                        ¡Hola, {user?.fullName?.split(' ')?.[0] || user?.username || 'Atleta'}! 👋
                    </h1>
                    <p className="welcome-subtitle">Tu resumen de hoy</p>

                    {!Capacitor.isNativePlatform() && (
                        <div style={{ marginTop: '15px' }}>
                            <IonButton shape="round" color="secondary" className="download-btn">
                                <IonIcon slot="start" icon={downloadOutline} />
                                Descargar App Nátiva
                            </IonButton>
                        </div>
                    )}
                </div>

                <div className="widgets-container">
                    {!Capacitor.isNativePlatform() && (
                        <div style={{ textAlign: 'center', marginBottom: '15px', color: 'var(--ion-color-medium)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                            <IonIcon icon={informationCircleOutline} />
                            <span>Datos simulados (Modo Web). Conecta la App Android para ver pasos reales.</span>
                        </div>
                    )}
                    <IonGrid>
                        <IonRow>
                            {/* Pasos */}
                            <IonCol size="6">
                                <IonCard className="widget-card steps-widget">
                                    <div className="widget-icon">
                                        <IonIcon icon={walkOutline} />
                                    </div>
                                    <div className="widget-data">
                                        <h2>{healthData ? formatNumber(healthData.steps) : '---'}</h2>
                                        <p>Pasos</p>
                                    </div>
                                    <div className="widget-progress">
                                        <div className="progress-bar" style={{ width: `${Math.min(100, (healthData?.steps || 0) / 10000 * 100)}%` }}></div>
                                    </div>
                                </IonCard>
                            </IonCol>

                            {/* Calorías */}
                            <IonCol size="6">
                                <IonCard className="widget-card calories-widget">
                                    <div className="widget-icon">
                                        <IonIcon icon={flameOutline} />
                                    </div>
                                    <div className="widget-data">
                                        <h2>{healthData ? formatNumber(healthData.calories) : '---'}</h2>
                                        <p>Kcal quemadas</p>
                                    </div>
                                </IonCard>
                            </IonCol>

                            {/* Distancia */}
                            <IonCol size="6">
                                <IonCard className="widget-card distance-widget">
                                    <div className="widget-icon">
                                        <IonIcon icon={mapOutline} />
                                    </div>
                                    <div className="widget-data">
                                        <h2>{healthData ? healthData.distance.toFixed(2).replace('.', ',') : '---'}</h2>
                                        <p>Km recorridos</p>
                                    </div>
                                </IonCard>
                            </IonCol>

                            {/* Tiempo Activo (Aprox basado en distancia) */}
                            <IonCol size="6">
                                <IonCard className="widget-card time-widget">
                                    <div className="widget-icon">
                                        <IonIcon icon={timeOutline} />
                                    </div>
                                    <div className="widget-data">
                                        <h2>{healthData ? Math.floor(healthData.steps / 100) : '---'}</h2>
                                        <p>Minutos activos</p>
                                    </div>
                                </IonCard>
                            </IonCol>
                        </IonRow>
                    </IonGrid>

                    {/* Calculadora 1RM */}
                    <IonCard className="calculator-widget">
                        <IonCardHeader style={{ paddingBottom: '0' }}>
                            <IonCardTitle style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <IonIcon icon={barbellOutline} color="primary" />
                                Calculadora 1RM (Fórmula Epley)
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonGrid className="ion-no-padding" style={{ marginTop: '10px' }}>
                                <IonRow className="ion-align-items-center">
                                    <IonCol size="4">
                                        <IonInput
                                            type="number"
                                            placeholder="Peso (kg)"
                                            value={weight}
                                            onIonChange={e => setWeight(e.detail.value!)}
                                            style={{ backgroundColor: 'var(--ion-color-light)', borderRadius: '8px', padding: '0 10px' }}
                                        />
                                    </IonCol>
                                    <IonCol size="1" style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--ion-color-medium)' }}>
                                        x
                                    </IonCol>
                                    <IonCol size="4">
                                        <select
                                            value={reps}
                                            onChange={(e) => setReps(e.target.value)}
                                            style={{ width: '100%', padding: '12px 10px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--ion-color-light)', color: 'var(--ion-text-color)' }}
                                            title="Repeticiones"
                                        >
                                            {[...Array(15)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>{i + 1} reps</option>
                                            ))}
                                        </select>
                                    </IonCol>
                                    <IonCol size="3" style={{ textAlign: 'right' }}>
                                        {oneRM ? (
                                            <div className="rm-result">
                                                <span className="rm-value">{oneRM}</span>
                                                <span className="rm-unit">kg</span>
                                            </div>
                                        ) : (
                                            <IonText color="medium">---</IonText>
                                        )}
                                    </IonCol>
                                </IonRow>
                            </IonGrid>
                        </IonCardContent>
                    </IonCard>
                </div>

                <div style={{ position: 'fixed', bottom: '80px', right: '20px', zIndex: 1000}}>
                    <IonFabButton color="success" onClick={takeFoodPhoto} disabled={isAnalyzingFood}>
                        {isAnalyzingFood ? <IonSpinner name="crescent" color="light" /> : <IonIcon icon={cameraOutline} />}
                    </IonFabButton>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Home;
