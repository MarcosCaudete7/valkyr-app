import React, { useEffect, useState, useCallback } from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem,
  IonLabel, IonCheckbox, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonBadge, IonRefresher, IonRefresherContent, IonSpinner, IonIcon,
  IonButton, IonText,
  IonNote
} from '@ionic/react';
import { refreshOutline, fitnessOutline, calendarOutline, clipboardOutline } from 'ionicons/icons';
import { getMyRoutines, updateExerciseStatus } from '../services/routineService';
import { Routine } from '../models/Routine';
import './Routines.css';

const Routines: React.FC = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadRoutines = useCallback(async (event?: CustomEvent) => {
    if (!event) setLoading(true);
    try {
      const data = await getMyRoutines();
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

        {loading && routines.length === 0 ? (
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
                    {routine.exercises.slice(0, 3).map(ex => ( // Mostramos solo los 3 primeros como preview
                      <IonItem key={ex.id} className="exercise-preview-item">
                        <IonLabel>
                          <h2 className={`ex-name ${ex.isCompleted ? 'text-strikethrough' : ''}`}>
                            {ex.name}
                          </h2>
                        </IonLabel>
                        {/* QUITAMOS EL CHECKBOX DE AQUÍ PARA EVITAR CONFLICTOS DE NAVEGACIÓN */}
                        {ex.isCompleted && <IonBadge color="success" slot="end">Listo</IonBadge>}
                      </IonItem>
                    ))}
                    {routine.exercises.length > 3 && (
                      <IonNote className="ion-padding-start">
                        + {routine.exercises.length - 3} ejercicios más...
                      </IonNote>
                    )}
                  </IonList>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Routines;