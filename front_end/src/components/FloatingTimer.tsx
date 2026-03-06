import React, { useState, useEffect, useRef } from 'react';
import { IonIcon, IonFabButton } from '@ionic/react';
import { playOutline, pauseOutline, refreshOutline, addOutline, removeOutline, timerOutline, closeOutline } from 'ionicons/icons';
import './FloatingTimer.css';

interface FloatingTimerProps {
    initialTime?: number; // In seconds
}

const FloatingTimer: React.FC<FloatingTimerProps> = ({ initialTime = 90 }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isActive, setIsActive] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Pre-carga un sonido corto tipo "ding" (se puede usar un base64 simple o un archivo)
        audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            // Vibrar y sonido al finalizar
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            audioRef.current?.play().catch(e => console.log('Audio error:', e));
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(initialTime);
    };

    const addTime = (seconds: number) => {
        setTimeLeft((prev) => Math.max(0, prev + seconds));
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (!isVisible) return null;

    return (
        <div style={{ position: 'fixed', bottom: '80px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {isOpen && (
                <div style={{ background: 'var(--ion-color-dark)', padding: '10px 15px', borderRadius: '30px', marginBottom: '15px', display: 'flex', gap: '8px', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--ion-color-primary)', marginRight: '10px' }}>
                        {formatTime(timeLeft)}
                    </div>
                    <IonFabButton color="light" size="small" onClick={toggleTimer}>
                        <IonIcon icon={isActive ? pauseOutline : playOutline} />
                    </IonFabButton>
                    <IonFabButton color="light" size="small" onClick={resetTimer}>
                        <IonIcon icon={refreshOutline} />
                    </IonFabButton>
                    <IonFabButton color="light" size="small" onClick={() => addTime(30)}>
                        <IonIcon icon={addOutline} />
                    </IonFabButton>
                    <IonFabButton color="light" size="small" onClick={() => addTime(-30)}>
                        <IonIcon icon={removeOutline} />
                    </IonFabButton>
                    <div style={{ marginLeft: '10px', paddingLeft: '10px', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
                        <IonIcon icon={closeOutline} style={{ fontSize: '1.5rem', cursor: 'pointer', color: '#888' }} onClick={() => setIsOpen(false)} />
                    </div>
                </div>
            )}

            {!isOpen && (
                <IonFabButton color={isActive ? "danger" : "primary"} onClick={() => setIsOpen(true)}>
                    <IonIcon icon={timerOutline} />
                </IonFabButton>
            )}
        </div>
    );
};

export default FloatingTimer;
