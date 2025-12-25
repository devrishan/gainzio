const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');
const jwtSecret = envContent.match(/JWT_SECRET=(.+)/)?.[1] || 'sparkio-jwt-secret-key-32-characters-long';

// Check if JWT_ACCESS_TOKEN_SECRET already exists
if (!envContent.includes('JWT_ACCESS_TOKEN_SECRET=')) {
  envContent += `\n# JWT Access/Refresh Token Secrets (using same as JWT_SECRET)\n`;
  envContent += `JWT_ACCESS_TOKEN_SECRET=${jwtSecret}\n`;
  envContent += `JWT_REFRESH_TOKEN_SECRET=${jwtSecret}\n`;
  
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ Added JWT_ACCESS_TOKEN_SECRET and JWT_REFRESH_TOKEN_SECRET to .env');
  console.log('');
  console.log('⚠️  IMPORTANT: Restart your Next.js dev server for changes to take effect!');
} else {
  console.log('✅ JWT secrets already configured in .env');
}

