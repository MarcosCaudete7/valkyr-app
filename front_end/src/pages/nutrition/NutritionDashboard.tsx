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
    const [targets, setTargets] = useState({
        calories: 2200,
        protein: 165,
        carbs: 220,
        fat: 73,
        water: 8
    });
    const [loading, setLoading] = useState(true);

    const loadData = async (event?: CustomEvent) => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const [healthData, diary, glasses, goals] = await Promise.allSettled([
                healthService.getHealthData(),
                nutritionService.getDiaryForDate(today),
                nutritionService.getWaterToday(),
                nutritionService.getNutritionGoals(),
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
            if (goals.status === 'fulfilled' && goals.value) {
                const g = goals.value;
                setTargets({
                    calories: g.target_calories || 2200,
                    protein: g.target_protein_g || 165,
                    carbs: g.target_carbs_g || 220,
                    fat: g.target_fat_g || 73,
                    water: 8 // default for now
                });
            }
        } finally {
            setLoading(false);
            if (event) event.detail.complete();
        }
    };

    useEffect(() => { loadData(); }, []);

    const pct = (val: number, target: number) => {
        if (!target || target <= 0) return 0;
        return Math.min(100, Math.round((val / target) * 100));
    };

    const burned = health?.calories || 0;
    const caloriesRemaining = Math.max(0, (targets.calories + burned) - todayCalories);
    const calPct = pct(todayCalories, targets.calories + burned);
    const proteinPct = pct(todayProtein, targets.protein);
    const carbsPct = pct(todayCarbs, targets.carbs);
    const fatPct = pct(todayFat, targets.fat);

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

                <div className="nd-header">
                    <p className="nd-date">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    <h1 className="nd-title">Resumen Nutricional</h1>
                </div>

                {loading ? (
                    <div className="loading-center">
                        <IonSpinner name="crescent" color="success" />
                    </div>
                ) : (
                    <>
                        {/* Anillo de Calorías */}
                        <div className="calorie-ring-wrapper">
                            <div className="calorie-ring">
                                <svg className="ring-svg" viewBox="0 0 100 100">
                                    <circle className="ring-bg" cx="50" cy="50" r="45" />
                                    <circle
                                        className="ring-fill"
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        strokeDasharray={`${(calPct * 283) / 100} 283`}
                                    />
                                </svg>
                                <div className="ring-center">
                                    <span className="ring-value">{Math.round(todayCalories)}</span>
                                    <span className="ring-label">Kcal</span>
                                    <span className="ring-remaining">Faltan {caloriesRemaining}</span>
                                </div>
                            </div>

                            <div className="calorie-meta">
                                <div className="cal-meta-item">
                                    <span className="cal-meta-value consumed">{Math.round(todayCalories)}</span>
                                    <span className="cal-meta-label">Consumidas</span>
                                </div>
                                <div className="cal-meta-divider" />
                                <div className="cal-meta-item">
                                    <span className="cal-meta-value burned">{burned}</span>
                                    <span className="cal-meta-label">Quemadas</span>
                                </div>
                                <div className="cal-meta-divider" />
                                <div className="cal-meta-item">
                                    <span className="cal-meta-value remaining">{caloriesRemaining}</span>
                                    <span className="cal-meta-label">Restantes</span>
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
                                        <span className="macro-val">{todayProtein}g / {targets.protein}g</span>
                                    </div>
                                    <div className="macro-track">
                                        <div className="macro-fill protein" style={{ width: `${pct(todayProtein, targets.protein)}%` }} />
                                    </div>
                                </div>
                                <div className="macro-item">
                                    <div className="macro-header">
                                        <span className="macro-name">Carbohidratos</span>
                                        <span className="macro-val">{todayCarbs}g / {targets.carbs}g</span>
                                    </div>
                                    <div className="macro-track">
                                        <div className="macro-fill carbs" style={{ width: `${pct(todayCarbs, targets.carbs)}%` }} />
                                    </div>
                                </div>
                                <div className="macro-item">
                                    <div className="macro-header">
                                        <span className="macro-name">Grasas</span>
                                        <span className="macro-val">{todayFat}g / {targets.fat}g</span>
                                    </div>
                                    <div className="macro-track">
                                        <div className="macro-fill fat" style={{ width: `${pct(todayFat, targets.fat)}%` }} />
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
                                <span className="water-count">{waterGlasses} / {targets.water} vasos</span>
                            </div>
                            <div className="water-glasses-row">
                                {Array.from({ length: targets.water }).map((_, i) => (
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
