import React, { useState, useEffect } from 'react';
import {
    IonContent, IonHeader, IonPage, IonToolbar, IonIcon,
    IonButton, IonInput, IonModal, IonSpinner, IonRefresher, IonRefresherContent, useIonToast
} from '@ionic/react';
import { addOutline, closeOutline, scaleOutline } from 'ionicons/icons';
import { nutritionService, BodyMeasure } from '../../services/nutritionService';
import ModeSwitcher from '../../components/ModeSwitcher';
import './BodyMeasures.css';

const BodyMeasures: React.FC = () => {
    const [measures, setMeasures] = useState<BodyMeasure[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<BodyMeasure>({ date: new Date().toISOString().split('T')[0] });
    const [saving, setSaving] = useState(false);
    const [presentToast] = useIonToast();

    const loadMeasures = async (event?: CustomEvent) => {
        setLoading(true);
        try {
            const data = await nutritionService.getBodyMeasures();
            setMeasures(data);
        } finally {
            setLoading(false);
            if (event) event.detail.complete();
        }
    };
    useEffect(() => { loadMeasures(); }, []);

    const save = async () => {
        setSaving(true);
        try {
            await nutritionService.addBodyMeasure(form);
            await loadMeasures();
            setShowModal(false);
            setForm({ date: new Date().toISOString().split('T')[0] });
            presentToast({ message: '✅ Medidas guardadas', duration: 1500, color: 'success' });
        } catch {
            presentToast({ message: 'Error al guardar', duration: 2000, color: 'danger' });
        } finally {
            setSaving(false);
        }
    };

    const latestWeight = measures.find(m => m.weight_kg)?.weight_kg;

    // Simple sparkline: últimos 10 pesos
    const weightHistory = measures.filter(m => m.weight_kg).slice(0, 10).reverse();
    const minW = Math.min(...weightHistory.map(m => m.weight_kg!)) - 1;
    const maxW = Math.max(...weightHistory.map(m => m.weight_kg!)) + 1;
    const pctH = (w: number) => ((w - minW) / (maxW - minW)) * 100;

    return (
        <IonPage className="body-measures">
            <IonHeader className="ion-no-border">
                <IonToolbar className="nutrition-toolbar">
                    <ModeSwitcher />
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonRefresher slot="fixed" onIonRefresh={loadMeasures}>
                    <IonRefresherContent />
                </IonRefresher>

                <div className="bm-header">
                    <h1 className="bm-title">Medidas corporales</h1>
                    {latestWeight && (
                        <div className="bm-weight-hero">
                            <IonIcon icon={scaleOutline} />
                            <span className="bm-weight-val">{latestWeight} kg</span>
                            <span className="bm-weight-lbl">Peso actual</span>
                        </div>
                    )}
                </div>

                {/* Mini gráfica de peso */}
                {weightHistory.length > 1 && (
                    <div className="weight-chart">
                        <h3 className="chart-title">Evolución del peso</h3>
                        <div className="sparkline">
                            {weightHistory.map((m, i) => (
                                <div key={i} className="spark-bar-wrapper">
                                    <div className="spark-bar" style={{ height: `${pctH(m.weight_kg!)}%` }} />
                                    <span className="spark-val">{m.weight_kg}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="loading-center"><IonSpinner name="crescent" color="success" /></div>
                ) : measures.length === 0 ? (
                    <div className="bm-empty">
                        <span>📏</span>
                        <p>No hay medidas registradas</p>
                        <p className="bm-empty-sub">Empieza registrando tu peso de hoy</p>
                    </div>
                ) : (
                    <div className="measures-list">
                        {measures.slice(0, 15).map((m, i) => (
                            <div key={i} className="measure-card">
                                <div className="mc-date">{new Date(m.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                                <div className="mc-grid">
                                    {m.weight_kg && <div className="mc-item"><span className="mc-val">{m.weight_kg}</span><span className="mc-lbl">kg</span></div>}
                                    {m.waist_cm && <div className="mc-item"><span className="mc-val">{m.waist_cm}</span><span className="mc-lbl">Cintura</span></div>}
                                    {m.chest_cm && <div className="mc-item"><span className="mc-val">{m.chest_cm}</span><span className="mc-lbl">Pecho</span></div>}
                                    {m.arm_cm && <div className="mc-item"><span className="mc-val">{m.arm_cm}</span><span className="mc-lbl">Brazo</span></div>}
                                    {m.leg_cm && <div className="mc-item"><span className="mc-val">{m.leg_cm}</span><span className="mc-lbl">Pierna</span></div>}
                                    {m.hip_cm && <div className="mc-item"><span className="mc-val">{m.hip_cm}</span><span className="mc-lbl">Cadera</span></div>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ height: '100px' }} />
                <div className="add-fab-row">
                    <IonButton expand="block" color="success" onClick={() => setShowModal(true)} className="add-measure-btn">
                        <IonIcon slot="start" icon={addOutline} />
                        Registrar medidas hoy
                    </IonButton>
                </div>

                {/* Modal */}
                <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
                    <IonHeader className="ion-no-border">
                        <IonToolbar>
                            <h2 style={{ margin: '0 16px', fontSize: '1.1rem' }}>Registrar medidas</h2>
                            <IonButton slot="end" fill="clear" onClick={() => setShowModal(false)}>
                                <IonIcon icon={closeOutline} />
                            </IonButton>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent style={{ '--background': '#0d1117' }}>
                        <div className="measure-form">
                            {[
                                { key: 'weight_kg', label: '⚖️ Peso (kg)' },
                                { key: 'waist_cm', label: '📏 Cintura (cm)' },
                                { key: 'chest_cm', label: '💪 Pecho (cm)' },
                                { key: 'arm_cm', label: '💪 Brazo (cm)' },
                                { key: 'leg_cm', label: '🦵 Pierna (cm)' },
                                { key: 'hip_cm', label: '🍑 Cadera (cm)' },
                            ].map(({ key, label }) => (
                                <div key={key} className="mf-field">
                                    <label>{label}</label>
                                    <IonInput
                                        type="number"
                                        placeholder="—"
                                        value={(form as any)[key] || ''}
                                        onIonChange={e => setForm(f => ({ ...f, [key]: e.detail.value ? parseFloat(e.detail.value) : undefined }))}
                                        className="mf-input"
                                    />
                                </div>
                            ))}
                            <IonButton expand="block" color="success" onClick={save} disabled={saving} style={{ margin: '16px' }}>
                                {saving ? <IonSpinner name="crescent" /> : 'Guardar medidas'}
                            </IonButton>
                        </div>
                    </IonContent>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default BodyMeasures;
