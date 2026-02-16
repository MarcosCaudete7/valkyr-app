import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem,
    IonLabel, IonCheckbox, IonBackButton, IonButtons, IonSpinner, IonBadge, IonIcon, IonNote
} from '@ionic/react';
import { clipboardOutline, fitnessOutline } from 'ionicons/icons';
import { getRoutineById, updateExerciseStatus } from '../services/routineService';
import { Routine } from '../models/Routine';

const RoutineDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [routine, setRoutine] = useState<Routine | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoutine = async () => {
            try {
                const data = await getRoutineById(Number(id));
                setRoutine(data);
            } catch (error) {
                console.error("Error al obtener la rutina", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRoutine();
    }, [id]);

    const handleToggle = async (exerciseId: number, currentStatus: boolean) => {
        if (!routine) return;

        // Actualización optimista de la UI
        const updatedExercises = routine.exercises.map(ex =>
            ex.id === exerciseId ? { ...ex, isCompleted: !currentStatus } : ex
        );
        setRoutine({ ...routine, exercises: updatedExercises });

        try {
            await updateExerciseStatus(exerciseId, !currentStatus);
        } catch (error) {
            console.error("Error en el servidor, revertiendo...");
            // Aquí podrías recargar los datos del servidor para sincronizar
        }
    };

    if (loading) return (
        <IonPage>
            <div className="centered-container"><IonSpinner name="crescent" /></div>
        </IonPage>
    );

    if (!routine) return <IonPage><div className="centered-container">No se encontró la rutina</div></IonPage>;

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar color="primary">
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/routines" text="Volver" />
                    </IonButtons>
                    <IonTitle>Entrenamiento</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding">
                <div className="detail-header">
                    <h1>{routine.name}</h1>
                    <p>{routine.description || 'Sin descripción'}</p>
                    <IonBadge color="secondary">{routine.exercises?.length || 0} Ejercicios</IonBadge>
                </div>

                <div className="section-divider" style={{ marginTop: '20px' }}>
                    <IonIcon icon={fitnessOutline} />
                    <span>Lista de Ejercicios</span>
                </div>

                <IonList lines="full">
                    {(routine.exercises || []).map(ex => (
                        <IonItem key={ex.id}>
                            <IonLabel>
                                <h2 style={{
                                    fontWeight: 'bold',
                                    textDecoration: ex.isCompleted ? 'line-through' : 'none',
                                    color: ex.isCompleted ? 'var(--ion-color-medium)' : 'var(--ion-color-dark)'
                                }}>
                                    {ex.name}
                                </h2>
                                <p>{ex.series} series x {ex.reps} reps • {ex.weight}kg</p>
                            </IonLabel>
                            <IonCheckbox
                                slot="end"
                                checked={ex.isCompleted}
                                onIonChange={() => handleToggle(ex.id, ex.isCompleted)}
                            />
                        </IonItem>
                    ))}
                </IonList>
            </IonContent>
        </IonPage>
    );
};

export default RoutineDetail;