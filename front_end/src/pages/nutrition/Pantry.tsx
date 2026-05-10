import React, { useState, useEffect } from 'react';
import {
    IonContent, IonHeader, IonPage, IonToolbar, IonFab, IonFabButton, IonIcon,
    IonModal, IonButton, IonSearchbar, IonList, IonItem, IonLabel,
    IonSpinner, IonAlert, IonRefresher, IonRefresherContent, useIonToast,
    IonChip
} from '@ionic/react';
import { addOutline, trashOutline, closeOutline, bulbOutline, cameraOutline } from 'ionicons/icons';
import { nutritionService, FoodItem, PantryItem } from '../../services/nutritionService';
import { analyzePantryForMeals, analyzeShoppingList } from '../../services/aiService';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import ModeSwitcher from '../../components/ModeSwitcher';
import './Pantry.css';

const Pantry: React.FC = () => {
    const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
    const [searching, setSearching] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [loadingAI, setLoadingAI] = useState(false);
    const [isScanningList, setIsScanningList] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState<string | null>(null);
    const [presentToast] = useIonToast();

    const loadPantry = async (event?: CustomEvent) => {
        setLoading(true);
        try {
            const items = await nutritionService.getPantry();
            setPantryItems(items);
        } finally {
            setLoading(false);
            if (event) event.detail.complete();
        }
    };
    useEffect(() => { loadPantry(); }, []);

    const handleSearch = async (q: string) => {
        setSearchQuery(q);
        if (!q.trim()) { setSearchResults([]); return; }
        setSearching(true);
        try {
            const results = await nutritionService.searchFoods(q);
            setSearchResults(results);
        } finally { setSearching(false); }
    };

    const addToPantry = async (food: FoodItem) => {
        try {
            await nutritionService.addToPantry(food);
            await loadPantry();
            setShowAddModal(false);
            setSearchQuery('');
            setSearchResults([]);
            presentToast({ message: `✅ ${food.name} añadido a la despensa`, duration: 1500, color: 'success' });
        } catch (error: any) {
            console.error("Pantry Add Error:", error);
            presentToast({ message: `Error al guardar: ${error.message || JSON.stringify(error)}`, duration: 4000, color: 'danger' });
        }
    };

    const removeFromPantry = async (id: string) => {
        await nutritionService.removeFromPantry(id);
        setPantryItems(items => items.filter(i => i.id !== id));
    };

    const getAISuggestion = async () => {
        if (pantryItems.length === 0) {
            presentToast({ message: 'Añade productos a tu despensa primero', duration: 2000, color: 'warning' });
            return;
        }
        setLoadingAI(true);
        try {
            const names = pantryItems.map(i => i.food_name).join(', ');
            const suggestion = await analyzePantryForMeals(names);
            setAiSuggestion(suggestion);
        } catch {
            presentToast({ message: 'Error generando sugerencia', duration: 2000, color: 'danger' });
        } finally {
            setLoadingAI(false);
        }
    };

    const scanShoppingList = async () => {
        try {
            const image = await Camera.getPhoto({
                quality: 60,
                allowEditing: false,
                resultType: CameraResultType.Base64,
                source: CameraSource.Prompt
            });

            if (image.base64String) {
                setIsScanningList(true);
                const result = await analyzeShoppingList(image.base64String);
                if (result.items && result.items.length > 0) {
                    for (const itemName of result.items) {
                        const searchResults = await nutritionService.searchFoods(itemName);
                        const foodToAdd: FoodItem = searchResults.length > 0 ? searchResults[0] : {
                            name: itemName,
                            calories_per_100g: 0,
                            protein_per_100g: 0,
                            carbs_per_100g: 0,
                            fat_per_100g: 0
                        };
                        await nutritionService.addToPantry(foodToAdd);
                    }
                    await loadPantry();
                    presentToast({ message: `✅ ${result.items.length} productos añadidos`, duration: 2000, color: 'success' });
                } else {
                    presentToast({ message: 'No se detectaron productos en la imagen', duration: 2000, color: 'warning' });
                }
            }
        } catch (error: any) {
            console.error("Pantry Scan/Add Error:", error);
            presentToast({ message: `Error al procesar: ${error.message || JSON.stringify(error)}`, duration: 4000, color: 'danger' });
        } finally {
            setIsScanningList(false);
        }
    };

    return (
        <IonPage className="pantry-page">
            <IonHeader className="ion-no-border">
                <IonToolbar className="nutrition-toolbar">
                    <ModeSwitcher />
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonRefresher slot="fixed" onIonRefresh={loadPantry}>
                    <IonRefresherContent />
                </IonRefresher>

                <div className="pantry-header">
                    <h1 className="pantry-title">Mi Despensa</h1>
                    <p className="pantry-subtitle">{pantryItems.length} productos almacenados</p>
                </div>

                {/* Botón sugerencia IA */}
                <div className="ai-btn-row">
                    <IonButton
                        expand="block"
                        color="tertiary"
                        className="ai-suggest-btn"
                        onClick={getAISuggestion}
                        disabled={loadingAI}
                    >
                        {loadingAI
                            ? <><IonSpinner name="dots" />&nbsp;Analizando...</>
                            : <><IonIcon slot="start" icon={bulbOutline} />🤖 Sugerir comidas</>
                        }
                    </IonButton>
                    <IonButton
                        expand="block"
                        color="secondary"
                        className="ai-scan-btn"
                        onClick={scanShoppingList}
                        disabled={isScanningList}
                    >
                        {isScanningList
                            ? <><IonSpinner name="dots" />&nbsp;Escaneando...</>
                            : <><IonIcon slot="start" icon={cameraOutline} />📸 Escanear compra</>
                        }
                    </IonButton>
                </div>

                {aiSuggestion && (
                    <div className="ai-suggestion-card">
                        <div className="ai-card-header">
                            <span>🤖 Sugerencia de la IA</span>
                            <button className="ai-close" onClick={() => setAiSuggestion('')}>✕</button>
                        </div>
                        <p className="ai-text">{aiSuggestion}</p>
                    </div>
                )}

                {loading ? (
                    <div className="loading-center"><IonSpinner name="crescent" color="success" /></div>
                ) : pantryItems.length === 0 ? (
                    <div className="pantry-empty">
                        <span>🏪</span>
                        <p>Tu despensa está vacía</p>
                        <p className="pantry-empty-sub">Añade productos para que la IA te sugiera comidas</p>
                    </div>
                ) : (
                    <div className="pantry-list">
                        {pantryItems.map(item => (
                            <div key={item.id} className="pantry-item">
                                <div className="pi-info">
                                    <span className="pi-name">{item.food_name}</span>
                                    {item.quantity_g && <span className="pi-qty">{item.quantity_g}g</span>}
                                </div>
                                <button className="pi-delete" onClick={() => setShowDeleteAlert(item.id)}>
                                    <IonIcon icon={trashOutline} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton color="success" onClick={() => setShowAddModal(true)}>
                        <IonIcon icon={addOutline} />
                    </IonFabButton>
                </IonFab>

                {/* Modal añadir a despensa */}
                <IonModal isOpen={showAddModal} onDidDismiss={() => setShowAddModal(false)}>
                    <IonHeader className="ion-no-border">
                        <IonToolbar>
                            <h2 style={{ margin: '0 16px', fontSize: '1.1rem' }}>Añadir a despensa</h2>
                            <IonButton slot="end" fill="clear" onClick={() => setShowAddModal(false)}>
                                <IonIcon icon={closeOutline} />
                            </IonButton>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent style={{ '--background': '#0d1117' }}>
                        <IonSearchbar
                            value={searchQuery}
                            onIonInput={e => handleSearch(e.detail.value || '')}
                            placeholder="Buscar producto..."
                            debounce={400}
                        />
                        {searching && <div className="loading-center"><IonSpinner name="dots" color="success" /></div>}
                        {searchResults.length > 0 && (
                            <IonList>
                                {searchResults.map((food, i) => (
                                    <IonItem key={i} button onClick={() => addToPantry(food)}>
                                        <IonLabel>
                                            <h3>{food.name}</h3>
                                            <p>{food.brand || 'Sin marca'} · {Math.round(food.calories_per_100g)} kcal/100g</p>
                                        </IonLabel>
                                        <IonChip slot="end" color="success">Añadir</IonChip>
                                    </IonItem>
                                ))}
                            </IonList>
                        )}
                    </IonContent>
                </IonModal>

                <IonAlert
                    isOpen={!!showDeleteAlert}
                    header="Eliminar producto"
                    message="¿Eliminar de tu despensa?"
                    buttons={[
                        { text: 'Cancelar', role: 'cancel', handler: () => setShowDeleteAlert(null) },
                        { text: 'Eliminar', role: 'destructive', handler: () => { if (showDeleteAlert) removeFromPantry(showDeleteAlert); setShowDeleteAlert(null); } }
                    ]}
                    onDidDismiss={() => setShowDeleteAlert(null)}
                />
            </IonContent>
        </IonPage>
    );
};

export default Pantry;
