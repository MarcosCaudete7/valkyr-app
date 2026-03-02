-- Script para crear Perfiles Sociales y Seguidores en Supabase

-- 1. Tabla de Perfiles Extendidos
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  bio TEXT,
  website TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabla de Seguidores (Followers)
CREATE TABLE followers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id TEXT NOT NULL,
  following_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(follower_id, following_id)
);

-- 3. Habilitar Tiempo Real en Followers si quieres que se actualicen en vivo (Opcional)
ALTER PUBLICATION supabase_realtime ADD TABLE followers;

-- 4. Habilitar RLS (Row Level Security) - Permite acceso total para simplificar
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow public read/write followers" ON followers FOR ALL USING (true);
