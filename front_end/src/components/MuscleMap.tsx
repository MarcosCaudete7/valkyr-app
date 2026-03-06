import React from 'react';

interface MuscleMapProps {
    muscleGroup: string | string[];
}

const MuscleMap: React.FC<MuscleMapProps> = ({ muscleGroup }) => {
    // Normalize muscle group to a single lowercase string for easy matching
    const target = Array.isArray(muscleGroup) ? muscleGroup.join(' ').toLowerCase() : muscleGroup.toLowerCase();

    const isChest = target.includes('pecho') || target.includes('chest');
    const isBack = target.includes('espalda') || target.includes('back');
    const isArms = target.includes('brazo') || target.includes('biceps') || target.includes('triceps');
    const isLegs = target.includes('pierna') || target.includes('cuadriceps') || target.includes('gluteo') || target.includes('femoral');
    const isShoulder = target.includes('hombro') || target.includes('shoulder');
    const isAbs = target.includes('abs') || target.includes('abdominal');

    const activeColor = '#ef4444'; // Bright Red from Tailwind palette
    const inactiveColor = '#333333'; // Dark gray

    return (
        <svg viewBox="0 0 200 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            {/* Base body shape - Dark outline/base */}
            <path d="M 100,20 C 110,20 115,28 115,35 C 115,45 105,50 100,50 C 95,50 85,45 85,35 C 85,28 90,20 100,20 Z" fill={inactiveColor} /> {/* Head */}

            <path d="M 85,50 L 115,50 L 130,65 L 130,90 L 70,90 L 70,65 Z" fill={isShoulder ? activeColor : inactiveColor} /> {/* Shoulders */}

            <path d="M 75,90 L 125,90 L 120,130 L 80,130 Z" fill={isChest ? activeColor : inactiveColor} /> {/* Chest */}

            <path d="M 80,130 L 120,130 L 115,180 L 85,180 Z" fill={isAbs || isBack ? activeColor : inactiveColor} /> {/* Abs/Lower Back */}

            <path d="M 70,90 C 60,110 50,130 50,150 L 65,150 L 75,90 Z" fill={isArms ? activeColor : inactiveColor} /> {/* Left Arm */}
            <path d="M 130,90 C 140,110 150,130 150,150 L 135,150 L 125,90 Z" fill={isArms ? activeColor : inactiveColor} /> {/* Right Arm */}

            <path d="M 50,150 L 40,200 L 55,200 L 65,150 Z" fill={isArms ? activeColor : inactiveColor} /> {/* Left Forearm */}
            <path d="M 150,150 L 160,200 L 145,200 L 135,150 Z" fill={isArms ? activeColor : inactiveColor} /> {/* Right Forearm */}

            <path d="M 85,180 C 70,200 70,260 75,280 L 95,280 L 100,180 Z" fill={isLegs ? activeColor : inactiveColor} /> {/* Left Thigh */}
            <path d="M 115,180 C 130,200 130,260 125,280 L 105,280 L 100,180 Z" fill={isLegs ? activeColor : inactiveColor} /> {/* Right Thigh */}

            <path d="M 75,280 L 70,360 L 90,360 L 95,280 Z" fill={isLegs ? activeColor : inactiveColor} /> {/* Left Calf */}
            <path d="M 125,280 L 130,360 L 110,360 L 105,280 Z" fill={isLegs ? activeColor : inactiveColor} /> {/* Right Calf */}
        </svg>
    );
};

export default MuscleMap;
