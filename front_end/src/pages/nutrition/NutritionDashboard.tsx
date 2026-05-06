import React, { useState, useEffect } from 'react';
import {
    IonContent, IonHeader, IonPage, IonToolbar, IonRefresher, IonRefresherContent,
    IonGrid, IonRow, IonCol, IonCard, IonIcon, IonButton, IonSpinner
} from '@ionic/react';
import { walkOutline, flameOutline, mapOutline, waterOutline, addOutline, removeOutline } from 'ionicons/icons';
import { healthService, HealthData } from '../../services/healthService';
import { nutritionService } from '../../services/nutritionService';
import ModeSwitcher from '../../components/ModeSwitcher';
import './NutritionDashboard.css';

const NutritionDashboard: React.FC = () => {
    const [health, setHealth] = useState<HealthData | null>(null);
    const [waterGlasses, setWaterGlasses] = useState(0);
    const [todayCalories, setTodayCalories] = useState(0);
    const [todayProtein, setTodayProtein] = useState(0);
    const [todayCarbs, setTodayCarbs] = useState(0);
    const [todayFat, setTodayFat] = useState(0);
    const [loading, setLoading] = useState(true);

    // Objetivos por defecto (después se calculan del perfil)
    const targetCalories = 2200;
    const targetProtein = 165;
    const targetCarbs = 220;
    const targetFat = 73;
    const waterGoal = 8;

    const loadData = async (event?: CustomEvent) => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const [healthData, diary, glasses] = await Promise.allSettled([
                healthService.getHealthData(),
                nutritionService.getDiaryForDate(today),
                nutritionService.getWaterToday(),
            ]);

            if (healthData.status === 'fulfilled') setHealth(healthData.value);
            if (glasses.status === 'fulfilled') setWaterGlasses(glasses.value);
            if (diary.status === 'fulfilled') {
                const entries = diary.value;
                setTodayCalories(Math.round(entries.reduce((s, e) => s + e.calories, 0)));
                setTodayProtein(Math.round(entries.reduce((s, e) => s + e.protein_g, 0)));
                setTodayCarbs(Math.round(entries.reduce((s, e) => s + e.carbs_g, 0)));
                setTodayFat(Math.round(entries.reduce((s, e) => s + e.fat_g, 0)));
            }
        } finally {
            setLoading(false);
            if (event) event.detail.complete();
        }
    };

    useEffect(() => { loadData(); }, []);

    const pct = (val: number, target: number) => Math.min(100, Math.round((val / target) * 100));
    const calPct = pct(todayCalories, targetCalories);
    const caloriesRemaining = Math.max(0, targetCalories - todayCalories);

    const addWater = async () => {
        await nutritionService.addWaterGlass();
        setWaterGlasses(w => w + 1);
    };
    const removeWater = async () => {
        if (waterGlasses <= 0) return;
        await nutritionService.removeWaterGlass();
        setWaterGlasses(w => Math.max(0, w - 1));
    };

    return (
        <IonPage className="nutrition-dashboard">
            <IonHeader className="ion-no-border">
                <IonToolbar className="nutrition-toolbar">
                    <ModeSwitcher />
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonRefresher slot="fixed" onIonRefresh={loadData}>
                    <IonRefresherContent />
                </IonRefresher>

                {loading ? (
                    <div className="loading-center">
                        <IonSpinner name="crescent" color="success" />
                    </div>
                ) : (
                    <>
                        {/* Header con fecha */}
                        <div className="nd-header">
                            <p className="nd-date">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                            <h1 className="nd-title">Tu día en números</h1>
                        </div>

                        {/* Anillo de calorías */}
                        <div className="calorie-ring-wrapper">
                            <div className="calorie-ring">
                                <svg viewBox="0 0 100 100" className="ring-svg">
                                    <circle cx="50" cy="50" r="42" className="ring-bg" />
                                    <circle cx="50" cy="50" r="42" className="ring-fill"
                                        strokeDasharray={`${calPct * 2.639} ${263.9}`}
                                        strokeDashoffset="65.975"
                                    />
                                </svg>
                                <div className="ring-center">
                                    <span className="ring-value">{todayCalories}</span>
                                    <span className="ring-label">kcal</span>
                                    <span className="ring-remaining">/{targetCalories}</span>
                                </div>
                            </div>
                            <div className="calorie-meta">
                                <div className="cal-meta-item">
                                    <span className="cal-meta-value consumed">{todayCalories}</span>
                                    <span className="cal-meta-label">Consumidas</span>
                                </div>
                                <div className="cal-meta-divider" />
                                <div className="cal-meta-item">
                                    <span className="cal-meta-value remaining">{caloriesRemaining}</span>
                                    <span className="cal-meta-label">Restantes</span>
                                </div>
                                <div className="cal-meta-divider" />
                                <div className="cal-meta-item">
                                    <span className="cal-meta-value burned">{health?.calories || 0}</span>
                                    <span className="cal-meta-label">Quemadas</span>
                                </div>
                            </div>
                        </div>

                        {/* Macros */}
                        <div className="macros-section">
                            <h2 className="section-title">Macros</h2>
                            <div className="macro-bars">
                                <div className="macro-item">
                                    <div className="macro-header">
                                        <span className="macro-name">Proteína</span>
                                        <span className="macro-val">{todayProtein}g / {targetProtein}g</span>
                                    </div>
                                    <div className="macro-track">
                                        <div className="macro-fill protein" style={{ width: `${pct(todayProtein, targetProtein)}%` }} />
                                    </div>
                                </div>
                                <div className="macro-item">
                                    <div className="macro-header">
                                        <span className="macro-name">Carbohidratos</span>
                                        <span className="macro-val">{todayCarbs}g / {targetCarbs}g</span>
                                    </div>
                                    <div className="macro-track">
                                        <div className="macro-fill carbs" style={{ width: `${pct(todayCarbs, targetCarbs)}%` }} />
                                    </div>
                                </div>
                                <div className="macro-item">
                                    <div className="macro-header">
                                        <span className="macro-name">Grasas</span>
                                        <span className="macro-val">{todayFat}g / {targetFat}g</span>
                                    </div>
                                    <div className="macro-track">
                                        <div className="macro-fill fat" style={{ width: `${pct(todayFat, targetFat)}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Widgets de actividad */}
                        <h2 className="section-title" style={{ marginTop: '24px' }}>Actividad</h2>
                        <IonGrid className="ion-no-padding activity-grid">
                            <IonRow>
                                <IonCol size="4">
                                    <div className="activity-widget steps">
                                        <IonIcon icon={walkOutline} />
                                        <span className="aw-value">{(health?.steps || 0).toLocaleString('es-ES')}</span>
                                        <span className="aw-label">Pasos</span>
                                    </div>
                                </IonCol>
                                <IonCol size="4">
                                    <div className="activity-widget calories">
                                        <IonIcon icon={flameOutline} />
                                        <span className="aw-value">{health?.calories || 0}</span>
                                        <span className="aw-label">Kcal</span>
                                    </div>
                                </IonCol>
                                <IonCol size="4">
                                    <div className="activity-widget distance">
                                        <IonIcon icon={mapOutline} />
                                        <span className="aw-value">{(health?.distance || 0).toFixed(1)}</span>
                                        <span className="aw-label">Km</span>
                                    </div>
                                </IonCol>
                            </IonRow>
                        </IonGrid>

                        {/* Tracker de agua */}
                        <div className="water-section">
                            <div className="water-header">
                                <div className="water-title-row">
                                    <IonIcon icon={waterOutline} className="water-icon" />
                                    <span className="water-title">Agua bebida</span>
                                </div>
                                <span className="water-count">{waterGlasses} / {waterGoal} vasos</span>
                            </div>
                            <div className="water-glasses-row">
                                {Array.from({ length: waterGoal }).map((_, i) => (
                                    <div key={i} className={`water-glass ${i < waterGlasses ? 'filled' : ''}`} />
                                ))}
                            </div>
                            <div className="water-controls">
                                <IonButton fill="outline" color="medium" size="small" onClick={removeWater}>
                                    <IonIcon slot="icon-only" icon={removeOutline} />
                                </IonButton>
                                <IonButton fill="solid" color="primary" size="small" onClick={addWater}>
                                    <IonIcon slot="start" icon={addOutline} />
                                    +1 vaso
                                </IonButton>
                            </div>
                        </div>
                    </>
                )}
            </IonContent>
        </IonPage>
    );
};

export default NutritionDashboard;
