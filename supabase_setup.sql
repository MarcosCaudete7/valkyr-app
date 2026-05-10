-- ============================================================
-- VALKYR APP — Supabase Schema Completo
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================================

-- IMPORTANTE: Primero borramos las tablas antiguas que tenían dependencia con auth.users
DROP TABLE IF EXISTS public.workout_history CASCADE;
DROP TABLE IF EXISTS public.body_measures CASCADE;
DROP TABLE IF EXISTS public.water_log CASCADE;
DROP TABLE IF EXISTS public.pantry CASCADE;
DROP TABLE IF EXISTS public.food_diary CASCADE;
DROP TABLE IF EXISTS public.foods CASCADE;
DROP TABLE IF EXISTS public.guild_members CASCADE;
DROP TABLE IF EXISTS public.guilds CASCADE;

-- 1. Clanes (Guilds)
CREATE TABLE public.guilds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    emblem_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Miembros de Clan
CREATE TABLE public.guild_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id)
);

-- ============================================================
-- MÓDULO NUTRICIÓN — Nuevas tablas
-- ============================================================

-- 3. Base de datos de alimentos (comunidad + externos)
CREATE TABLE public.foods (
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
    source TEXT DEFAULT 'community',
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Diario de comidas diario
CREATE TABLE public.food_diary (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
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

-- 5. Despensa personal
CREATE TABLE public.pantry (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    food_id UUID REFERENCES public.foods(id) ON DELETE SET NULL,
    food_name TEXT NOT NULL,
    quantity_g NUMERIC DEFAULT 100,
    unit TEXT DEFAULT 'g',
    added_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Registro de agua diario
CREATE TABLE public.water_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    glasses INT NOT NULL DEFAULT 1,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    logged_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Medidas y peso corporal
CREATE TABLE public.body_measures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight_kg NUMERIC,
    waist_cm NUMERIC,
    chest_cm NUMERIC,
    arm_cm NUMERIC,
    leg_cm NUMERIC,
    hip_cm NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Historial de entrenamientos
CREATE TABLE public.workout_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    routine_id INT,
    routine_name TEXT NOT NULL,
    total_volume_kg NUMERIC DEFAULT 0,
    duration_minutes INT DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Objetivos nutricionales en profiles (si profiles existe en MySQL, no hace falta en Supabase, 
-- pero lo mantenemos por compatibilidad si lo usas).
CREATE TABLE IF NOT EXISTS public.profiles (
    id VARCHAR(255) PRIMARY KEY,
    height_cm INT,
    goal TEXT DEFAULT 'maintain',
    activity_level TEXT DEFAULT 'moderate',
    target_calories INT,
    target_protein_g INT,
    target_carbs_g INT,
    target_fat_g INT
);
