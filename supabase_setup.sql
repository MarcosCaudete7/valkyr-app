-- Ejecuta este script en el SQL Editor de tu Dashboard de Supabase para activar el Sistema de Clanes y Ránking

-- 1. Crear tabla de Clanes (Guilds)
CREATE TABLE public.guilds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    emblem_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Crear tabla de Miembros de Clan (Guild Members)
CREATE TABLE public.guild_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' NOT NULL, -- 'admin', 'moderator', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id) -- Un usuario solo puede pertenecer a un clan a la vez
);

-- 3. Crear una vista calcular el Ranking de Clanes (Media de Kilos / Entrenamiento)
-- Esta vista asume que existe una tabla "routines" o "workouts" y "exercises" (si tienes esto en MySQL en vez de Supabase, 
-- el ranking se tendrá que calcular en el Backend Java o trayendo los Clanes desde Supabase y uniendo la info).
-- NOTA: Como la lógica de ejercicios y rutinas actual de Valkyr vive en MySQL Spring Boot, 
-- el ranking real deberá solicitarse al backend de Java que devolverá la suma de peso, unida a los miembros del clan de esta base de datos.

-- 4. Añadir políticas de seguridad (RLS) para Guilds
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guilds are viewable by everyone" ON public.guilds FOR SELECT USING (true);
CREATE POLICY "Users can create guilds" ON public.guilds FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
-- (Optional) Policy to update guild by admin member

-- 5. Añadir políticas para Guild Members
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guild members are viewable by everyone" ON public.guild_members FOR SELECT USING (true);
CREATE POLICY "Users can join a guild" ON public.guild_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave a guild" ON public.guild_members FOR DELETE USING (auth.uid() = user_id);

-- Opcional: Trigger para asignar automáticamente 'admin' al creador del clan si ambos se hacen en la misma transacción, 
-- o manejarlo en el backend.
