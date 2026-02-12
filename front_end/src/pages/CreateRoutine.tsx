import React, { useState, useEffect } from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem,
  IonLabel, IonInput, IonButton, IonIcon, IonSpinner, IonCard,
  useIonToast, IonButtons, IonBackButton, IonSegment, IonSegmentButton,
  IonRadioGroup, IonRadio, IonModal, IonSearchbar
} from '@ionic/react';
import { barbellOutline, flashOutline, saveOutline, addCircleOutline, trashOutline, closeOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { getAiRoutine } from '../services/aiService';
import { createRoutine } from '../services/routineService';
import { getAllExercises, Exercise } from '../services/exerciseService';
import './CreateRoutine.css';

const CreateRoutine: React.FC = () => {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [loadingAi, setLoadingAi] = useState(false);
  const [present] = useIonToast();
  const history = useHistory();

  const [catalog, setCatalog] = useState<Exercise[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [routineData, setRoutineData] = useState({
    name: '',
    description: '',
    exerciseInput: '',
    type: 'bodybuilding',
    exercises: [] as any[]
  });

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      const data = await getAllExercises();
      setCatalog(data);
    } catch (error) {
      console.error("Error cargando ejercicios", error);
    }
  };

  const handleAiGeneration = async () => {
    if (!routineData.exerciseInput) {
      present({ message: 'Escribe un ejercicio o grupo muscular', duration: 2000, color: 'warning' });
      return;
    }
    setLoadingAi(true);
    try {
      const response = await getAiRoutine(routineData.exerciseInput, routineData.type);
      // Intentar parsear si viene como string, o usar directo si ya es objeto
      const generated = typeof response === 'string' ? JSON.parse(response) : response;

      setRoutineData({
        ...routineData,
        name: generated.name || routineData.name,
        description: generated.description || routineData.description,
        exercises: generated.exercises || []
      });
      present({ message: '¡Rutina generada!', duration: 2000, color: 'success' });
      setMode('manual'); 
    } catch (error) {
      console.error(error);
      present({ message: 'Error con la IA', duration: 2000, color: 'danger' });
    } finally {
      setLoadingAi(false);
    }
  };

  const openExerciseSelector = () => {
    setIsModalOpen(true);
  };

  const selectExercise = (exercise: Exercise) => {
    const newExercise = { 
      name: exercise.name, 
      series: 4, 
      reps: 10, 
      weight: 0 
    };
    setRoutineData({ ...routineData, exercises: [...routineData.exercises, newExercise] });
    setIsModalOpen(false);
    setSearchTerm('');
  };

  const removeExercise = (index: number) => {
    const newExercises = [...routineData.exercises];
    newExercises.splice(index, 1);
    setRoutineData({ ...routineData, exercises: newExercises });
  };

  const updateExerciseDetail = (index: number, field: string, value: any) => {
    const newExercises = [...routineData.exercises];
    newExercises[index][field] = value;
    setRoutineData({ ...routineData, exercises: newExercises });
  };

  const saveRoutine = async () => {
    if (!routineData.name || routineData.exercises.length === 0) {
      present({ message: 'Pon un nombre y al menos un ejercicio', duration: 2000, color: 'warning' });
      return;
    }
    try {
      await createRoutine(routineData);
      present({ message: 'Rutina guardada correctamente', duration: 2000, color: 'success' });
      setRoutineData({ name: '', description: '', exerciseInput: '', type: 'bodybuilding', exercises: [] });
      history.push('/tabs/myroutines');
    } catch (error) {
      console.error("Error guardando:", error);
      present({ message: 'Error al guardar', duration: 2000, color: 'danger' });
    }
  };

  const filteredCatalog = catalog.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <IonPage id="create-routine-page">
      <IonHeader className="ion-no-border">
        <IonToolbar color="primary">
          <IonButtons slot="start"><IonBackButton defaultHref="/tabs/myroutines" /></IonButtons>
          <IonTitle>Nueva Rutina</IonTitle>
        </IonToolbar>
        <IonToolbar color="primary">
          <IonSegment value={mode} onIonChange={(e) => setMode(e.detail.value as any)}>
            <IonSegmentButton value="manual">
              <IonLabel>Editor</IonLabel>
              <IonIcon icon={barbellOutline} />
            </IonSegmentButton>
            <IonSegmentButton value="ai">
              <IonLabel>Valkyr AI</IonLabel>
              <IonIcon icon={flashOutline} />
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {mode === 'ai' ? (
          <div className="ai-assistant-container">
            <div className="ai-header">
              <div className="ai-badge-pulse"></div>
              <IonLabel>Valkyr Intelligence</IonLabel>
            </div>
            <p className="ai-subtitle">Diseña tu entrenamiento perfecto con IA.</p>
            <IonItem className="custom-ai-input" lines="none">
              <IonInput
                placeholder="Ej: Pierna completa..."
                value={routineData.exerciseInput}
                onIonInput={(e) => setRoutineData({ ...routineData, exerciseInput: e.detail.value! })}
              />
            </IonItem>
            <div className="radio-section">
              <IonRadioGroup value={routineData.type} onIonChange={e => setRoutineData({ ...routineData, type: e.detail.value })}>
                <div className="radio-row">
                  <IonItem lines="none" className="radio-item"><IonLabel>Power</IonLabel><IonRadio slot="start" value="powerlifting" /></IonItem>
                  <IonItem lines="none" className="radio-item"><IonLabel>Bodybuilding</IonLabel><IonRadio slot="start" value="bodybuilding" /></IonItem>
                </div>
              </IonRadioGroup>
            </div>
            <IonButton expand="block" onClick={handleAiGeneration} disabled={loadingAi} className="generate-btn">
              {loadingAi ? <IonSpinner name="dots" /> : 'Generar Entrenamiento'}
            </IonButton>
          </div>
        ) : (
          <>
            <div className="form-section">
              <IonItem lines="full">
                <IonLabel position="stacked">Nombre Rutina</IonLabel>
                <IonInput value={routineData.name} onIonInput={(e) => setRoutineData({ ...routineData, name: e.detail.value! })} />
              </IonItem>
              <IonItem lines="none">
                <IonLabel position="stacked">Descripción</IonLabel>
                <IonInput value={routineData.description} onIonInput={(e) => setRoutineData({ ...routineData, description: e.detail.value! })} />
              </IonItem>
            </div>

            <div className="exercises-list">
              <div className="list-header">
                <h3>Ejercicios ({routineData.exercises.length})</h3>
              </div>
              
              {routineData.exercises.map((ex, idx) => (
                <IonCard key={idx} className="exercise-card-small">
                  <IonItem lines="none">
                    <IonLabel className="ion-text-wrap">
                      <strong className="ex-name-text">{ex.name}</strong>
                    </IonLabel>
                    <IonButton fill="clear" color="danger" slot="end" onClick={() => removeExercise(idx)}>
                      <IonIcon icon={trashOutline} />
                    </IonButton>
                  </IonItem>
                  <div style={{ display: 'flex', gap: '10px', padding: '0 10px 10px 10px' }}>
                    <IonItem lines="none" style={{ flex: 1, '--min-height': '30px' }}>
                        <IonLabel position="stacked" style={{fontSize: '0.8rem'}}>Series</IonLabel>
                        <IonInput type="number" value={ex.series} onIonChange={e => updateExerciseDetail(idx, 'series', parseInt(e.detail.value!))} />
                    </IonItem>
                    <IonItem lines="none" style={{ flex: 1, '--min-height': '30px' }}>
                        <IonLabel position="stacked" style={{fontSize: '0.8rem'}}>Reps</IonLabel>
                        <IonInput type="number" value={ex.reps} onIonChange={e => updateExerciseDetail(idx, 'reps', parseInt(e.detail.value!))} />
                    </IonItem>
                    <IonItem lines="none" style={{ flex: 1, '--min-height': '30px' }}>
                        <IonLabel position="stacked" style={{fontSize: '0.8rem'}}>Kg</IonLabel>
                        <IonInput type="number" value={ex.weight} onIonChange={e => updateExerciseDetail(idx, 'weight', parseFloat(e.detail.value!))} />
                    </IonItem>
                  </div>
                </IonCard>
              ))}

              <IonButton fill="outline" expand="block" onClick={openExerciseSelector} className="add-ex-btn">
                <IonIcon icon={addCircleOutline} slot="start" /> Añadir Ejercicio
              </IonButton>
            </div>

            <IonButton expand="block" color="success" onClick={saveRoutine} className="save-btn" style={{marginTop: '20px'}}>
              <IonIcon icon={saveOutline} slot="start" /> Guardar Rutina
            </IonButton>
          </>
        )}

        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Catálogo de Ejercicios</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsModalOpen(false)}><IonIcon icon={closeOutline} /></IonButton>
              </IonButtons>
            </IonToolbar>
            <IonToolbar>
              <IonSearchbar 
                value={searchTerm} 
                onIonInput={e => setSearchTerm(e.detail.value!)} 
                placeholder="Buscar (ej: Press...)"
              />
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              {filteredCatalog.map((ex) => (
                <IonItem key={ex.id} button onClick={() => selectExercise(ex)}>
                  <IonLabel>
                    <h2>{ex.name}</h2>
                    <p>{ex.muscleGroup} • {ex.equipment}</p>
                  </IonLabel>
                  <IonIcon icon={addCircleOutline} slot="end" color="primary" />
                </IonItem>
              ))}
              {filteredCatalog.length === 0 && (
                <div className="ion-padding ion-text-center">
                  <p>No se encontraron ejercicios.</p>
                </div>
              )}
            </IonList>
          </IonContent>
        </IonModal>

      </IonContent>
    </IonPage>
  );
};

export default CreateRoutine;