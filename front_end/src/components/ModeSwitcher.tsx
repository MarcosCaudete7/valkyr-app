import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import './ModeSwitcher.css';

const ModeSwitcher: React.FC = () => {
    const history = useHistory();
    const location = useLocation();
    const isNutrition = location.pathname.startsWith('/nutrition');

    return (
        <div className="mode-switcher">
            <button
                className={`mode-btn ${!isNutrition ? 'active' : ''}`}
                onClick={() => { if (isNutrition) history.push('/tabs/myroutines'); }}
            >
                💪 Entrenamiento
            </button>
            <button
                className={`mode-btn ${isNutrition ? 'active' : ''}`}
                onClick={() => { if (!isNutrition) history.push('/nutrition/dashboard'); }}
            >
                🥗 Nutrición
            </button>
        </div>
    );
};

export default ModeSwitcher;
