import fs from 'fs';
import path from 'path';
import axios from 'axios';

const exercisesFile = '/tmp/exercises_valkyr.txt';
const outputDir = '/home/marcos/Documentos/GitHub/valkyr-app/front_end/public/assets/exercises';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const validGifs = {
    'bench_press': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Bench-press.gif',
    'squat': 'https://upload.wikimedia.org/wikipedia/commons/8/82/Squats.gif',
    'pushup': 'https://upload.wikimedia.org/wikipedia/commons/8/89/Pushup.gif',
    'pullup': 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Pull-up.gif',
    'deadlift': 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Deadlift.gif',
    'biceps_curl': 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Biceps_curl.gif',
    'plank': 'https://upload.wikimedia.org/wikipedia/commons/3/30/Plank.gif',
    'lunges': 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Lunges.gif',
    'lateral_raises': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Lateral_raise.gif',
    'shoulder_press': 'https://upload.wikimedia.org/wikipedia/commons/7/75/Shoulder_Press.gif',
    'crunch': 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Crunch.gif'
};

const kwMap = {
    'banca': 'bench_press',
    'sentadilla': 'squat',
    'flexiones': 'pushup',
    'dominadas': 'pullup',
    'peso muerto': 'deadlift',
    'curl': 'biceps_curl',
    'plancha': 'plank',
    'zancada': 'lunges',
    'lateral': 'lateral_raises',
    'arnold': 'shoulder_press',
    'militar': 'shoulder_press',
    'crunch': 'crunch',
    'abdominal': 'crunch'
};

const text = fs.readFileSync(exercisesFile, 'utf8');
const lines = text.split('\n').filter(l => l.trim() !== '' && l !== 'name');

async function downloadImage(url, destPath) {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            headers: {
                'User-Agent': 'ValkyrAppBot/2.0 (contact@valkyrapp.com)'
            }
        });

        const writer = fs.createWriteStream(destPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (e) {
        console.error(`Error downloading ${url}: ${e.message}`);
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
    }
}

async function run() {
    console.log(`Processing ${lines.length} exercises...`);

    // Default fallback
    await downloadImage('https://upload.wikimedia.org/wikipedia/commons/8/89/Pushup.gif', path.join(outputDir, 'default.gif'));

    for (let line of lines) {
        const name = line.trim();
        const lowerName = name.toLowerCase();

        let targetKey = null;
        for (const [kw, key] of Object.entries(kwMap)) {
            if (lowerName.includes(kw)) {
                targetKey = key;
                break;
            }
        }

        const fileName = name.toLowerCase().replace(/ /g, '_') + '.gif';
        const destPath = path.join(outputDir, fileName);

        if (targetKey && validGifs[targetKey]) {
            console.log(`Downloading "${name}" from ${validGifs[targetKey]}...`);
            await downloadImage(validGifs[targetKey], destPath);
        } else {
            console.log(`Using fallback for "${name}"`);
            if (fs.existsSync(path.join(outputDir, 'default.gif'))) {
                fs.copyFileSync(path.join(outputDir, 'default.gif'), destPath);
            }
        }
    }
    console.log("All done!");
}

run();
