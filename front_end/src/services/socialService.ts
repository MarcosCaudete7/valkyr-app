import { supabase } from '../supabaseClient';

export interface UserProfile {
    id: string; // The user's ID
    bio: string;
    website: string;
}

export const socialService = {
    // Profiles
    async getProfile(userId: string): Promise<UserProfile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        // Si no existe perfil, no tiramos error, devolvemos null para mostrar valores por defecto
        if (error && error.code !== 'PGRST116') { // PGRST116 es "no rows in the result"
            console.error("Error obteniendo perfil:", error);
        }
        return data;
    },

    async updateProfile(userId: string, bio: string, website: string) {
        const { error } = await supabase
            .from('profiles')
            .upsert([{ id: userId, bio, website }]); // Upsert crea si no existe, o actualiza si existe
        if (error) throw error;
    },

    // Followers
    async followUser(followerId: string, followingId: string) {
        const { error } = await supabase
            .from('followers')
            .insert([{ follower_id: followerId, following_id: followingId }]);

        // Ignore error si ya lo sigue (violación de uniqueness)
        if (error && error.code !== '23505') throw error;
    },

    async unfollowUser(followerId: string, followingId: string) {
        const { error } = await supabase
            .from('followers')
            .delete()
            .match({ follower_id: followerId, following_id: followingId });
        if (error) throw error;
    },

    async checkIsFollowing(followerId: string, followingId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('followers')
            .select('id')
            .match({ follower_id: followerId, following_id: followingId })
            .maybeSingle();

        if (error) throw error;
        return !!data;
    },

    async getFollowersCount(userId: string): Promise<number> {
        const { count, error } = await supabase
            .from('followers')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', userId);

        if (error) throw error;
        return count || 0;
    },

    async getFollowingCount(userId: string): Promise<number> {
        const { count, error } = await supabase
            .from('followers')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', userId);

        if (error) throw error;
        return count || 0;
    }
};
