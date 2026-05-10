import React, { useState, useEffect } from 'react';
import {
    IonContent, IonHeader, IonPage, IonToolbar,
    IonGrid, IonRow, IonCol, IonCard, IonIcon, IonText, IonRefresher, IonRefresherContent,
    IonButton, IonCardContent, IonInput, IonSpinner, useIonAlert
} from '@ionic/react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {
    barbellOutline, trophyOutline, arrowForwardOutline,
    cameraOutline, flashOutline, clipboardOutline
} from 'ionicons/icons';
import { analyzeFoodImage } from '../services/aiService';
import { getMyRoutines } from '../services/routineService';
import { workoutHistoryService, WorkoutHistoryEntry } from '../services/workoutHistoryService';
import { Routine } from '../models/Routine';
import ModeSwitcher from '../components/ModeSwitcher';
import { useHistory } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [weight, setWeight] = useState<string>('');
    const [reps, setReps] = useState<string>('5');
    const [oneRM, setOneRM] = useState<number | null>(null);
    const [historyLogs, setHistoryLogs] = useState<WorkoutHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [presentAlert] = useIonAlert();
    const history = useHistory();

    const loadData = async (event?: CustomEvent) => {
        const rawUserData = localStorage.getItem('user');
        if (rawUserData) setUser(JSON.parse(rawUserData));
        try {
            const data = await getMyRoutines();
            setRoutines(data.slice(0, 3)); // últimas 3 rutinas

            const logs = await workoutHistoryService.getHistory(3);
            setHistoryLogs(logs);
        } catch {
            // ignore
        } finally {
            setLoading(false);
            if (event) event.detail.complete();
        }
    };

    useEffect(() => { loadData(); }, []);

    const calculate1RM = () => {
        const w = parseFloat(weight);
        const r = parseInt(reps);
        if (w > 0 && r > 0) {
            setOneRM(Math.round(w * (1 + r / 30)));
        } else {
            setOneRM(null);
        }
    };

    useEffect(() => { calculate1RM(); }, [weight, reps]);

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return '🌅 Buenos días';
        if (h < 19) return '☀️ Buenas tardes';
        return '🌙 Buenas noches';
    };

    return (
        <IonPage className="home-page">
            <IonHeader className="ion-no-border">
                <IonToolbar className="home-toolbar">
                    <ModeSwitcher />
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="home-content">
                <IonRefresher slot="fixed" onIonRefresh={loadData}>
                    <IonRefresherContent />
                </IonRefresher>

                {/* Welcome */}
                <div className="home-welcome-section">
                    <p className="home-greeting">{greeting()}</p>
                    <h1 className="welcome-title">
                        {user?.fullName?.split(' ')?.[0] || user?.username || 'Atleta'}
                    </h1>
                    <p className="welcome-subtitle">¿Listo para entrenar hoy?</p>
                </div>

                {/* Quick actions */}
                <div className="quick-actions">
                    <button className="qa-btn primary" onClick={() => history.push('/tabs/myroutines')}>
                        <IonIcon icon={barbellOutline} />
                        <span>Mis Rutinas</span>
                    </button>
                    <button className="qa-btn secondary" onClick={() => history.push('/tabs/social')}>
                        <IonIcon icon={trophyOutline} />
                        <span>Clanes</span>
                    </button>
                    <button className="qa-btn tertiary" onClick={() => history.push('/nutrition/dashboard')}>
                        <IonIcon icon={flashOutline} />
                        <span>Nutrición</span>
                    </button>
                </div>

                {/* Rutinas recientes */}
                <div className="section-block">
                    <div className="section-header">
                        <h2 className="section-title">Rutinas recientes</h2>
                        <button className="see-all" onClick={() => history.push('/tabs/myroutines')}>
                            Ver todas <IonIcon icon={arrowForwardOutline} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading-center"><IonSpinner name="dots" color="primary" /></div>
                    ) : routines.length === 0 ? (
                        <div className="empty-state">
                            <IonIcon icon={clipboardOutline} />
                            <p>No tienes rutinas aún</p>
                            <IonButton size="small" onClick={() => history.push('/tabs/myroutines')}>
                                Crear primera rutina
                            </IonButton>
                        </div>
                    ) : (
                        routines.map(r => (
                            <div key={r.id} className="routine-preview-card" onClick={() => history.push(`/tabs/routine/${r.id}`)}>
                                <div className="rpc-icon">
                                    <IonIcon icon={barbellOutline} />
                                </div>
                                <div className="rpc-info">
                                    <span className="rpc-name">{r.name}</span>
                                    <span className="rpc-meta">{r.exercises?.length || 0} ejercicios</span>
                                </div>
                                <IonIcon icon={arrowForwardOutline} className="rpc-arrow" />
                            </div>
                        ))
                    )}
                </div>

                {/* Calculadora 1RM */}
                <div className="section-block">
                    <h2 className="section-title">Calculadora 1RM</h2>
                    <IonCard className="calculator-widget">
                        <IonCardContent>
                            <IonGrid className="ion-no-padding">
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

                {/* Gráfica de Volumen */}
                {historyLogs.length > 1 && (
                    <div className="section-block">
                        <h2 className="section-title">Evolución de Volumen (kg)</h2>
                        <div className="volume-chart">
                            <div className="sparkline" style={{ display: 'flex', alignItems: 'flex-end', height: '100px', gap: '8px', padding: '10px 0' }}>
                                {historyLogs.slice().reverse().map((log, i) => {
                                    const maxVol = Math.max(...historyLogs.map(l => l.total_volume_kg));
                                    const heightPct = maxVol > 0 ? (log.total_volume_kg / maxVol) * 100 : 0;
                                    return (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                                            <div style={{ width: '100%', height: `${heightPct}%`, background: 'var(--ion-color-primary)', borderRadius: '4px 4px 0 0', opacity: i === historyLogs.length - 1 ? 1 : 0.6 }} />
                                            <span style={{ fontSize: '0.7rem', color: 'var(--ion-color-medium)', marginTop: '4px' }}>{log.total_volume_kg}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Historial de Entrenamientos */}
                <div className="section-block">
                    <div className="section-header">
                        <h2 className="section-title">Últimos entrenamientos</h2>
                    </div>
                    {loading ? (
                        <div className="loading-center"><IonSpinner name="dots" color="primary" /></div>
                    ) : historyLogs.length === 0 ? (
                        <div className="empty-state">
                            <IonIcon icon={clipboardOutline} />
                            <p>Aún no has completado entrenamientos</p>
                        </div>
                    ) : (
                        historyLogs.map(log => (
                            <div key={log.id} className="routine-preview-card" style={{ background: 'var(--ion-color-light)' }}>
                                <div className="rpc-icon" style={{ background: 'var(--ion-color-success-tint)', color: 'var(--ion-color-success)' }}>
                                    <IonIcon icon={trophyOutline} />
                                </div>
                                <div className="rpc-info">
                                    <span className="rpc-name">{log.routine_name}</span>
                                    <span className="rpc-meta">
                                        {log.duration_minutes} min • {log.total_volume_kg} kg levantados
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--ion-color-medium)' }}>
                                    {new Date(log.completed_at!).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div style={{ height: '100px' }} />
            </IonContent>
        </IonPage>
    );
};

export default Home;
