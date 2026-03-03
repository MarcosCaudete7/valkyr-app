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

            // Pedir permisos si es necesario
            const permissions = await HealthConnect.requestPermissions({
                read: ['Steps', 'TotalCaloriesBurned', 'Distance'] as any[], // Explicit cast to avoid type errors on newer/older union mismatch
                write: []
            });

            if (!permissions.read.includes('Steps' as any)) {
                console.warn("Permisos denegados para leer pasos");
                return this.getSimulatedData();
            }

            // Obtener pasos, calorías y distancia de HOY mediante agregación
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

            const caloriesData = await HealthConnect.aggregateRecords({
                start: startStr,
                end: endStr,
                type: 'TotalCaloriesBurned',
                groupBy: 'day'
            });

            const distanceData = await HealthConnect.aggregateRecords({
                start: startStr,
                end: endStr,
                type: 'Distance',
                groupBy: 'day'
            });

            let totalSteps = 0;
            stepsData.aggregates.forEach((r: any) => totalSteps += r.value);

            let totalCalories = 0;
            caloriesData.aggregates.forEach((r: any) => totalCalories += r.value);

            let totalDistance = 0; // en metros o unidad nativa
            distanceData.aggregates.forEach((r: any) => totalDistance += r.value);

            return {
                steps: totalSteps,
                calories: Math.round(totalCalories),
                distance: parseFloat((totalDistance / 1000).toFixed(2)) // asumiendo metros
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
