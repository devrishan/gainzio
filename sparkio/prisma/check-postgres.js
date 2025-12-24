/**
 * Quick script to check PostgreSQL connection
 * Run: node prisma/check-postgres.js
 * Note: Next.js automatically loads .env, but for standalone scripts we need to load it
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkConnection() {
  try {
    console.log('🔍 Checking PostgreSQL connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') || 'NOT SET');
    
    await prisma.$connect();
    console.log('✅ Successfully connected to PostgreSQL!');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('📊 PostgreSQL version:', result[0]?.version || 'Unknown');
    
    // Check if database exists
    const dbCheck = await prisma.$queryRaw`SELECT current_database()`;
    console.log('📁 Current database:', dbCheck[0]?.current_database || 'Unknown');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check DATABASE_URL in .env file');
    console.log('3. Verify database exists: CREATE DATABASE earniq;');
    console.log('4. Check username/password are correct');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();

