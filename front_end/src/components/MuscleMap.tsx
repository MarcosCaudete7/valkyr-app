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

    const activeColor = 'rgba(239, 68, 68, 0.8)'; // Translucent Red targeting
    const inactiveColor = '#e0e0e0'; // Light grey muscle base
    const strokeColor = '#b0b0b0';   // Darker grey for muscle separation

    const getPathProps = (isActive: boolean) => ({
        fill: isActive ? activeColor : inactiveColor,
        stroke: strokeColor,
        strokeWidth: 1.5,
        strokeLinejoin: 'round' as const,
        strokeLinecap: 'round' as const,
        className: isActive ? 'muscle-pulse' : '',
        style: { transition: 'all 0.5s ease-in-out' }
    });

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg viewBox="0 0 200 400" style={{ height: '100%', maxHeight: '400px', width: 'auto', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }} xmlns="http://www.w3.org/2000/svg">

                {/* Head & Neck */}
                <path d="M 90,15 C 90,0 110,0 110,15 C 110,25 106,35 108,45 C 108,50 92,50 92,45 C 94,35 90,25 90,15 Z" fill={inactiveColor} stroke={strokeColor} strokeWidth={1} />

                {/* Trapezius */}
                <path d="M 92,45 C 80,45 75,55 65,60 C 80,55 95,50 100,65 C 105,50 120,55 135,60 C 125,55 120,45 108,45 Z" fill={inactiveColor} stroke={strokeColor} strokeWidth={1} />

                {/* Deltoids (Shoulders) */}
                <path d="M 65,60 C 50,65 45,75 48,95 C 55,95 62,85 68,75 C 65,70 65,65 65,60 Z" {...getPathProps(isShoulder)} />
                <path d="M 135,60 C 150,65 155,75 152,95 C 145,95 138,85 132,75 C 135,70 135,65 135,60 Z" {...getPathProps(isShoulder)} />

                {/* Pectorals (Chest) */}
                <path d="M 68,75 C 62,85 65,100 75,105 C 85,110 95,105 98,90 C 100,75 100,75 100,65 C 95,50 80,55 68,75 Z" {...getPathProps(isChest)} />
                <path d="M 132,75 C 138,85 135,100 125,105 C 115,110 105,105 102,90 C 100,75 100,75 100,65 C 105,50 120,55 132,75 Z" {...getPathProps(isChest)} />

                {/* Abdominals (Core) */}
                <path d="M 75,105 C 85,110 95,105 98,90 C 100,105 100,135 98,150 C 85,145 78,130 75,105 Z" {...getPathProps(isAbs)} />
                <path d="M 125,105 C 115,110 105,105 102,90 C 100,105 100,135 102,150 C 115,145 122,130 125,105 Z" {...getPathProps(isAbs)} />
                <path d="M 78,130 C 85,145 98,150 100,175 C 90,170 82,155 78,130 Z" {...getPathProps(isAbs)} />
                <path d="M 122,130 C 115,145 102,150 100,175 C 110,170 118,155 122,130 Z" {...getPathProps(isAbs)} />

                {/* Obliques / Lats (Back/Side Core) */}
                <path d="M 65,100 C 60,120 65,140 78,130 C 75,105 68,105 65,100 Z" {...getPathProps(isBack || isAbs)} />
                <path d="M 135,100 C 140,120 135,140 122,130 C 125,105 132,105 135,100 Z" {...getPathProps(isBack || isAbs)} />

                {/* Biceps/Triceps (Upper Arms) */}
                <path d="M 48,95 C 40,115 38,135 45,150 C 50,145 58,130 60,110 C 62,95 55,95 48,95 Z" {...getPathProps(isArms)} />
                <path d="M 152,95 C 160,115 162,135 155,150 C 150,145 142,130 140,110 C 138,95 145,95 152,95 Z" {...getPathProps(isArms)} />

                {/* Forearms */}
                <path d="M 45,150 C 35,180 30,200 40,215 C 45,215 52,185 55,165 C 58,150 50,145 45,150 Z" {...getPathProps(isArms)} />
                <path d="M 155,150 C 165,180 170,200 160,215 C 155,215 148,185 145,165 C 142,150 150,145 155,150 Z" {...getPathProps(isArms)} />

                {/* Hands */}
                <path d="M 40,215 C 35,230 40,240 45,240 C 50,240 50,225 45,215 Z" fill={inactiveColor} />
                <path d="M 160,215 C 165,230 160,240 155,240 C 150,240 150,225 155,215 Z" fill={inactiveColor} />

                {/* Quadriceps (Upper Legs) */}
                <path d="M 82,155 C 65,175 60,230 70,270 C 80,280 95,270 98,250 C 100,210 100,175 82,155 Z" {...getPathProps(isLegs)} />
                <path d="M 118,155 C 135,175 140,230 130,270 C 120,280 105,270 102,250 C 100,210 100,175 118,155 Z" {...getPathProps(isLegs)} />

                {/* Calves (Lower Legs) */}
                <path d="M 70,270 C 60,310 65,360 75,375 C 85,375 92,340 95,300 C 98,280 80,280 70,270 Z" {...getPathProps(isLegs)} />
                <path d="M 130,270 C 140,310 135,360 125,375 C 115,375 108,340 105,300 C 102,280 120,280 130,270 Z" {...getPathProps(isLegs)} />

                {/* Feet */}
                <path d="M 75,375 C 65,385 70,395 85,395 C 95,395 95,385 85,375 Z" fill={inactiveColor} />
                <path d="M 125,375 C 135,385 130,395 115,395 C 105,395 105,385 115,375 Z" fill={inactiveColor} />

            </svg>
        </div>
    );
};

export default MuscleMap;
