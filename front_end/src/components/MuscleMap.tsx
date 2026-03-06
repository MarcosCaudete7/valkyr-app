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

    const activeColor = 'rgba(239, 68, 68, 0.7)'; // Translucent Neon Red
    const inactiveColor = '#cfcfcf'; // Lighter medical grey
    const strokeColor = '#909090';   // Darker grey for muscle separation
    const innerStroke = '#b8b8b8';   // For internal muscle striations

    const getPathProps = (isActive: boolean) => ({
        fill: isActive ? activeColor : inactiveColor,
        stroke: strokeColor,
        strokeWidth: 1.2,
        strokeLinejoin: 'round' as const,
        strokeLinecap: 'round' as const,
        className: isActive ? 'muscle-pulse' : '',
        style: { transition: 'all 0.5s ease-in-out' }
    });

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg viewBox="0 0 200 400" style={{ height: '100%', maxHeight: '400px', width: 'auto', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.6))' }} xmlns="http://www.w3.org/2000/svg">

                {/* Head & Neck */}
                <path d="M 88,10 C 88,-2 112,-2 112,10 C 112,22 108,32 110,42 C 110,50 90,50 90,42 C 92,32 88,22 88,10 Z" fill={inactiveColor} stroke={strokeColor} strokeWidth={1} />
                <path d="M 94,15 C 94,20 106,20 106,15" fill="none" stroke={innerStroke} strokeWidth={0.5} /> {/* Eyes line */}

                {/* Trapezius */}
                <path d="M 90,42 C 80,42 72,50 62,56 C 78,52 92,48 100,60 C 108,48 122,52 138,56 C 128,50 120,42 110,42 Z" fill={inactiveColor} stroke={strokeColor} strokeWidth={1} />

                {/* Deltoids (Shoulders) - Highly rounded */}
                <path d="M 62,56 C 45,62 38,75 42,92 C 48,100 55,90 64,78 C 65,70 65,60 62,56 Z" {...getPathProps(isShoulder)} />
                <path d="M 138,56 C 155,62 162,75 158,92 C 152,100 145,90 136,78 C 135,70 135,60 138,56 Z" {...getPathProps(isShoulder)} />

                {/* Deltoid Striations */}
                {isShoulder && <path d="M 50,65 Q 52,80 48,90" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1} />}
                {isShoulder && <path d="M 150,65 Q 148,80 152,90" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1} />}

                {/* Pectorals (Chest) - Distinct left and right curved plates */}
                <path d="M 64,78 C 60,88 62,102 75,108 C 88,112 96,108 98,92 C 100,75 100,70 100,60 C 92,50 78,52 64,78 Z" {...getPathProps(isChest)} />
                <path d="M 136,78 C 140,88 138,102 125,108 C 112,112 104,108 102,92 C 100,75 100,70 100,60 C 108,50 122,52 136,78 Z" {...getPathProps(isChest)} />

                {/* Chest Striations */}
                <path d="M 70,85 Q 85,95 95,95" fill="none" stroke={innerStroke} strokeWidth={0.5} />
                <path d="M 130,85 Q 115,95 105,95" fill="none" stroke={innerStroke} strokeWidth={0.5} />

                {/* Abdominals (Core) - Anatomical 6-pack with linea alba */}
                {/* Upper Abs */}
                <path d="M 75,108 C 85,112 95,108 98,92 C 100,105 100,125 98,135 C 88,132 80,122 75,108 Z" {...getPathProps(isAbs)} />
                <path d="M 125,108 C 115,112 105,108 102,92 C 100,105 100,125 102,135 C 112,132 120,122 125,108 Z" {...getPathProps(isAbs)} />
                {/* Middle/Lower Abs */}
                <path d="M 80,122 C 88,132 98,135 100,165 C 90,160 84,148 80,122 Z" {...getPathProps(isAbs)} />
                <path d="M 120,122 C 112,132 102,135 100,165 C 110,160 116,148 120,122 Z" {...getPathProps(isAbs)} />
                {/* Abs Separations */}
                <path d="M 100,92 L 100,165" fill="none" stroke={strokeColor} strokeWidth={0.8} /> {/* Linea Alba */}
                <path d="M 85,130 L 115,130" fill="none" stroke={strokeColor} strokeWidth={0.8} /> {/* Horizontal cut */}
                <path d="M 88,148 L 112,148" fill="none" stroke={strokeColor} strokeWidth={0.8} /> {/* Horizontal cut */}

                {/* Obliques / Serratus Anterior (Side Core) */}
                <path d="M 64,100 C 58,125 62,142 80,122 C 75,108 68,105 64,100 Z" {...getPathProps(isBack || isAbs)} />
                <path d="M 136,100 C 142,125 138,142 120,122 C 125,108 132,105 136,100 Z" {...getPathProps(isBack || isAbs)} />

                {/* Biceps/Triceps (Upper Arms) - Curved bulging shapes */}
                <path d="M 42,92 C 34,115 32,135 40,152 C 46,145 56,128 58,110 C 60,95 55,95 48,95 C 46,95 44,95 42,92 Z" {...getPathProps(isArms)} />
                <path d="M 158,92 C 166,115 168,135 160,152 C 154,145 144,128 142,110 C 140,95 145,95 152,95 C 154,95 156,95 158,92 Z" {...getPathProps(isArms)} />

                {/* Biceps Striation */}
                <path d="M 45,115 Q 40,130 45,145" fill="none" stroke={innerStroke} strokeWidth={0.5} />
                <path d="M 155,115 Q 160,130 155,145" fill="none" stroke={innerStroke} strokeWidth={0.5} />

                {/* Forearms - Tapered */}
                <path d="M 40,152 C 28,185 25,205 35,218 C 42,218 50,185 52,165 C 55,150 48,145 40,152 Z" {...getPathProps(isArms)} />
                <path d="M 160,152 C 172,185 175,205 165,218 C 158,218 150,185 148,165 C 145,150 152,145 160,152 Z" {...getPathProps(isArms)} />

                {/* Hands */}
                <path d="M 35,218 C 28,235 32,248 40,248 C 45,248 48,225 42,218 Z" fill={inactiveColor} />
                <path d="M 165,218 C 172,235 168,248 160,248 C 155,248 152,225 158,218 Z" fill={inactiveColor} />

                {/* Quadriceps (Upper Legs) - Very sculpted with tear-drop (Vastus Medialis) */}
                <path d="M 84,155 C 62,180 55,235 65,275 C 78,285 92,275 96,252 C 100,210 100,175 84,155 Z" {...getPathProps(isLegs)} />
                <path d="M 116,155 C 138,180 145,235 135,275 C 122,285 108,275 104,252 C 100,210 100,175 116,155 Z" {...getPathProps(isLegs)} />

                {/* Quad Striations (Vastus Medialis / Lateralis) */}
                <path d="M 85,200 Q 75,240 85,265" fill="none" stroke={innerStroke} strokeWidth={0.5} />
                <path d="M 92,180 Q 98,220 92,250" fill="none" stroke={innerStroke} strokeWidth={0.5} />
                <path d="M 115,200 Q 125,240 115,265" fill="none" stroke={innerStroke} strokeWidth={0.5} />
                <path d="M 108,180 Q 102,220 108,250" fill="none" stroke={innerStroke} strokeWidth={0.5} />

                {/* Knees */}
                <path d="M 75,265 C 70,275 70,285 75,290 C 85,290 90,275 88,265 Z" fill={inactiveColor} stroke={strokeColor} strokeWidth={0.5} />
                <path d="M 125,265 C 130,275 130,285 125,290 C 115,290 110,275 112,265 Z" fill={inactiveColor} stroke={strokeColor} strokeWidth={0.5} />

                {/* Calves (Lower Legs) - Distinct Gastrocnemius bulge */}
                <path d="M 65,275 C 55,315 60,365 72,380 C 82,380 90,345 92,305 C 95,285 78,285 65,275 Z" {...getPathProps(isLegs)} />
                <path d="M 135,275 C 145,315 140,365 128,380 C 118,380 110,345 108,305 C 105,285 122,285 135,275 Z" {...getPathProps(isLegs)} />

                {/* Calf Striation */}
                <path d="M 72,295 Q 65,320 75,340" fill="none" stroke={innerStroke} strokeWidth={0.5} />
                <path d="M 128,295 Q 135,320 125,340" fill="none" stroke={innerStroke} strokeWidth={0.5} />

                {/* Feet */}
                <path d="M 72,380 C 60,390 68,400 82,400 C 92,400 92,388 85,380 Z" fill={inactiveColor} />
                <path d="M 128,380 C 140,390 132,400 118,400 C 108,400 108,388 115,380 Z" fill={inactiveColor} />

            </svg>
        </div>
    );
};

export default MuscleMap;
