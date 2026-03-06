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

    const activeColor = 'rgba(239, 68, 68, 0.8)'; // Translucent Red
    const inactiveColor = '#1f1f1f'; // Deeper Dark gray for contrast

    const getPathProps = (isActive: boolean) => ({
        fill: isActive ? activeColor : inactiveColor,
        stroke: isActive ? 'rgba(239, 68, 68, 0.6)' : '#2a2a2a',
        strokeWidth: 8,
        strokeLinejoin: 'round' as const,
        strokeLinecap: 'round' as const,
        className: isActive ? 'muscle-pulse' : '',
        style: { transition: 'all 0.4s ease' }
    });

    return (
        <svg viewBox="0 0 200 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
            {/* Head & Neck */}
            <path d="M 100,10 C 112,10 118,20 118,30 C 118,45 108,55 100,55 C 92,55 82,45 82,30 C 82,20 88,10 100,10 Z M 90,52 C 90,65 85,72 75,75 M 110,52 C 110,65 115,72 125,75" {...getPathProps(false)} />

            {/* Shoulders (Deltoids) */}
            <path d="M 75,75 C 60,78 50,88 50,105 C 50,115 55,125 65,120 C 70,110 75,95 85,90 Z" {...getPathProps(isShoulder)} />
            <path d="M 125,75 C 140,78 150,88 150,105 C 150,115 145,125 135,120 C 130,110 125,95 115,90 Z" {...getPathProps(isShoulder)} />

            {/* Chest (Pectorals) */}
            <path d="M 75,75 C 85,85 115,85 125,75 C 128,95 125,115 118,125 C 100,132 100,132 82,125 C 75,115 72,95 75,75 Z" {...getPathProps(isChest)} />

            {/* Core / Abs / Lower Back (V-Taper) */}
            <path d="M 82,125 C 100,132 100,132 118,125 C 112,150 115,180 120,195 C 100,205 100,205 80,195 C 85,180 88,150 82,125 Z" {...getPathProps(isAbs || isBack)} />

            {/* Upper Arms (Biceps/Triceps) */}
            <path d="M 50,105 C 40,120 40,140 45,155 C 55,160 62,150 65,140 C 65,125 65,120 65,120 Z" {...getPathProps(isArms)} />
            <path d="M 150,105 C 160,120 160,140 155,155 C 145,160 138,150 135,140 C 135,125 135,120 135,120 Z" {...getPathProps(isArms)} />

            {/* Forearms */}
            <path d="M 45,155 C 38,175 35,195 40,210 C 50,210 52,190 60,170 C 62,155 60,150 65,140 Z" {...getPathProps(isArms)} />
            <path d="M 155,155 C 162,175 165,195 160,210 C 150,210 148,190 140,170 C 138,155 140,150 135,140 Z" {...getPathProps(isArms)} />

            {/* Upper Legs (Quads/Hamstrings/Glutes) */}
            <path d="M 80,195 C 65,210 65,260 72,285 C 82,290 92,285 96,275 C 100,245 98,215 100,198 Z" {...getPathProps(isLegs)} />
            <path d="M 120,195 C 135,210 135,260 128,285 C 118,290 108,285 104,275 C 100,245 102,215 100,198 Z" {...getPathProps(isLegs)} />

            {/* Lower Legs (Calves) */}
            <path d="M 72,285 C 65,310 65,340 70,365 C 80,365 85,340 90,320 C 95,300 96,285 96,275 Z" {...getPathProps(isLegs)} />
            <path d="M 128,285 C 135,310 135,340 130,365 C 120,365 115,340 110,320 C 105,300 104,285 104,275 Z" {...getPathProps(isLegs)} />
        </svg>
    );
};

export default MuscleMap;
