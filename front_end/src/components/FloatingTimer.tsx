import React, { useState, useEffect, useRef } from 'react';
import { IonIcon, IonFab, IonFabButton, IonFabList } from '@ionic/react';
import { playOutline, pauseOutline, refreshOutline, addOutline, removeOutline, timerOutline } from 'ionicons/icons';
import './FloatingTimer.css';

interface FloatingTimerProps {
    initialTime?: number; // In seconds
}

const FloatingTimer: React.FC<FloatingTimerProps> = ({ initialTime = 90 }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isActive, setIsActive] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
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
        <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ marginBottom: '60px', marginRight: '10px' }}>
            <IonFabButton color={isActive ? "danger" : "primary"}>
                <IonIcon icon={timerOutline} />
            </IonFabButton>

            <IonFabList side="top">
                <div className="timer-display-bubble">
                    {formatTime(timeLeft)}
                </div>
                <IonFabButton color="light" onClick={toggleTimer}>
                    <IonIcon icon={isActive ? pauseOutline : playOutline} />
                </IonFabButton>
                <IonFabButton color="light" onClick={resetTimer}>
                    <IonIcon icon={refreshOutline} />
                </IonFabButton>
                <IonFabButton color="light" onClick={() => addTime(30)}>
                    <IonIcon icon={addOutline} />
                </IonFabButton>
                <IonFabButton color="light" onClick={() => addTime(-30)}>
                    <IonIcon icon={removeOutline} />
                </IonFabButton>
            </IonFabList>
        </IonFab>
    );
};

export default FloatingTimer;
