const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

// Read current .env
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Update values
envContent = envContent.replace(
  /FRONTEND_ORIGIN=.*/,
  'FRONTEND_ORIGIN=http://localhost:3005'
);

envContent = envContent.replace(
  /JWT_SECRET=.*/,
  'JWT_SECRET=sparkio-jwt-secret-key-32-characters-long'
);

// Check if API_BASE_URL needs updating
// If using PHP built-in server, the path should be http://localhost:8080
// The login route adds /api/auth/login.php, so the PHP server should serve from /api directory
// OR if using XAMPP, it should be http://localhost/sparkio

// For now, keep the current API_BASE_URL but ensure it's correct
// User can manually change if using XAMPP

// Write back
fs.writeFileSync(envPath, envContent, 'utf8');

console.log('✅ Updated .env file:');
console.log('  - FRONTEND_ORIGIN set to http://localhost:3005');
console.log('  - JWT_SECRET set to a proper secret');
console.log('');
console.log('⚠️  Please verify API_BASE_URL:');
console.log('  - For PHP built-in server: http://localhost:8080');
console.log('  - For XAMPP/Apache: http://localhost/sparkio');
console.log('');
console.log('After updating, restart your Next.js dev server!');

