import { supabase } from '../supabaseClient';

export interface FoodItem {
    id?: string;
    name: string;
    brand?: string;
    barcode?: string;
    serving_size_g?: number;
    calories_per_100g: number;
    protein_per_100g: number;
    carbs_per_100g: number;
    fat_per_100g: number;
    fiber_per_100g?: number;
    source?: string;
}

export interface DiaryEntry {
    id?: string;
    food_id?: string;
    food_name: string;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    quantity_g: number;
    date?: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
}

export interface BodyMeasure {
    id?: string;
    date: string;
    weight_kg?: number;
    waist_cm?: number;
    chest_cm?: number;
    arm_cm?: number;
    leg_cm?: number;
    hip_cm?: number;
}

export interface WaterLog {
    date: string;
    glasses: number;
}

/** Busca alimentos en la BD comunidad de Supabase */
async function searchFoodsLocal(query: string): Promise<FoodItem[]> {
    const { data, error } = await supabase
        .from('foods')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(20);
    if (error) throw error;
    return data || [];
}

/** Busca alimentos en Open Food Facts (gratis, sin API key) */
async function searchFoodsOpenFoodFacts(query: string): Promise<FoodItem[]> {
    try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10&fields=id,product_name,brands,nutriments,serving_size`;
        const res = await fetch(url);
        const data = await res.json();
        return (data.products || [])
            .filter((p: any) => p.product_name && p.nutriments)
            .map((p: any) => ({
                name: p.product_name,
                brand: p.brands,
                barcode: p.id,
                calories_per_100g: p.nutriments['energy-kcal_100g'] || 0,
                protein_per_100g: p.nutriments['proteins_100g'] || 0,
                carbs_per_100g: p.nutriments['carbohydrates_100g'] || 0,
                fat_per_100g: p.nutriments['fat_100g'] || 0,
                fiber_per_100g: p.nutriments['fiber_100g'] || 0,
                source: 'openfoodfacts',
            }));
    } catch {
        return [];
    }
}

/** Busca alimento por código de barras en Open Food Facts */
async function searchByBarcode(barcode: string): Promise<FoodItem | null> {
    try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        const data = await res.json();
        if (data.status !== 1 || !data.product) return null;
        const p = data.product;
        return {
            name: p.product_name || 'Producto desconocido',
            brand: p.brands,
            barcode,
            calories_per_100g: p.nutriments?.['energy-kcal_100g'] || 0,
            protein_per_100g: p.nutriments?.['proteins_100g'] || 0,
            carbs_per_100g: p.nutriments?.['carbohydrates_100g'] || 0,
            fat_per_100g: p.nutriments?.['fat_100g'] || 0,
            fiber_per_100g: p.nutriments?.['fiber_100g'] || 0,
            source: 'openfoodfacts',
        };
    } catch {
        return null;
    }
}

export const nutritionService = {
    /** Búsqueda combinada: Supabase primero, luego Open Food Facts */
    async searchFoods(query: string): Promise<FoodItem[]> {
        const [local, off] = await Promise.allSettled([
            searchFoodsLocal(query),
            searchFoodsOpenFoodFacts(query),
        ]);
        const localResults = local.status === 'fulfilled' ? local.value : [];
        const offResults = off.status === 'fulfilled' ? off.value : [];
        // Deduplicar por nombre
        const seen = new Set(localResults.map(f => f.name.toLowerCase()));
        const merged = [...localResults, ...offResults.filter(f => !seen.has(f.name.toLowerCase()))];
        return merged;
    },

    async searchByBarcode,

    /** Añadir alimento a la comunidad */
    async addFoodToCommunity(food: FoodItem): Promise<void> {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        await supabase.from('foods').insert({ ...food, created_by: user.id });
    },

    // ─── Diario de comidas ───────────────────────────────────────
    async getDiaryForDate(date: string): Promise<DiaryEntry[]> {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const { data, error } = await supabase
            .from('food_diary')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', date)
            .order('created_at');
        if (error) throw error;
        return data || [];
    },

    async addDiaryEntry(entry: DiaryEntry): Promise<void> {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        await supabase.from('food_diary').insert({ ...entry, user_id: user.id });
    },

    async deleteDiaryEntry(id: string): Promise<void> {
        await supabase.from('food_diary').delete().eq('id', id);
    },

    // ─── Despensa ────────────────────────────────────────────────
    async getPantry(): Promise<FoodItem[]> {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const { data, error } = await supabase
            .from('pantry')
            .select('*')
            .eq('user_id', user.id)
            .order('added_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    async addToPantry(food: FoodItem, quantityG = 100): Promise<void> {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        await supabase.from('pantry').insert({
            user_id: user.id,
            food_id: food.id,
            food_name: food.name,
            quantity_g: quantityG,
        });
    },

    async removeFromPantry(id: string): Promise<void> {
        await supabase.from('pantry').delete().eq('id', id);
    },

    // ─── Agua ────────────────────────────────────────────────────
    async getWaterToday(): Promise<number> {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase
            .from('water_log')
            .select('glasses')
            .eq('user_id', user.id)
            .eq('date', today);
        return (data || []).reduce((acc, r) => acc + (r.glasses || 0), 0);
    },

    async addWaterGlass(): Promise<void> {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const today = new Date().toISOString().split('T')[0];
        await supabase.from('water_log').insert({ user_id: user.id, glasses: 1, date: today });
    },

    async removeWaterGlass(): Promise<void> {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase
            .from('water_log')
            .select('id, glasses')
            .eq('user_id', user.id)
            .eq('date', today)
            .order('logged_at', { ascending: false })
            .limit(1);
        if (data && data.length > 0) {
            await supabase.from('water_log').delete().eq('id', data[0].id);
        }
    },

    // ─── Medidas corporales ──────────────────────────────────────
    async getBodyMeasures(): Promise<BodyMeasure[]> {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const { data, error } = await supabase
            .from('body_measures')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(90);
        if (error) throw error;
        return data || [];
    },

    async addBodyMeasure(measure: BodyMeasure): Promise<void> {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        await supabase.from('body_measures').upsert({
            ...measure,
            user_id: user.id,
        }, { onConflict: 'user_id,date' });
    },

    // ─── Cálculo de objetivos (TDEE con Mifflin-St Jeor) ────────
    calculateTDEE(params: {
        weightKg: number;
        heightCm: number;
        ageYears: number;
        gender: 'male' | 'female';
        activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
        goal: 'lose' | 'maintain' | 'gain';
    }): { calories: number; protein: number; carbs: number; fat: number } {
        const { weightKg, heightCm, ageYears, gender, activityLevel, goal } = params;
        // BMR
        const bmr = gender === 'male'
            ? 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5
            : 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
        // TDEE
        const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
        let tdee = bmr * activityMultipliers[activityLevel];
        // Goal adjustment
        if (goal === 'lose') tdee -= 500;
        if (goal === 'gain') tdee += 300;
        const calories = Math.round(tdee);
        // Macros: 30% protein, 40% carbs, 30% fat (estándar fitness)
        const protein = Math.round((calories * 0.30) / 4);
        const carbs = Math.round((calories * 0.40) / 4);
        const fat = Math.round((calories * 0.30) / 9);
        return { calories, protein, carbs, fat };
    },
};
