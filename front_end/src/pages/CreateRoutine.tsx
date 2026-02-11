import React, { useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem,
  IonLabel, IonInput, IonButton, IonIcon, IonSpinner, IonCard, IonCardContent,
  useIonToast, IonButtons, IonBackButton, IonSegment, IonSegmentButton,
  IonRadioGroup, IonRadio, IonListHeader
} from '@ionic/react';
import { barbellOutline, flashOutline, saveOutline, addCircleOutline, trashOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { getAiRoutine } from '../services/aiService';
import { createRoutine } from '../services/routineService';
import './CreateRoutine.css';

const CreateRoutine: React.FC = () => {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [loadingAi, setLoadingAi] = useState(false);
  const [present] = useIonToast();
  const history = useHistory();

  const [routineData, setRoutineData] = useState({
    name: '',
    description: '',
    exerciseInput: '',
    type: 'bodybuilding',
    exercises: [] as any[]
  });

  const handleAiGeneration = async () => {
    if (!routineData.exerciseInput) {
      present({ message: 'Escribe un ejercicio o grupo muscular', duration: 2000, color: 'warning' });
      return;
    }
    setLoadingAi(true);
    try {
      const response = await getAiRoutine(routineData.exerciseInput, routineData.type);
      const generated = typeof response === 'string' ? JSON.parse(response) : response;

      setRoutineData({
        ...routineData,
        name: generated.name || routineData.name,
        description: generated.description || routineData.description,
        exercises: generated.exercises || []
      });
      present({ message: '¡Rutina generada!', duration: 2000, color: 'success' });
    } catch (error) {
      console.error(error);
      present({ message: 'Error con la IA', duration: 2000, color: 'danger' });
    } finally {
      setLoadingAi(false);
    }
  };

  const addEmptyExercise = () => {
    const newExercise = { name: 'Nuevo Ejercicio', series: 3, reps: 10, weight: 0 };
    setRoutineData({ ...routineData, exercises: [...routineData.exercises, newExercise] });
  };

  const removeExercise = (index: number) => {
    const newExercises = [...routineData.exercises];
    newExercises.splice(index, 1);
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
      present({ message: 'Error al guardar en el servidor', duration: 2000, color: 'danger' });
    }
  };

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
              <IonLabel>Manual</IonLabel>
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
        {mode === 'ai' && (
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
                  <IonItem lines="none" className="radio-item">
                    <IonLabel>Power (Fuerza)</IonLabel>
                    <IonRadio slot="start" value="powerlifting" />
                  </IonItem>
                  <IonItem lines="none" className="radio-item">
                    <IonLabel>Hipertrofia</IonLabel>
                    <IonRadio slot="start" value="bodybuilding" />
                  </IonItem>
                </div>
              </IonRadioGroup>
            </div>

            <IonButton expand="block" onClick={handleAiGeneration} disabled={loadingAi} className="generate-btn">
              {loadingAi ? <IonSpinner name="dots" /> : 'Generar Entrenamiento'}
            </IonButton>
          </div>
        )}

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
                <IonLabel>
                  <strong className="ex-name-text">{ex.name}</strong>
                  <p className="ex-details-text">{ex.series} series • {ex.reps} reps • {ex.weight}kg</p>
                </IonLabel>
                <IonButton fill="clear" color="danger" slot="end" onClick={() => removeExercise(idx)}>
                  <IonIcon icon={trashOutline} />
                </IonButton>
              </IonItem>
            </IonCard>
          ))}
          <IonButton fill="outline" expand="block" onClick={addEmptyExercise} className="add-ex-btn">
            <IonIcon icon={addCircleOutline} slot="start" /> Añadir Ejercicio
          </IonButton>
        </div>

        <IonButton expand="block" color="success" onClick={saveRoutine} className="save-btn">
          <IonIcon icon={saveOutline} slot="start" /> Guardar Rutina
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default CreateRoutine;