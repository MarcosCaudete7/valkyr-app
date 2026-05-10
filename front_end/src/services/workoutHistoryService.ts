import { supabase } from '../supabaseClient';

export interface WorkoutHistoryEntry {
    id?: string;
    routine_id: number;
    routine_name: string;
    total_volume_kg: number;
    duration_minutes: number;
    completed_at?: string;
}

export const workoutHistoryService = {
    async saveWorkout(entry: WorkoutHistoryEntry): Promise<WorkoutHistoryEntry> {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.id) throw new Error('Usuario no autenticado');

        const { data, error } = await supabase
            .from('workout_history')
            .insert({
                user_id: String(user.id),
                routine_id: entry.routine_id,
                routine_name: entry.routine_name,
                total_volume_kg: entry.total_volume_kg,
                duration_minutes: entry.duration_minutes
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getHistory(limit: number = 20): Promise<WorkoutHistoryEntry[]> {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.id) return [];

        const { data, error } = await supabase
            .from('workout_history')
            .select('*')
            .eq('user_id', String(user.id))
            .order('completed_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }
};
