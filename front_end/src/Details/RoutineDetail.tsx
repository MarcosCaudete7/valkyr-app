import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem,
    IonLabel, IonCheckbox, IonBackButton, IonButtons, IonSpinner, IonBadge, IonIcon, IonNote, IonButton, IonInput, IonModal, IonSearchbar, IonToggle, IonReorderGroup, IonReorder, IonProgressBar, ItemReorderEventDetail
} from '@ionic/react';
import { clipboardOutline, fitnessOutline, trashOutline, addCircleOutline, closeOutline, informationCircleOutline } from 'ionicons/icons';
import { getRoutineById, updateExerciseStatus, updateRoutine } from '../services/routineService';
import { Routine, ExerciseLine } from '../models/Routine';
import { getAllExercises, Exercise } from '../services/exerciseService';
import MuscleMap from '../components/MuscleMap';
import FloatingTimer from '../components/FloatingTimer';
import './RoutineDetail.css';

const RoutineDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const history = useHistory();
    const [routine, setRoutine] = useState<Routine | null>(null);
    const [loading, setLoading] = useState(true);

    const rawUserData = localStorage.getItem('user');
    const myUsername = rawUserData ? JSON.parse(rawUserData).username : null;

    const [isEditing, setIsEditing] = useState(false);
    const [originalRoutine, setOriginalRoutine] = useState<Routine | null>(null);

    const [catalog, setCatalog] = useState<Exercise[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal de Información del Ejercicio
    const [infoModalExercise, setInfoModalExercise] = useState<{ name: string, muscleGroup: string } | null>(null);

    // Modal Resumen Épico y Rachas
    const [showEpicSummary, setShowEpicSummary] = useState(false);
    const [workedMuscles, setWorkedMuscles] = useState<string[]>([]);
    const [currentStreak, setCurrentStreak] = useState(0);

    // Timestamp para saber cuándo empezó
    const startTimeRef = React.useRef(Date.now());

    useEffect(() => {
        const fetchRoutineAndCatalog = async () => {
            try {
                const data = await getRoutineById(Number(id));

                // Lógica de reseteo DIARIO (a las 00:00)
                let hasChanges = false;
                const todayStr = new Date().toDateString();

                for (let ex of data.exercises) {
                    if (ex.isCompleted) {
                        const savedTimeStr = localStorage.getItem(`ex_${ex.id}_completed_at`);
                        if (savedTimeStr) {
                            const savedTime = parseInt(savedTimeStr, 10);
                            const savedDateStr = new Date(savedTime).toDateString();

                            if (savedDateStr !== todayStr) {
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

    const openExerciseInfo = (exLine: ExerciseLine) => {
        let targetMuscle = '';
        const catInfo = catalog.find(c => c.name.toLowerCase() === exLine.name.toLowerCase());
        if (catInfo) {
            targetMuscle = catInfo.muscleGroup;
        } else {
            targetMuscle = exLine.name; // Fallback
        }

        setInfoModalExercise({
            name: exLine.name,
            muscleGroup: targetMuscle
        });
    };

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
                // Haptic feedback de satisfacción al hacer check
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
            } else { // Si se está desmarcando
                localStorage.removeItem(`ex_${exerciseId}_completed_at`);
            }
        } catch (error) {
            console.error("Error en el servidor, revertiendo...");
            // Aquí podrías recargar los datos del servidor para sincronizar
        }
    };

    const handleFinishWorkout = () => {
        if (!routine) return;
        const completed = routine.exercises.filter(ex => ex.isCompleted);

        if (completed.length === 0) {
            // No se hizo nada
            return;
        }

        // Obtener músculos trabajados mirando el catálogo base
        const muscles = completed.map(ex => {
            const catInfo = catalog.find(c => c.name.toLowerCase() === ex.name.toLowerCase());
            return catInfo ? catInfo.muscleGroup : ex.name;
        });
        setWorkedMuscles(muscles);

        // Lógica de Rachas (Streaks) Valhalla
        const todayStr = new Date().toDateString();
        const lastWorkout = localStorage.getItem('lastWorkoutDate');
        let streak = parseInt(localStorage.getItem('currentStreak') || '0', 10);

        if (lastWorkout !== todayStr) {
            if (lastWorkout) {
                const lastDate = new Date(lastWorkout);
                const today = new Date();
                const diffTime = Math.abs(today.getTime() - lastDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    streak += 1; // Día consecutivo
                } else if (diffDays > 1) {
                    streak = 1; // Racha perdida
                }
            } else {
                streak = 1; // Primer entrenamiento
            }
            localStorage.setItem('lastWorkoutDate', todayStr);
            localStorage.setItem('currentStreak', streak.toString());
        }
        setCurrentStreak(streak);
        setShowEpicSummary(true);
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

    const handleReorder = (event: CustomEvent<ItemReorderEventDetail>) => {
        if (!routine) return;
        const newExercises = [...routine.exercises];
        const itemMove = newExercises.splice(event.detail.from, 1)[0];
        newExercises.splice(event.detail.to, 0, itemMove);
        setRoutine({ ...routine, exercises: newExercises });
        event.detail.complete();
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
                    
                    {/* BARRA DE PROGRESO */}
                    {!isEditing && routine.exercises?.length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.9em', color: 'var(--ion-color-medium)' }}>Progreso del Entrenamiento</span>
                                <span style={{ fontSize: '0.9em', fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>
                                    {Math.round((routine.exercises.filter(ex => ex.isCompleted).length / routine.exercises.length) * 100)}%
                                </span>
                            </div>
                            <IonProgressBar 
                                value={routine.exercises.filter(ex => ex.isCompleted).length / routine.exercises.length} 
                                color="primary" 
                                style={{ height: '8px', borderRadius: '4px' }} 
                            />
                        </div>
                    )}
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
                    <IonReorderGroup disabled={!isEditing} onIonItemReorder={handleReorder}>
                        {(routine.exercises || []).map((ex, idx) => (
                            <IonItem key={idx}>
                                {isEditing && <IonReorder slot="start" />}
                                <IonLabel style={{ overflow: 'visible' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <h2 style={{
                                            fontWeight: 'bold',
                                            textDecoration: !isEditing && ex.isCompleted ? 'line-through' : 'none',
                                            color: !isEditing && ex.isCompleted ? 'var(--ion-color-medium)' : 'var(--ion-color-dark)',
                                            margin: 0
                                        }}>
                                            {ex.name}
                                        </h2>
                                        {!isEditing && (
                                            <IonIcon
                                                icon={informationCircleOutline}
                                                color="primary"
                                                style={{ fontSize: '1.2rem', cursor: 'pointer' }}
                                                onClick={(e) => { e.stopPropagation(); openExerciseInfo(ex); }}
                                            />
                                        )}
                                    </div>
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
                    </IonReorderGroup>
                </IonList>

                {/* Modal de Información del Ejercicio */}
                <IonModal
                    isOpen={!!infoModalExercise}
                    onDidDismiss={() => setInfoModalExercise(null)}
                    breakpoints={[0, 0.5, 0.85, 1]}
                    initialBreakpoint={0.85}
                    handleBehavior="cycle"
                >
                    <IonHeader className="ion-no-border">
                        <IonToolbar>
                            <IonTitle style={{ fontWeight: 'bold' }}>{infoModalExercise?.name}</IonTitle>
                            <IonButtons slot="end">
                                <IonButton onClick={() => setInfoModalExercise(null)}>
                                    <IonIcon icon={closeOutline} />
                                </IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent className="ion-padding">
                        {infoModalExercise && (
                            <div className="exercise-info-container">
                                {/* Zona de Animación */}
                                <div className="exercise-animation-placeholder" style={{ padding: 0 }}>
                                    <img
                                        src={`/assets/exercises/${encodeURIComponent(infoModalExercise.name.toLowerCase().replace(/ /g, '_'))}.gif`}
                                        alt={infoModalExercise.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '16px' }}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = '/assets/exercises/default.gif';
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </IonContent>
                </IonModal>

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

                <FloatingTimer initialTime={90} />

                {/* Finalizar Entrenamiento Button */}
                {!isEditing && routine.exercises.length > 0 && (
                    <div style={{ padding: '20px' }}>
                        <IonButton expand="block" size="large" onClick={handleFinishWorkout} style={{ '--background': 'linear-gradient(90deg, #ef4444, #b91c1c)', '--box-shadow': '0 4px 15px rgba(239, 68, 68, 0.4)' }}>
                            FINALIZAR RUTINA
                        </IonButton>
                    </div>
                )}

                {/* Resumen Épico Modal */}
                <IonModal isOpen={showEpicSummary} onDidDismiss={() => setShowEpicSummary(false)}>
                    <IonContent style={{ '--background': '#0f0f0f' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '20px', textAlign: 'center', background: 'radial-gradient(circle at center, #2a0808 0%, #000 70%)', color: '#fff' }}>
                            <h1 style={{ fontWeight: 900, fontSize: '2.5rem', color: '#ef4444', textShadow: '0 0 15px rgba(239, 68, 68, 0.8)', margin: '0 0 10px 0' }}>¡ENTRENAMIENTO<br />COMPLETADO!</h1>
                            <p style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '20px' }}>
                                Has forjado tu destino.
                            </p>

                            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                                <div style={{ background: '#1a1a1a', padding: '15px 25px', borderRadius: '15px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                    <IonIcon icon={fitnessOutline} style={{ fontSize: '2rem', color: '#ef4444' }} />
                                    <h3 style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>{routine.exercises.filter(e => e.isCompleted).length}</h3>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Ejercicios</span>
                                </div>
                                <div style={{ background: '#1a1a1a', padding: '15px 25px', borderRadius: '15px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                    <div style={{ fontSize: '2rem' }}>🔥</div>
                                    <h3 style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>{currentStreak}</h3>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Días Seguidos</span>
                                </div>
                            </div>

                            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '10px' }}>Zonas Trabajadas</p>
                            <div className="static-map" style={{ width: '100%', height: '300px' }}>
                                <MuscleMap muscleGroup={workedMuscles} />
                            </div>

                            <div style={{ marginTop: 'auto', width: '100%', marginBottom: '20px' }}>
                                <IonButton expand="block" shape="round" color="light" onClick={() => {
                                    setShowEpicSummary(false);
                                    history.replace('/tabs/home');
                                }}>
                                    VOLVER AL INICIO
                                </IonButton>
                            </div>
                        </div>
                    </IonContent>
                </IonModal>

            </IonContent>
        </IonPage>
    );
};

export default RoutineDetail;