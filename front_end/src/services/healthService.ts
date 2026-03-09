import { Capacitor } from '@capacitor/core';
import { HealthConnect } from '@devmaxime/capacitor-health-connect';

export interface HealthData {
    steps: number;
    calories: number;
    distance: number;
}

export const healthService = {
    async getHealthData(): Promise<HealthData> {
        if (!Capacitor.isNativePlatform()) {
            return this.getSimulatedData();
        }

        try {
            // Android Health Connect Logic
            const isAvailable = await HealthConnect.checkAvailability();

            if (isAvailable.availability !== 'Available') {
                console.warn("Health Connect no está disponible en este dispositivo.");
                return this.getSimulatedData();
            }

            // Pedir permisos. Según la API del plugin, RecordType solo acepta 'Steps' entre otros básicos para "read".
            const permissions = await HealthConnect.requestPermissions({
                read: ['Steps'], 
                write: []
            });

            if (!permissions.read.includes('Steps')) {
                console.warn("Permisos denegados para leer pasos");
                return this.getSimulatedData();
            }

            // Obtener pasos de HOY mediante agregación
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const endTime = new Date(); // Ahora mismo

            const startStr = today.toISOString();
            const endStr = endTime.toISOString();

            const stepsData = await HealthConnect.aggregateRecords({
                start: startStr,
                end: endStr,
                type: 'Steps',
                groupBy: 'day'
            });

            let totalSteps = 0;
            if (stepsData && stepsData.aggregates) {
                stepsData.aggregates.forEach((r: any) => totalSteps += r.value);
            }

            // Calculamos calorías y distancia base a los pasos reales de Android
            const totalCalories = totalSteps * 0.04;
            const totalDistanceMetros = totalSteps * 0.8;

            return {
                steps: totalSteps,
                calories: Math.round(totalCalories),
                distance: parseFloat((totalDistanceMetros / 1000).toFixed(2)) // en Km
            };

        } catch (error) {
            console.error("Error leyendo Health Connect:", error);
            return this.getSimulatedData();
        }
    },

    getSimulatedData(): HealthData {
        // Datos falsos para el entorno Web/PC
        // Generamos un número que varíe un poco cada vez pero en base a la hora
        const hour = new Date().getHours();
        const baseSteps = hour * 400; // Ej: A las 12:00 = 4800 pasos
        return {
            steps: baseSteps + Math.floor(Math.random() * 500),
            calories: Math.floor(baseSteps * 0.04), // 40 kcal por 1000 pasos
            distance: parseFloat((baseSteps * 0.0008).toFixed(2)) // 800m por 1000 pasos
        };
    }
};
