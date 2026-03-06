import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Inicializa Supabase desde las variables de entorno para scripts Node
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchExercises() {
    console.log("Conectando con Supabase para descargar lista...");
    const { data, error } = await supabase.from('exercises').select('id, name, muscleGroup');

    if (error) {
        console.error("Error obteniendo ejercicios:", error);
        return;
    }

    console.log(`Se encontraron ${data.length} ejercicios.`);
    fs.writeFileSync('exercises_list.json', JSON.stringify(data, null, 2));
    console.log("Guardados en exercises_list.json");
}

fetchExercises();
