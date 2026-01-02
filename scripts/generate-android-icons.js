import Jimp from 'jimp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_ICON = path.join(__dirname, '../public/brand/gainzio-symbol.png');
const ANDROID_RES_DIR = path.join(__dirname, '../android/app/src/main/res');

const SIZES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
};

async function generateIcons() {
    if (!fs.existsSync(SOURCE_ICON)) {
        console.error(`Source icon not found at: ${SOURCE_ICON}`);
        process.exit(1);
    }

    try {
        const image = await Jimp.read(SOURCE_ICON);

        // Create round version if needed (simple circle mask)
        const roundImage = image.clone();
        roundImage.circle();

        for (const [folder, size] of Object.entries(SIZES)) {
            const targetDir = path.join(ANDROID_RES_DIR, folder);

            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            // Square icon
            await image
                .clone()
                .resize(size, size)
                .writeAsync(path.join(targetDir, 'ic_launcher.png'));

            // Round icon
            await roundImage
                .clone()
                .resize(size, size)
                .writeAsync(path.join(targetDir, 'ic_launcher_round.png'));

            console.log(`Generated icons for ${folder} (${size}x${size})`);
        }

        console.log('✅ Android icons generated successfully!');
    } catch (err) {
        console.error('Error generating icons:', err);
        process.exit(1);
    }
}

generateIcons();
