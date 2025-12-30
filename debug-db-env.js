const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

console.log('--- ENV DEBUG START ---');

// 1. Check file directly
try {
    const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    const dbLine = envContent.split('\n').find(l => l.startsWith('DATABASE_URL'));
    console.log('[File Check] .env DATABASE_URL line:', dbLine);
} catch (e) {
    console.log('[File Check] Error reading .env:', e.message);
}

// 2. Load with dotenv
const result = dotenv.config();
if (result.error) {
    console.log('[Dotenv] Error loading:', result.error);
}

// 3. Print final process.env value
console.log('[Process Env] DATABASE_URL Check:');
const url = process.env.DATABASE_URL;
if (!url) {
    console.log('  -> UNDEFINED');
} else {
    console.log('  -> Value:', url);
    console.log('  -> Starts with mysql:// ?', url.startsWith('mysql://'));
    console.log('  -> Length:', url.length);
    console.log('  -> Inspect:', require('util').inspect(url));
}

console.log('--- ENV DEBUG END ---');
