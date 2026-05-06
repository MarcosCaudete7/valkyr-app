import { Capacitor } from '@capacitor/core';
import { HealthConnect } from '@devmaxime/capacitor-health-connect';

export interface HealthData {
    steps: number;
    calories: number;
    distance: number;
}

/**
 * Suma todos los valores de un AggregateResponse.
 * La API devuelve: { aggregates: [{ startTime, endTime, value, unit }] }
 */
function sumAggregates(result: any): number {
    if (!result) return 0;
    // Si viene en formato { aggregates: [...] }
    if (Array.isArray(result.aggregates)) {
        return result.aggregates.reduce((acc: number, item: any) => acc + (Number(item.value) || 0), 0);
    }
    // Algunos plugins devuelven directamente el valor numérico
    if (typeof result.value === 'number') return result.value;
    if (typeof result.count === 'number') return result.count;
    if (typeof result.total === 'number') return result.total;
    return 0;
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
                console.warn('[HealthService] Health Connect no disponible:', isAvailable.availability);
                return this.getFallbackZero();
            }

            // 2. Pedir permisos — SOLO tipos soportados por RecordType del plugin
            //    ('ActivitySession' causaba error, plugin solo acepta: Steps, Weight, ActivitySession, SleepSession, RestingHeartRate)
            const permissions = await HealthConnect.requestPermissions({
                read: ['Steps', 'ActivitySession'],
                write: []
            });

            console.log('[HealthService] Permisos obtenidos:', JSON.stringify(permissions));

            if (!permissions.read.includes('Steps')) {
                console.warn('[HealthService] Permiso de pasos denegado.');
                return this.getFallbackZero();
            }

            // 3. Rango de tiempo: desde las 00:00:00 hoy hasta ahora
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const now = new Date();
            const start = todayStart.toISOString();
            const end = now.toISOString();

            console.log(`[HealthService] Rango: ${start} → ${end}`);

            // 4. Pasos del día (aggregateRecords deduplica automáticamente)
            let totalSteps = 0;
            try {
                const stepsResult = await HealthConnect.aggregateRecords({ start, end, type: 'Steps' });
                console.log('[HealthService] stepsResult raw:', JSON.stringify(stepsResult));
                totalSteps = sumAggregates(stepsResult);
            } catch (e) {
                console.error('[HealthService] Error obteniendo pasos:', e);
            }

            // 5. Distancia real del día (en metros) — fallback a cálculo por pasos
            let totalDistanceKm = parseFloat(((totalSteps * 0.7) / 1000).toFixed(2));
            try {
                const distResult = await HealthConnect.aggregateRecords({ start, end, type: 'Distance' });
                console.log('[HealthService] distResult raw:', JSON.stringify(distResult));
                const distM = sumAggregates(distResult);
                if (distM > 0) totalDistanceKm = parseFloat((distM / 1000).toFixed(2));
            } catch (e) {
                console.error('[HealthService] Error obteniendo distancia:', e);
            }

            // 6. Calorías activas reales — fallback a cálculo por pasos
            let totalCalories = Math.round(totalSteps * 0.04);
            try {
                const calResult = await HealthConnect.aggregateRecords({ start, end, type: 'ActiveCaloriesBurned' });
                console.log('[HealthService] calResult raw:', JSON.stringify(calResult));
                const rawCal = sumAggregates(calResult);
                if (rawCal > 0) totalCalories = Math.round(rawCal);
            } catch (e) {
                console.error('[HealthService] Error obteniendo calorías:', e);
            }

            console.log(`[HealthService] RESULTADO → Pasos: ${totalSteps}, Distancia: ${totalDistanceKm}km, Calorías: ${totalCalories}kcal`);

            return {
                steps: totalSteps,
                calories: totalCalories,
                distance: totalDistanceKm,
            };

        } catch (error) {
            console.error('[HealthService] Error crítico:', error);
            return this.getFallbackZero();
        }
    },

    /** Devuelve ceros reales (en móvil sin datos reales) */
    getFallbackZero(): HealthData {
        return { steps: 0, calories: 0, distance: 0 };
    },

    /** Datos simulados para entorno Web/PC */
    getSimulatedData(): HealthData {
        const hour = new Date().getHours();
        const baseSteps = hour * 400;
        return {
            steps: baseSteps + Math.floor(Math.random() * 300),
            calories: Math.floor(baseSteps * 0.04),
            distance: parseFloat(((baseSteps * 0.7) / 1000).toFixed(2)),
        };
    }
};
