import React, { useEffect, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem,
  IonLabel, IonCheckbox, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonBadge, IonRefresher, IonRefresherContent, IonSpinner, IonNote, IonIcon, IonButton
} from '@ionic/react';
import { refreshOutline, fitnessOutline } from 'ionicons/icons';
import { getMyRoutines, updateExerciseStatus } from '../services/routineService';
import { Routine } from '../models/Routine';

const Routines: React.FC = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async (event?: CustomEvent) => {
    setLoading(true);
    try {
      const data = await getMyRoutines();
      console.log("DATOS RECIBIDOS DEL BACKEND:", data);
      setRoutines(data);
    } catch (error) {
      console.error("Error cargando rutinas", error);
    } finally {
      setLoading(false);
      if (event) event.detail.complete(); // Detiene el refresher si se usó
    }
  };

  const toggleExercise = async (routineId: number, exerciseId: number, currentStatus: boolean) => {
    try {
      // Actualización Inmutable (Correcta para React)
      const updatedRoutines = routines.map(r => {
        if (r.id === routineId) {
          return {
            ...r,
            exercises: r.exercises.map(ex =>
              ex.id === exerciseId ? { ...ex, isCompleted: !currentStatus } : ex
            )
          };
        }
        return r;
      });
      setRoutines(updatedRoutines);
      await updateExerciseStatus(exerciseId, !currentStatus);
    } catch (error) {
      alert("Error al actualizar");
      loadRoutines();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Valkyr Routines</IonTitle>
          {/* Botón de refresco manual en la cabecera */}
          <IonButton slot="end" fill="clear" onClick={() => loadRoutines()}>
            <IonIcon icon={refreshOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Refresher: Desliza hacia abajo para recargar */}
        <IonRefresher slot="fixed" onIonRefresh={(e) => loadRoutines(e)}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {/* Estado de carga */}
        {loading && routines.length === 0 && (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="crescent" />
            <p>Buscando tus entrenamientos...</p>
          </div>
        )}

        {/* Mensaje si no hay datos */}
        {!loading && routines.length === 0 && (
          <div className="ion-text-center ion-padding" style={{ marginTop: '20%' }}>
            <IonIcon icon={fitnessOutline} style={{ fontSize: '64px', color: '#ccc' }} />
            <h2>No hay rutinas</h2>
            <p>Asegúrate de tener datos en la DB para este usuario.</p>
          </div>
        )}

        {/* Listado de Rutinas */}
        {routines.map(routine => (
          <IonCard key={routine.id}>
            <IonCardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <IonCardTitle>{routine.name}</IonCardTitle>
                <IonNote>
                  {routine.createdAt
                    ? new Date(routine.createdAt).toLocaleDateString()
                    : 'Sin fecha'}
                </IonNote>
              </div>
              {/* Pintamos los músculos si vienen en el DTO */}
              <div style={{ marginTop: '8px' }}>
                {routine.muscles?.map(m => (
                  <IonBadge key={m} color="primary" style={{ marginRight: '5px' }}>{m}</IonBadge>
                ))}
              </div>
            </IonCardHeader>

            <IonCardContent>
              <p>{routine.description || 'Sin descripción'}</p>
              <IonList lines="full">
                {routine.exercises.map(ex => (
                  <IonItem key={ex.id}>
                    <IonLabel>
                      <h3 style={{ textDecoration: ex.isCompleted ? 'line-through' : 'none' }}>
                        {ex.name}
                      </h3>
                      <p>{ex.series}x{ex.reps} • {ex.weight}kg</p>
                    </IonLabel>
                    <IonCheckbox
                      checked={ex.isCompleted}
                      onIonChange={() => toggleExercise(routine.id, ex.id, ex.isCompleted)}
                    />
                  </IonItem>
                ))}
              </IonList>
            </IonCardContent>
          </IonCard>
        ))}
      </IonContent>
    </IonPage>
  );
};

export default Routines;