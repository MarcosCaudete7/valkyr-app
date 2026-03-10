const sharp = require('sharp');

async function processLogo() {
    const inputPath = '/home/marcos/Documentos/GitHub/valkyr-app/front_end/public/valkyr_logo_square.png';
    const outputPath = '/home/marcos/Documentos/GitHub/valkyr-app/front_end/public/valkyr_logo_square_transparent.png';

    // 1. First, crop out the excess dark space around the logo to make it larger and centered.
    // The logo itself is centered. Let's extract a tighter bounding box.
    const metadata = await sharp(inputPath).metadata();
    
    // We will extract a tighter square from the middle
    let cropSize = Math.floor(metadata.width * 0.6); // Take 60% of the width
    if (cropSize > metadata.height) cropSize = metadata.height;
    
    const left = Math.floor((metadata.width - cropSize) / 2);
    const top = Math.floor((metadata.height - cropSize) / 2);

    const croppedBuffer = await sharp(inputPath)
        .extract({ left, top, width: cropSize, height: cropSize })
        .toBuffer();

    // 2. Remove the dark background pixels
    const { data, info } = await sharp(croppedBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    
    // Thresholding: The logo is cyan/gold/white. The background is a very dark textured grey/black.
    // We will aggressively make pixels with R<60, G<60, B<60 fully transparent.
    // To anti-alias the edges slightly, we could use a soft transition, but a hard cut usually looks cleaner than grey halos.
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const a = data[i+3];
        
        // If it's a dark color (grey/black), delete it.
        // We ensure we don't accidentally delete the vibrant blue/gold.
        if (r < 65 && g < 65 && b < 65) {
            data[i+3] = 0; // Make transparent
        } else if (r < 85 && g < 85 && b < 85) {
             // Anti-aliasing edge blending for slightly lighter grey artifacts
            data[i+3] = Math.max(0, a - 150); 
        }
    }
    
    // 3. Save as the new transparent square logo
    await sharp(data, {
        raw: {
            width: info.width,
            height: info.height,
            channels: 4
        }
    })
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toFile(outputPath);
    
    console.log("Successfully extracted cleanly cropped transparent logo.");
}

processLogo().catch(console.error);
