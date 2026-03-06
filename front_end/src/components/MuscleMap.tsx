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

    const activeColor = 'rgba(239, 68, 68, 0.7)'; // Translucent Red
    const inactiveColor = 'transparent'; // Let the real image show

    const getPathProps = (isActive: boolean) => ({
        fill: isActive ? activeColor : inactiveColor,
        stroke: 'transparent',
        className: isActive ? 'muscle-pulse' : '',
        style: { transition: 'all 0.4s ease', mixBlendMode: 'overlay' as const }
    });

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
            <img
                src="/assets/anatomical_muscle_base.png"
                alt="Human Anatomy"
                style={{ height: '100%', objectFit: 'contain', zIndex: 1 }}
            />
            {/* The SVG coordinates must be relative to a 512x512 grid based on the generated image aspect ratio. Assuming the image fits within a central column. */}
            <svg viewBox="0 0 512 512" style={{ position: 'absolute', height: '100%', width: '100%', zIndex: 2 }} preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
                {/* Approximate Mapping Zones over the Base Image */}

                {/* Shoulders */}
                <path d="M 160,110 C 145,130 148,160 160,180 C 180,165 185,130 160,110 Z" {...getPathProps(isShoulder)} />
                <path d="M 352,110 C 367,130 364,160 352,180 C 332,165 327,130 352,110 Z" {...getPathProps(isShoulder)} />

                {/* Chest */}
                <path d="M 190,120 C 256,120 256,165 256,165 C 256,165 256,120 322,120 C 340,140 330,175 256,185 C 182,175 172,140 190,120 Z" {...getPathProps(isChest)} />

                {/* Core / Abs */}
                <path d="M 220,185 C 256,185 256,185 292,185 C 285,250 270,265 256,280 C 242,265 227,250 220,185 Z" {...getPathProps(isAbs || isBack)} />

                {/* Arms (Biceps/Triceps/Forearms grouped as arm) */}
                <path d="M 148,160 C 130,220 120,250 145,285 C 158,250 165,200 148,160 Z" {...getPathProps(isArms)} />
                <path d="M 364,160 C 382,220 392,250 367,285 C 354,250 347,200 364,160 Z" {...getPathProps(isArms)} />

                {/* Quads/Upper Legs */}
                <path d="M 220,265 C 190,300 200,380 230,400 C 256,380 256,330 250,265 Z" {...getPathProps(isLegs)} />
                <path d="M 292,265 C 322,300 312,380 282,400 C 256,380 256,330 262,265 Z" {...getPathProps(isLegs)} />

                {/* Calves */}
                <path d="M 220,400 C 210,440 215,470 230,480 C 240,460 240,420 230,400 Z" {...getPathProps(isLegs)} />
                <path d="M 292,400 C 302,440 297,470 282,480 C 272,460 272,420 282,400 Z" {...getPathProps(isLegs)} />
            </svg>
        </div>
    );
};

export default MuscleMap;
