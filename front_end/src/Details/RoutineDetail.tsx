import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem,
    IonLabel, IonCheckbox, IonBackButton, IonButtons, IonSpinner, IonBadge, IonIcon, IonNote, IonButton, IonInput, IonModal, IonSearchbar, IonToggle
} from '@ionic/react';
import { clipboardOutline, fitnessOutline, trashOutline, addCircleOutline, closeOutline } from 'ionicons/icons';
import { getRoutineById, updateExerciseStatus, updateRoutine } from '../services/routineService';
import { Routine, ExerciseLine } from '../models/Routine';
import { getAllExercises, Exercise } from '../services/exerciseService';

const RoutineDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [routine, setRoutine] = useState<Routine | null>(null);
    const [loading, setLoading] = useState(true);

    const rawUserData = localStorage.getItem('user');
    const myUsername = rawUserData ? JSON.parse(rawUserData).username : null;

    const [isEditing, setIsEditing] = useState(false);
    const [originalRoutine, setOriginalRoutine] = useState<Routine | null>(null);

    const [catalog, setCatalog] = useState<Exercise[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRoutineAndCatalog = async () => {
            try {
                const data = await getRoutineById(Number(id));

                // Expiration logic
                let hasChanges = false;
                const now = Date.now();
                const TWELVE_HOURS = 12 * 60 * 60 * 1000;

                for (let ex of data.exercises) {
                    if (ex.isCompleted) {
                        const savedTimeStr = localStorage.getItem(`ex_${ex.id}_completed_at`);
                        if (savedTimeStr) {
                            const savedTime = parseInt(savedTimeStr, 10);
                            if (now - savedTime > TWELVE_HOURS) {
                                ex.isCompleted = false;
                                hasChanges = true;
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

                setRoutine(data);
                setOriginalRoutine(data);

                const exData = await getAllExercises();
                setCatalog(exData);
            } catch (error) {
                console.error("Error al obtener la rutina o catálogo", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRoutineAndCatalog();
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
            if (!currentStatus) { // Si se está marcando como completado
                localStorage.setItem(`ex_${exerciseId}_completed_at`, Date.now().toString());
            } else { // Si se está desmarcando
                localStorage.removeItem(`ex_${exerciseId}_completed_at`);
            }
        } catch (error) {
            console.error("Error en el servidor, revertiendo...");
            // Aquí podrías recargar los datos del servidor para sincronizar
        }
    };

    const handleSave = async () => {
        if (!routine) return;
        setLoading(true);
        try {
            const updated = await updateRoutine(routine.id, routine);
            setRoutine(updated);
            setOriginalRoutine(updated);
            setIsEditing(false);
        } catch (error) {
            console.error("Error al guardar la rutina", error);
        } finally {
            setLoading(false);
        }
    }

    const handleCancel = () => {
        setRoutine(originalRoutine);
        setIsEditing(false);
    }

    const removeExercise = (index: number) => {
        if (!routine) return;
        const newExercises = [...routine.exercises];
        newExercises.splice(index, 1);
        setRoutine({ ...routine, exercises: newExercises });
    };

    const updateExerciseDetail = (index: number, field: string, value: any) => {
        if (!routine) return;
        const newExercises = [...routine.exercises];
        (newExercises[index] as any)[field] = value;
        setRoutine({ ...routine, exercises: newExercises });
    };

    const selectExercise = (exercise: Exercise) => {
        if (!routine) return;
        const newExercise: ExerciseLine = {
            id: Date.now(), // Uso temporal de id para front
            name: exercise.name,
            series: 4,
            reps: 10,
            weight: 0,
            isCompleted: false
        };
        setRoutine({ ...routine, exercises: [...routine.exercises, newExercise] });
        setIsModalOpen(false);
        setSearchTerm('');
    };

    const filteredCatalog = catalog.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <IonTitle>{isEditing ? 'Editar Rutina' : 'Entrenamiento'}</IonTitle>
                    <IonButtons slot="end">
                        {routine.creatorName === myUsername && (
                            !isEditing ? (
                                <IonButton onClick={() => setIsEditing(true)}>Editar</IonButton>
                            ) : (
                                <>
                                    <IonButton onClick={handleCancel}>Cancelar</IonButton>
                                    <IonButton onClick={handleSave} color="success">Guardar</IonButton>
                                </>
                            )
                        )}
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding">
                <div className="detail-header">
                    <h1>
                        {isEditing ? (
                            <IonInput
                                value={routine.name}
                                onIonInput={e => setRoutine({ ...routine, name: e.detail.value! })}
                                style={{ fontSize: '1.5em', fontWeight: 'bold' }}
                            />
                        ) : routine.name}
                    </h1>
                    {isEditing ? (
                        <div style={{ marginTop: '10px' }}>
                            <IonInput
                                value={routine.description}
                                onIonInput={e => setRoutine({ ...routine, description: e.detail.value! })}
                                placeholder="Descripción"
                            />
                            <IonItem lines="none" style={{ marginTop: '10px', padding: 0 }}>
                                <IonLabel>Pública</IonLabel>
                                <IonToggle checked={routine.isPublic} onIonChange={e => setRoutine({ ...routine, isPublic: e.detail.checked })} />
                            </IonItem>
                        </div>
                    ) : (
                        <p>{routine.description || 'Sin descripción'}</p>
                    )}
                    <IonBadge color="secondary">{routine.exercises?.length || 0} Ejercicios</IonBadge>
                    {routine.isPublic && !isEditing && <IonBadge color="success" style={{ marginLeft: '10px' }}>Pública</IonBadge>}
                </div>

                <div className="section-divider" style={{ marginTop: '20px' }}>
                    <IonIcon icon={fitnessOutline} />
                    <span>Lista de Ejercicios</span>
                    {isEditing && (
                        <IonButton size="small" fill="outline" onClick={() => setIsModalOpen(true)} style={{ marginLeft: 'auto' }}>
                            <IonIcon icon={addCircleOutline} slot="start" /> Añadir
                        </IonButton>
                    )}
                </div>

                <IonList lines="full">
                    {(routine.exercises || []).map((ex, idx) => (
                        <IonItem key={idx}>
                            <IonLabel>
                                <h2 style={{
                                    fontWeight: 'bold',
                                    textDecoration: !isEditing && ex.isCompleted ? 'line-through' : 'none',
                                    color: !isEditing && ex.isCompleted ? 'var(--ion-color-medium)' : 'var(--ion-color-dark)'
                                }}>
                                    {ex.name}
                                </h2>
                                {isEditing ? (
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '0.8em', color: 'gray' }}>Series</label>
                                            <IonInput type="number" value={ex.series} onIonChange={e => updateExerciseDetail(idx, 'series', parseInt(e.detail.value!))} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '0.8em', color: 'gray' }}>Reps</label>
                                            <IonInput type="number" value={ex.reps} onIonChange={e => updateExerciseDetail(idx, 'reps', parseInt(e.detail.value!))} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '0.8em', color: 'gray' }}>Kg</label>
                                            <IonInput type="number" value={ex.weight} onIonChange={e => updateExerciseDetail(idx, 'weight', parseFloat(e.detail.value!))} />
                                        </div>
                                    </div>
                                ) : (
                                    <p>{ex.series} series x {ex.reps} reps • {ex.weight}kg</p>
                                )}
                            </IonLabel>
                            {isEditing ? (
                                <IonButton fill="clear" color="danger" slot="end" onClick={() => removeExercise(idx)}>
                                    <IonIcon icon={trashOutline} />
                                </IonButton>
                            ) : (
                                <IonCheckbox
                                    slot="end"
                                    checked={ex.isCompleted}
                                    onIonChange={() => handleToggle(ex.id, ex.isCompleted)}
                                />
                            )}
                        </IonItem>
                    ))}
                </IonList>

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
                                placeholder="Buscar (ej: Press... o Pecho)"
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

export default RoutineDetail;