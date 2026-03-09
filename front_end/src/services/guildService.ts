import { supabase } from '../supabaseClient';
import { API_BASE_URL } from './api';
import axios from 'axios';

export interface Guild {
    id: string;
    name: string;
    description: string;
    emblem_url: string;
    created_at: string;
    memberCount?: number;
    averageKg?: number; // Calculado
}

export interface GuildMember {
    user_id: string;
    guild_id: string;
    role: 'admin' | 'moderator' | 'member';
}

export const guildService = {
    async getMyGuild(userId: string): Promise<Guild | null> {
        try {
            const { data: memberData } = await supabase
                .from('guild_members')
                .select('guild_id, role')
                .eq('user_id', userId)
                .single();

            if (!memberData) return null;

            const { data: guildData } = await supabase
                .from('guilds')
                .select('*')
                .eq('id', memberData.guild_id)
                .single();

            return guildData as Guild;
        } catch (error) {
            console.error("Error getting my guild:", error);
            return null;
        }
    },

    async createGuild(userId: string, name: string, description: string): Promise<Guild | null> {
        try {
            // First create the guild
            const { data: newGuild, error: guildError } = await supabase
                .from('guilds')
                .insert([{ name, description }])
                .select()
                .single();

            if (guildError) throw guildError;

            // Then add the creator as admin
            const { error: memberError } = await supabase
                .from('guild_members')
                .insert([{ user_id: userId, guild_id: newGuild.id, role: 'admin' }]);

            if (memberError) throw memberError;

            return newGuild as Guild;
        } catch (error) {
            console.error("Error creating guild:", error);
            throw error;
        }
    },

    async joinGuild(userId: string, guildId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('guild_members')
                .insert([{ user_id: userId, guild_id: guildId, role: 'member' }]);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Error joining guild:", error);
            throw error;
        }
    },

    async leaveGuild(userId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('guild_members')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Error leaving guild:", error);
            throw error;
        }
    },

    async getGlobalRankings(): Promise<Guild[]> {
        // En una app real de producción con MySQL+Supabase, esto se haría
        // solicitando al Backend de Java calcular la métrica de peso uniendo 
        // los datos de rutinas (MySQL) con las membresías (Supabase).
        // Por ahora, traemos la lista de clanes y simularemos el "score"
        // o llamaremos a un endpoint mixto que crearemos más adelante.
        
        try {
            // 1. Obtener todos los clanes
            const { data: guilds, error } = await supabase
                .from('guilds')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // 2. Simulamos el ranking de "Kilos / Entrenamiento" si no hay backend aún
            // Se le asigna un valor random determinístico basado en su nombre
            const rankedGuilds = (guilds as Guild[]).map(g => {
                const pseudoRandom = g.name.length * (new Date(g.created_at).getTime() % 100);
                return {
                    ...g,
                    averageKg: 200 + pseudoRandom // simulación entre 200 y ~2000 kg
                };
            }).sort((a, b) => (b.averageKg || 0) - (a.averageKg || 0));

            return rankedGuilds;
        } catch (error) {
            console.error("Error fetching global rankings:", error);
            return [];
        }
    }
};
