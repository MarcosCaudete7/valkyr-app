import axios from 'axios';
import fs from 'fs';

async function fetchEx() {
    try {
        const res = await axios.get('https://api.valkyrapp.com/api/exercises');
        const exercises = res.data;
        console.log(`Encontrados: ${exercises.length}`);
        fs.writeFileSync('exercises_list.json', JSON.stringify(exercises, null, 2));
    } catch (e) {
        console.error("Error", e.message);
    }
}
fetchEx();
