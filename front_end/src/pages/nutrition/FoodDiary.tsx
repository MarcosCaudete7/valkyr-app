import React, { useState, useEffect, useRef } from 'react';
import {
    IonContent, IonHeader, IonPage, IonToolbar, IonSearchbar,
    IonList, IonItem, IonLabel, IonButton, IonIcon, IonModal,
    IonInput, IonSelect, IonSelectOption, IonFab, IonFabButton,
    IonSpinner, IonChip, IonAlert, IonRefresher, IonRefresherContent, useIonToast
} from '@ionic/react';
import { addOutline, trashOutline, barcodeOutline, searchOutline, closeOutline } from 'ionicons/icons';
import { nutritionService, DiaryEntry, FoodItem } from '../../services/nutritionService';
import ModeSwitcher from '../../components/ModeSwitcher';
import './FoodDiary.css';

const MEAL_LABELS: Record<string, string> = {
    breakfast: '🌅 Desayuno',
    lunch: '☀️ Almuerzo',
    dinner: '🌙 Cena',
    snack: '🍎 Snack',
};
const MEAL_TYPES = Object.keys(MEAL_LABELS) as DiaryEntry['meal_type'][];

const FoodDiary: React.FC = () => {
    const [today] = useState(new Date().toISOString().split('T')[0]);
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [mealType, setMealType] = useState<DiaryEntry['meal_type']>('breakfast');
    const [quantity, setQuantity] = useState('100');
    const [showDeleteAlert, setShowDeleteAlert] = useState<string | null>(null);
    const [presentToast] = useIonToast();
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const loadDiary = async (event?: CustomEvent) => {
        setLoading(true);
        try {
            const data = await nutritionService.getDiaryForDate(today);
            setEntries(data);
        } finally {
            setLoading(false);
            if (event) event.detail.complete();
        }
    };
    useEffect(() => { loadDiary(); }, []);

    const handleSearch = (q: string) => {
        setSearchQuery(q);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (!q.trim()) { setSearchResults([]); return; }
        searchTimeout.current = setTimeout(async () => {
            setSearching(true);
            try {
                const results = await nutritionService.searchFoods(q);
                setSearchResults(results);
            } finally {
                setSearching(false);
            }
        }, 500);
    };

    const selectFood = (food: FoodItem) => {
        setSelectedFood(food);
        setSearchResults([]);
        setSearchQuery(food.name);
    };

    const calculateMacros = (food: FoodItem, qty: number) => ({
        calories: Math.round((food.calories_per_100g * qty) / 100),
        protein_g: Math.round((food.protein_per_100g * qty) / 100 * 10) / 10,
        carbs_g: Math.round((food.carbs_per_100g * qty) / 100 * 10) / 10,
        fat_g: Math.round((food.fat_per_100g * qty) / 100 * 10) / 10,
    });

    const addEntry = async () => {
        if (!selectedFood) return;
        const qty = parseFloat(quantity) || 100;
        const macros = calculateMacros(selectedFood, qty);
        try {
            await nutritionService.addDiaryEntry({
                food_id: selectedFood.id,
                food_name: selectedFood.name,
                meal_type: mealType,
                quantity_g: qty,
                date: today,
                ...macros,
            });
            await loadDiary();
            setShowAddModal(false);
            setSelectedFood(null);
            setSearchQuery('');
            presentToast({ message: `✅ ${selectedFood.name} añadido`, duration: 1500, color: 'success' });
        } catch {
            presentToast({ message: 'Error al guardar', duration: 2000, color: 'danger' });
        }
    };

    const deleteEntry = async (id: string) => {
        await nutritionService.deleteDiaryEntry(id);
        setEntries(e => e.filter(x => x.id !== id));
    };

    const totalCalories = Math.round(entries.reduce((s, e) => s + e.calories, 0));
    const totalProtein = Math.round(entries.reduce((s, e) => s + e.protein_g, 0) * 10) / 10;
    const totalCarbs = Math.round(entries.reduce((s, e) => s + e.carbs_g, 0) * 10) / 10;
    const totalFat = Math.round(entries.reduce((s, e) => s + e.fat_g, 0) * 10) / 10;

    return (
        <IonPage className="food-diary">
            <IonHeader className="ion-no-border">
                <IonToolbar className="nutrition-toolbar">
                    <ModeSwitcher />
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonRefresher slot="fixed" onIonRefresh={loadDiary}>
                    <IonRefresherContent />
                </IonRefresher>

                <div className="diary-header">
                    <h1 className="diary-title">Diario de hoy</h1>
                    <div className="diary-summary">
                        <div className="ds-item"><span className="ds-val green">{totalCalories}</span><span className="ds-lbl">kcal</span></div>
                        <div className="ds-item"><span className="ds-val blue">{totalProtein}g</span><span className="ds-lbl">Prot</span></div>
                        <div className="ds-item"><span className="ds-val yellow">{totalCarbs}g</span><span className="ds-lbl">Carbs</span></div>
                        <div className="ds-item"><span className="ds-val red">{totalFat}g</span><span className="ds-lbl">Grasas</span></div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-center"><IonSpinner name="crescent" color="success" /></div>
                ) : (
                    MEAL_TYPES.map(meal => {
                        const mealEntries = entries.filter(e => e.meal_type === meal);
                        const mealCals = Math.round(mealEntries.reduce((s, e) => s + e.calories, 0));
                        return (
                            <div key={meal} className="meal-section">
                                <div className="meal-header">
                                    <span className="meal-label">{MEAL_LABELS[meal]}</span>
                                    <span className="meal-cals">{mealCals} kcal</span>
                                </div>
                                {mealEntries.length === 0 ? (
                                    <div className="meal-empty">Nada registrado</div>
                                ) : (
                                    <div className="meal-entries">
                                        {mealEntries.map(entry => (
                                            <div key={entry.id} className="diary-entry">
                                                <div className="entry-info">
                                                    <span className="entry-name">{entry.food_name}</span>
                                                    <span className="entry-qty">{entry.quantity_g}g</span>
                                                </div>
                                                <div className="entry-macros">
                                                    <IonChip className="chip-cal">{Math.round(entry.calories)} kcal</IonChip>
                                                    <IonChip className="chip-prot">{entry.protein_g}g P</IonChip>
                                                </div>
                                                <button className="entry-delete" onClick={() => setShowDeleteAlert(entry.id!)}>
                                                    <IonIcon icon={trashOutline} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}

                {/* FAB Añadir */}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton color="success" onClick={() => { setShowAddModal(true); setSelectedFood(null); setSearchQuery(''); }}>
                        <IonIcon icon={addOutline} />
                    </IonFabButton>
                </IonFab>

                {/* Modal Añadir Alimento */}
                <IonModal isOpen={showAddModal} onDidDismiss={() => setShowAddModal(false)} className="add-food-modal">
                    <IonHeader className="ion-no-border">
                        <IonToolbar>
                            <h2 style={{ margin: '0 16px', fontSize: '1.1rem' }}>Añadir alimento</h2>
                            <IonButton slot="end" fill="clear" onClick={() => setShowAddModal(false)}>
                                <IonIcon icon={closeOutline} />
                            </IonButton>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent className="add-food-content">
                        {/* Búsqueda */}
                        <IonSearchbar
                            value={searchQuery}
                            onIonInput={e => handleSearch(e.detail.value || '')}
                            placeholder="Buscar alimento..."
                            debounce={0}
                            className="food-searchbar"
                        />
                        {searching && <div className="loading-center"><IonSpinner name="dots" color="success" /></div>}
                        {searchResults.length > 0 && (
                            <IonList className="search-results-list">
                                {searchResults.map((food, i) => (
                                    <IonItem key={i} button onClick={() => selectFood(food)} className="search-result-item">
                                        <IonLabel>
                                            <h3>{food.name}</h3>
                                            <p>{food.brand && `${food.brand} · `}{Math.round(food.calories_per_100g)} kcal/100g</p>
                                        </IonLabel>
                                        <IonChip slot="end" color="success">{Math.round(food.protein_per_100g)}g P</IonChip>
                                    </IonItem>
                                ))}
                            </IonList>
                        )}

                        {selectedFood && (
                            <div className="selected-food-form">
                                <div className="selected-food-card">
                                    <h3 className="sf-name">{selectedFood.name}</h3>
                                    {selectedFood.brand && <p className="sf-brand">{selectedFood.brand}</p>}
                                    <div className="sf-macros">
                                        <span>🔥 {Math.round(selectedFood.calories_per_100g * (parseFloat(quantity) || 100) / 100)} kcal</span>
                                        <span>💪 {(selectedFood.protein_per_100g * (parseFloat(quantity) || 100) / 100).toFixed(1)}g P</span>
                                        <span>🌾 {(selectedFood.carbs_per_100g * (parseFloat(quantity) || 100) / 100).toFixed(1)}g C</span>
                                        <span>🫒 {(selectedFood.fat_per_100g * (parseFloat(quantity) || 100) / 100).toFixed(1)}g G</span>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-field">
                                        <label>Cantidad (g)</label>
                                        <IonInput
                                            type="number"
                                            value={quantity}
                                            onIonChange={e => setQuantity(e.detail.value || '100')}
                                            className="qty-input"
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>Comida</label>
                                        <IonSelect value={mealType} onIonChange={e => setMealType(e.detail.value)} interface="action-sheet">
                                            {MEAL_TYPES.map(m => (
                                                <IonSelectOption key={m} value={m}>{MEAL_LABELS[m]}</IonSelectOption>
                                            ))}
                                        </IonSelect>
                                    </div>
                                </div>
                                <IonButton expand="block" color="success" onClick={addEntry} className="add-btn">
                                    Añadir al diario
                                </IonButton>
                            </div>
                        )}
                    </IonContent>
                </IonModal>

                <IonAlert
                    isOpen={!!showDeleteAlert}
                    header="Eliminar"
                    message="¿Eliminar este alimento del diario?"
                    buttons={[
                        { text: 'Cancelar', role: 'cancel', handler: () => setShowDeleteAlert(null) },
                        { text: 'Eliminar', role: 'destructive', handler: () => { if (showDeleteAlert) deleteEntry(showDeleteAlert); setShowDeleteAlert(null); } }
                    ]}
                    onDidDismiss={() => setShowDeleteAlert(null)}
                />
            </IonContent>
        </IonPage>
    );
};

export default FoodDiary;
