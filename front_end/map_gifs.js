import fs from 'fs';
import path from 'path';

const exercisesFile = '/tmp/exercises_valkyr.txt';
const csvFile = '/home/marcos/Documentos/GitHub/valkyr-app/front_end/public/assets/exercises/source_gifs/exercises.csv';
const sourceAssetDir = '/home/marcos/Documentos/GitHub/valkyr-app/front_end/public/assets/exercises/source_gifs/assets';
const outputDir = '/home/marcos/Documentos/GitHub/valkyr-app/front_end/public/assets/exercises';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Load CSV to map English Name -> ID
const csvText = fs.readFileSync(csvFile, 'utf8');
const csvLines = csvText.split('\n').filter(l => l.trim().length > 0);
const englishToId = {};
for (let i = 1; i < csvLines.length; i++) {
    // csv format: bodyPart,equipment,id,name,target,...
    // Some names have commas inside quotes, so split robustly or simply:
    const parts = csvLines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || csvLines[i].split(',');
    // Wait, simpler: it's well-structured. id is at index 2, name at index 3.
    const split = csvLines[i].split(',');
    if (split.length > 3) {
        let id = split[2].replace(/"/g, '').padStart(4, '0');
        let enName = split[3].replace(/"/g, '').toLowerCase();
        englishToId[enName] = id;
    }
}

// Map of specific Spanish keywords to English exact or partial matches
// Ordered by priority (most specific first)
const kwMap = [
    ['aperturas con mancuernas', 'dumbbell fly'],
    ['aperturas en polea', 'cable inline fly'], // or cable fly
    ['cruce de poleas', 'cable crossover'],
    ['bicicleta', 'bicycle crunch'],
    ['bird dog', 'bird dog'],
    ['buenos días', 'good morning'],
    ['crunch en polea', 'cable crunch'],
    ['crunch', 'crunch'],
    ['curl 21s', 'barbell curl'],
    ['curl araña', 'spider curl'],
    ['curl con barra z', 'ez barbell curl'],
    ['curl con barra', 'barbell curl'],
    ['curl concentrado', 'concentration curl'],
    ['curl de arrastre', 'drag curl'],
    ['curl de isquios', 'leg curl'],
    ['curl femoral tumbado', 'lying leg curl'],
    ['curl en polea', 'cable curl'],
    ['curl inverso', 'reverse curl'],
    ['curl martillo', 'hammer curl'],
    ['curl predicador', 'preacher curl'],
    ['curl zottman', 'zottman curl'],
    ['dead bug', 'dead bug'],
    ['dominadas supinas', 'chin-up'],
    ['dominadas', 'pull-up'],
    ['dragon flag', 'dragon flag'],
    ['elevación de piernas colgado', 'hanging leg raise'],
    ['elevación de rodillas', 'knee raise'],
    ['elevación de talones a una pierna', 'single leg calf raise'],
    ['elevación de talones de pie', 'standing calf raise'],
    ['elevaciones en y', 'y-raise'],
    ['elevaciones frontales', 'front raise'],
    ['elevaciones laterales tumbado', 'lying lateral raise'],
    ['elevaciones laterales', 'lateral raise'],
    ['extensión tras nuca', 'overhead triceps extension'],
    ['extensiones de cuádriceps', 'leg extension'],
    ['extensiones de tríceps en polea', 'cable triceps extension'],
    ['face pull', 'face pull'],
    ['flexiones declinadas', 'decline push-up'],
    ['flexiones inclinadas', 'incline push-up'],
    ['flexiones', 'push-up'],
    ['fondos en máquina asistida', 'assisted dip'],
    ['fondos en paralelas', 'triceps dip'],
    ['fondos entre bancos', 'bench dip'],
    ['hip thrust', 'hip thrust'],
    ['hiperextensiones', 'hyperextension'],
    ['jalón al pecho agarre estrecho', 'v-bar pulldown'],
    ['jalón al pecho', 'lat pulldown'],
    ['jm press', 'jm press'],
    ['kickback', 'triceps kickback'],
    ['abducción', 'abductor'],
    ['aducción', 'adductor'],
    ['pájaros en máquina', 'reverse machine fly'],
    ['pájaros', 'reverse fly'],
    ['paseo del granjero', 'farmer'],
    ['patada de tríceps', 'triceps kickback'],
    ['pec-deck', 'pec deck'],
    ['peso muerto con piernas rígidas', 'stiff leg deadlift'],
    ['peso muerto rumano', 'romanian deadlift'],
    ['peso muerto convencional', 'barbell deadlift'],
    ['peso muerto', 'deadlift'],
    ['plancha lateral', 'side plank'],
    ['plancha', 'front plank'],
    ['prensa de piernas', 'leg press'],
    ['press arnold', 'arnold press'],
    ['press bradford', 'bradford press'],
    ['press cubano', 'cuban press'],
    ['press de banca agarre cerrado', 'close-grip bench press'],
    ['press de banca en máquina smith', 'smith machine bench press'],
    ['press de banca en multipower', 'smith machine bench press'],
    ['press de banca inclinado', 'incline bench press'],
    ['press de banca plano', 'bench press'],
    ['press de banca', 'bench press'],
    ['press de suelo', 'floor press'],
    ['press declinado', 'decline bench press'],
    ['press francés', 'skull crusher'],
    ['press hexagonal', 'hex press'],
    ['press militar con barra', 'military press'],
    ['press push', 'push press'],
    ['press svend', 'svend press'],
    ['press tate', 'tate press'],
    ['pull over en polea', 'cable pullover'],
    ['pulldown con brazos', 'straight arm pulldown'],
    ['remo al cuello en polea', 'cable upright row'],
    ['remo al mentón', 'upright row'],
    ['remo con barra', 'barbell bent over row'],
    ['remo con mancuerna', 'dumbbell row'],
    ['remo en polea baja', 'seated cable row'],
    ['remo en punta', 't-bar row'],
    ['remo invertido', 'inverted row'],
    ['remo meadows', 'meadows row'],
    ['remo yates', 'yates row'],
    ['rueda abdominal', 'ab roller'],
    ['sentadilla búlgara', 'bulgarian split squat'],
    ['sentadilla con barra', 'barbell squat'],
    ['sentadilla hack', 'hack squat'],
    ['sentadilla sissy', 'sissy squat'],
    ['sentadilla zercher', 'zercher squat'],
    ['step-ups', 'step-up'],
    ['woodchoppers', 'cable woodchopper'],
    ['zancadas inversas', 'reverse lunge'],
    ['zancadas', 'lunge'],
    // Generic fallbacks
    ['pecho', 'bench press'],
    ['espalda', 'pull-up'],
    ['pierna', 'squat'],
    ['brazo', 'biceps curl']
];

const text = fs.readFileSync(exercisesFile, 'utf8');
const lines = text.split('\n').filter(l => l.trim() !== '' && l !== 'name');

console.log(`Mapping ${lines.length} exercises...`);

let successCount = 0;
for (let line of lines) {
    const origName = line.trim();
    const lowerName = origName.toLowerCase();

    let targetId = null;
    let targetEnglish = null;

    // 1. Find matching English keyword
    for (const [esKey, enName] of kwMap) {
        if (lowerName.includes(esKey)) {
            // Find in englishToId
            // Try exact match first
            if (englishToId[enName]) {
                targetId = englishToId[enName];
                targetEnglish = enName;
            } else {
                // Try fuzzy match in english names
                for (const [csvEnName, id] of Object.entries(englishToId)) {
                    if (csvEnName.includes(enName)) {
                        targetId = id;
                        targetEnglish = csvEnName;
                        break;
                    }
                }
            }
            if (targetId) break;
        }
    }

    if (!targetId) {
        console.log(`[WARN] No map found for "${origName}", defaulting to 0025 (Bench Press)`);
        targetId = '0025';
    }

    const fileName = lowerName.replace(/ /g, '_') + '.gif';
    const destPath = path.join(outputDir, fileName);
    let srcPath = path.join(sourceAssetDir, `${targetId}.gif`);

    if (!fs.existsSync(srcPath)) {
        console.log(`[ERROR] File missing in source for ID ${targetId} (${targetEnglish})`);
        srcPath = path.join(sourceAssetDir, '0025.gif');
    }

    try {
        fs.copyFileSync(srcPath, destPath);
        successCount++;
    } catch (e) {
        console.error(`Failed to map ${fileName}: ${e.message}`);
    }
}
console.log(`Done! Map rate: ${successCount}/${lines.length}`);
