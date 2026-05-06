import { Capacitor } from '@capacitor/core';
import { HealthConnect } from '@devmaxime/capacitor-health-connect';

export interface HealthData {
    steps: number;
    calories: number;
    distance: number;
}

/**
 * Suma todos los valores de un array de AggregateData devuelto por aggregateRecords.
 * La API devuelve: { aggregates: [{ startTime, endTime, value, unit }] }
 */
function sumAggregates(result: any): number {
    if (!result || !Array.isArray(result.aggregates)) return 0;
    return result.aggregates.reduce((acc: number, item: any) => acc + (item.value || 0), 0);
}

export const healthService = {
    async getHealthData(): Promise<HealthData> {
        if (!Capacitor.isNativePlatform()) {
            return this.getSimulatedData();
        }

        try {
            // 1. Comprobar disponibilidad de Health Connect
            const isAvailable = await HealthConnect.checkAvailability();
            if (isAvailable.availability !== 'Available') {
                console.warn('Health Connect no está disponible en este dispositivo.');
                return this.getSimulatedData();
            }

            // 2. Pedir todos los permisos necesarios (pasos, distancia y calorías activas)
            const permissions = await HealthConnect.requestPermissions({
                read: ['Steps', 'ActivitySession'],
                write: []
            });

            if (!permissions.read.includes('Steps')) {
                console.warn('Permiso de pasos denegado.');
                return this.getSimulatedData();
            }

            // 3. Definir rango de tiempo: desde las 00:00:00 del día actual hasta ahora
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const now = new Date();

            const start = todayStart.toISOString();
            const end = now.toISOString();

            // 4. Obtener pasos agregados del día (Health Connect deduplica automáticamente)
            const stepsResult = await HealthConnect.aggregateRecords({
                start,
                end,
                type: 'Steps',
                groupBy: 'day'
            });
            const totalSteps = sumAggregates(stepsResult);

            // 5. Intentar obtener distancia real del día en metros
            let totalDistanceKm = parseFloat(((totalSteps * 0.7) / 1000).toFixed(2)); // fallback
            try {
                const distanceResult = await HealthConnect.aggregateRecords({
                    start,
                    end,
                    type: 'Distance',
                    groupBy: 'day'
                });
                const rawDistance = sumAggregates(distanceResult); // en metros
                if (rawDistance > 0) {
                    totalDistanceKm = parseFloat((rawDistance / 1000).toFixed(2));
                }
            } catch {
                // Si falla, usamos el fallback calculado por pasos
            }

            // 6. Intentar obtener calorías activas reales del día
            let totalCalories = Math.round(totalSteps * 0.04); // fallback
            try {
                const caloriesResult = await HealthConnect.aggregateRecords({
                    start,
                    end,
                    type: 'ActiveCaloriesBurned',
                    groupBy: 'day'
                });
                const rawCalories = sumAggregates(caloriesResult); // en kcal
                if (rawCalories > 0) {
                    totalCalories = Math.round(rawCalories);
                }
            } catch {
                // Si falla, usamos el fallback calculado por pasos
            }

            console.log(`[HealthService] Pasos: ${totalSteps}, Distancia: ${totalDistanceKm}km, Calorías: ${totalCalories}kcal`);

            return {
                steps: totalSteps,
                calories: totalCalories,
                distance: totalDistanceKm,
            };

        } catch (error) {
            console.error('Error leyendo Health Connect:', error);
            return this.getSimulatedData();
        }
    },

    getSimulatedData(): HealthData {
        // Datos simulados para entorno Web/PC basados en la hora del día
        const hour = new Date().getHours();
        const baseSteps = hour * 400; // A las 12:00 → ~4800 pasos
        return {
            steps: baseSteps + Math.floor(Math.random() * 300),
            calories: Math.floor(baseSteps * 0.04),
            distance: parseFloat(((baseSteps * 0.7) / 1000).toFixed(2)),
        };
    }
};
