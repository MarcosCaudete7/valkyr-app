-- ============================================================
-- VALKYR APP — Supabase Schema Completo
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================================

-- Ejecuta este script en el SQL Editor de tu Dashboard de Supabase

-- 1. Clanes (Guilds)
CREATE TABLE IF NOT EXISTS public.guilds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    emblem_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Miembros de Clan
CREATE TABLE IF NOT EXISTS public.guild_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id)
);

-- 3. RLS Guilds
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Guilds are viewable by everyone" ON public.guilds;
CREATE POLICY "Guilds are viewable by everyone" ON public.guilds FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create guilds" ON public.guilds;
CREATE POLICY "Users can create guilds" ON public.guilds FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 4. RLS Guild Members
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Guild members are viewable by everyone" ON public.guild_members;
CREATE POLICY "Guild members are viewable by everyone" ON public.guild_members FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can join a guild" ON public.guild_members;
CREATE POLICY "Users can join a guild" ON public.guild_members FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can leave a guild" ON public.guild_members;
CREATE POLICY "Users can leave a guild" ON public.guild_members FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- MÓDULO NUTRICIÓN — Nuevas tablas
-- ============================================================

-- 5. Base de datos de alimentos (comunidad + externos)
CREATE TABLE IF NOT EXISTS public.foods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT,
    barcode TEXT UNIQUE,
    serving_size_g NUMERIC DEFAULT 100,
    calories_per_100g NUMERIC DEFAULT 0,
    protein_per_100g NUMERIC DEFAULT 0,
    carbs_per_100g NUMERIC DEFAULT 0,
    fat_per_100g NUMERIC DEFAULT 0,
    fiber_per_100g NUMERIC DEFAULT 0,
    sugar_per_100g NUMERIC DEFAULT 0,
    sodium_per_100g NUMERIC DEFAULT 0,
    source TEXT DEFAULT 'community', -- 'community', 'openfoodfacts', 'usda'
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Foods viewable by everyone" ON public.foods;
CREATE POLICY "Foods viewable by everyone" ON public.foods FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can add foods" ON public.foods;
CREATE POLICY "Authenticated users can add foods" ON public.foods FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 6. Diario de comidas diario
CREATE TABLE IF NOT EXISTS public.food_diary (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    food_id UUID REFERENCES public.foods(id) ON DELETE SET NULL,
    food_name TEXT NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    quantity_g NUMERIC NOT NULL DEFAULT 100,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    calories NUMERIC DEFAULT 0,
    protein_g NUMERIC DEFAULT 0,
    carbs_g NUMERIC DEFAULT 0,
    fat_g NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.food_diary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own diary" ON public.food_diary;
CREATE POLICY "Users see own diary" ON public.food_diary FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own diary" ON public.food_diary;
CREATE POLICY "Users insert own diary" ON public.food_diary FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users delete own diary" ON public.food_diary;
CREATE POLICY "Users delete own diary" ON public.food_diary FOR DELETE USING (auth.uid() = user_id);

-- 7. Despensa personal
CREATE TABLE IF NOT EXISTS public.pantry (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    food_id UUID REFERENCES public.foods(id) ON DELETE SET NULL,
    food_name TEXT NOT NULL,
    quantity_g NUMERIC DEFAULT 100,
    unit TEXT DEFAULT 'g',
    added_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.pantry ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own pantry" ON public.pantry;
CREATE POLICY "Users see own pantry" ON public.pantry FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own pantry" ON public.pantry;
CREATE POLICY "Users manage own pantry" ON public.pantry FOR ALL USING (auth.uid() = user_id);

-- 8. Registro de agua diario
CREATE TABLE IF NOT EXISTS public.water_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    glasses INT NOT NULL DEFAULT 1,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    logged_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.water_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own water log" ON public.water_log;
CREATE POLICY "Users see own water log" ON public.water_log FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own water log" ON public.water_log;
CREATE POLICY "Users manage own water log" ON public.water_log FOR ALL USING (auth.uid() = user_id);

-- 9. Medidas y peso corporal
CREATE TABLE IF NOT EXISTS public.body_measures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight_kg NUMERIC,
    waist_cm NUMERIC,
    chest_cm NUMERIC,
    arm_cm NUMERIC,
    leg_cm NUMERIC,
    hip_cm NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.body_measures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own measures" ON public.body_measures;
CREATE POLICY "Users see own measures" ON public.body_measures FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own measures" ON public.body_measures;
CREATE POLICY "Users manage own measures" ON public.body_measures FOR ALL USING (auth.uid() = user_id);

-- 10. Objetivos nutricionales en profiles
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS height_cm INT,
    ADD COLUMN IF NOT EXISTS goal TEXT DEFAULT 'maintain',
    ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'moderate',
    ADD COLUMN IF NOT EXISTS target_calories INT,
    ADD COLUMN IF NOT EXISTS target_protein_g INT,
    ADD COLUMN IF NOT EXISTS target_carbs_g INT,
    ADD COLUMN IF NOT EXISTS target_fat_g INT;

-- 11. Historial de entrenamientos
CREATE TABLE IF NOT EXISTS public.workout_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    routine_id INT, -- ID de la rutina en MySQL
    routine_name TEXT NOT NULL,
    total_volume_kg NUMERIC DEFAULT 0,
    duration_minutes INT DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.workout_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own workout history" ON public.workout_history;
CREATE POLICY "Users see own workout history" ON public.workout_history FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own workout history" ON public.workout_history;
CREATE POLICY "Users manage own workout history" ON public.workout_history FOR ALL USING (auth.uid() = user_id);
