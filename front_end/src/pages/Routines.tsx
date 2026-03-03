import React, { useEffect, useState, useCallback } from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem,
  IonLabel, IonCheckbox, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonBadge, IonRefresher, IonRefresherContent, IonSpinner, IonIcon,
  IonButton, IonText, IonSegment, IonSegmentButton,
  IonNote
} from '@ionic/react';
import { refreshOutline, fitnessOutline, calendarOutline, clipboardOutline, addOutline, listOutline } from 'ionicons/icons';
import { getMyRoutines, updateExerciseStatus } from '../services/routineService';
import { Routine } from '../models/Routine';
import CreateRoutine from './CreateRoutine'; // Added import for CreateRoutine
import './Routines.css';

const Routines: React.FC = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

  const loadRoutines = useCallback(async (event?: CustomEvent) => {
    if (!event) setLoading(true);
    try {
      const data = await getMyRoutines();

      const now = Date.now();
      const TWELVE_HOURS = 12 * 60 * 60 * 1000;

      for (let routine of data) {
        for (let ex of routine.exercises) {
          if (ex.isCompleted) {
            const savedTimeStr = localStorage.getItem(`ex_${ex.id}_completed_at`);
            if (savedTimeStr) {
              const savedTime = parseInt(savedTimeStr, 10);
              if (now - savedTime > TWELVE_HOURS) {
                ex.isCompleted = false;
                try {
                  await updateExerciseStatus(ex.id, false);
                  localStorage.removeItem(`ex_${ex.id}_completed_at`);
                } catch (e) {
                  console.error("Failed to auto-uncheck", e);
                }
              }
            }
          }
        }
      }

      setRoutines(data);
    } catch (error) {
      console.error("Error cargando rutinas", error);
    } finally {
      setLoading(false);
      if (event) event.detail.complete();
    }
  }, []);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  const handleToggle = async (routineId: number, exerciseId: number, currentStatus: boolean) => {
    const updated = routines.map(r => r.id === routineId ? {
      ...r,
      exercises: r.exercises.map(ex => ex.id === exerciseId ? { ...ex, isCompleted: !currentStatus } : ex)
    } : r);

    setRoutines(updated);

    try {
      await updateExerciseStatus(exerciseId, !currentStatus);
    } catch (error) {
      console.error("Fallo al actualizar", error);
      loadRoutines();
    }
  };

  return (
    <IonPage id="routines-page">
      <IonHeader className="ion-no-border">
        <IonToolbar color="primary">
          <IonTitle className="main-title">Mis Entrenamientos</IonTitle>
          <IonButton slot="end" fill="clear" onClick={() => loadRoutines()}>
            <IonIcon icon={refreshOutline} color="light" />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen color="light">
        <IonRefresher slot="fixed" onIonRefresh={loadRoutines}>
          <IonRefresherContent refreshingSpinner="crescent" />
        </IonRefresher>

        <div className="header-background-gradient"></div>

        <IonSegment
          value={activeTab}
          onIonChange={(e) => setActiveTab(e.detail.value as 'list' | 'create')}
          style={{ margin: '10px 15px', width: 'calc(100% - 30px)', background: 'var(--ion-color-white)', borderRadius: '8px' }}
        >
          <IonSegmentButton value="list">
            <IonLabel style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <IonIcon icon={listOutline} /> Mis Rutinas
            </IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="create">
            <IonLabel style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <IonIcon icon={addOutline} /> Crear Rutina
            </IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {activeTab === 'create' ? (
          <div style={{ marginTop: '10px' }}>
            <CreateRoutine onComplete={() => setActiveTab('list')} />
          </div>
        ) : loading && routines.length === 0 ? (
          <div className="centered-container">
            <IonSpinner name="crescent" color="primary" />
          </div>
        ) : (
          <div className="routines-container">
            {routines.map(routine => (
              <IonCard
                key={routine.id}
                className="routine-card-full"
                routerLink={`routine/${routine.id}`}
                button
              >
                <IonCardHeader>
                  <div className="card-top">
                    <IonBadge color="secondary" mode="ios" className="custom-badge">
                      <IonIcon icon={calendarOutline} />
                      {routine.createdAt ? new Date(routine.createdAt).toLocaleDateString() : '23/1/2026'}
                    </IonBadge>
                    <div className="muscle-tags">
                      {routine.muscles?.map(m => (
                        <IonBadge key={m} className="tag">{m}</IonBadge>
                      ))}
                    </div>
                  </div>
                  <IonCardTitle className="routine-title">{routine.name}</IonCardTitle>
                  <IonText color="dark">
                    <p className="routine-description">{routine.description || 'Sin descripción'}</p>
                  </IonText>
                </IonCardHeader>

                <IonCardContent>
                  <div className="section-divider">
                    <IonIcon icon={clipboardOutline} />
                    <span>Vista previa de ejercicios</span>
                  </div>

                  <IonList lines="none" className="exercise-list">
                    {(routine.exercises || []).slice(0, 3).map(ex => (
                      <IonItem key={ex.id} className="exercise-preview-item">
                        <IonLabel>
                          <h2 className={`ex-name ${ex.isCompleted ? 'text-strikethrough' : ''}`}>
                            {ex.name}
                          </h2>
                        </IonLabel>
                        {ex.isCompleted && <IonBadge color="success" slot="end">Listo</IonBadge>}
                      </IonItem>
                    ))}
                    {(routine.exercises || []).length > 3 && (
                      <IonNote className="ion-padding-start">
                        + {(routine.exercises || []).length - 3} ejercicios más...
                      </IonNote>
                    )}
                  </IonList>
                </IonCardContent>
              </IonCard>
            ))}
            <div style={{ height: '80px' }}></div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Routines;