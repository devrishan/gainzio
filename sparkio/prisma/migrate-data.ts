/**
 * Data Migration Script: MySQL (Sparkio) -> PostgreSQL (Earniq)
 * 
 * This script migrates data from the old MySQL database to the new PostgreSQL database.
 * 
 * Usage:
 * 1. Ensure both MySQL and PostgreSQL databases are accessible
 * 2. Set MYSQL_DATABASE_URL and DATABASE_URL in .env
 * 3. Run: npx tsx prisma/migrate-data.ts
 */

import { PrismaClient, Role, Rank, SubmissionStatus, WithdrawalStatus } from '@prisma/client';
import mysql from 'mysql2/promise';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// MySQL connection config (from old database)
const mysqlConfig = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'sparkio',
};

interface MySQLUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: 'member' | 'admin';
  referral_code: string;
  referred_by: number | null;
  created_at: Date;
}

interface MySQLReferral {
  id: number;
  referrer_id: number | null;
  referred_user_id: number;
  status: 'pending' | 'verified' | 'rejected';
  commission_amount: number;
  created_at: Date;
  updated_at: Date | null;
}

interface MySQLWallet {
  id: number;
  user_id: number;
  balance: number;
  total_earned: number;
  last_updated: Date | null;
}

interface MySQLWithdrawal {
  id: number;
  user_id: number;
  amount: number;
  status: 'pending' | 'processed' | 'failed';
  upi_id: string;
  created_at: Date;
  processed_at: Date | null;
}

async function migrateUsers(mysqlConn: mysql.Connection) {
  console.log('📦 Migrating users...');

  const [rows] = await mysqlConn.execute<mysql.RowDataPacket[]>(
    'SELECT * FROM users ORDER BY id'
  );

  const users = rows as MySQLUser[];
  let migrated = 0;
  let skipped = 0;

  for (const user of users) {
    try {
      // Map role
      const role = user.role === 'admin' ? Role.ADMIN : Role.USER;

      // Generate phone number if not exists (use email or username as fallback)
      // In production, you'd want to extract phone from existing data or ask users
      const phone = `9${String(user.id).padStart(9, '0')}`; // Temporary phone generation

      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { phone },
      });

      if (existing) {
        console.log(`  ⏭️  Skipping user ${user.username} (already exists)`);
        skipped++;
        continue;
      }

      // Create user with wallet and gamification
      await prisma.user.create({
        data: {
          phone,
          email: user.email,
          username: user.username,
          hashedPassword: user.password_hash, // Keep existing hash
          role,
          referralCode: user.referral_code,
          referredById: user.referred_by ? String(user.referred_by) : null,
          wallet: {
            create: {
              balance: 0,
              pendingAmount: 0,
              withdrawable: 0,
              lockedAmount: 0,
              coins: 0,
              totalEarned: 0,
              currency: 'INR',
            },
          },
          gamification: {
            create: {
              xp: 0,
              rank: Rank.NEWBIE,
              streakDays: 0,
            },
          },
          preferences: {
            create: {
              language: 'en',
              timezone: 'Asia/Kolkata',
              theme: 'light',
            },
          },
        },
      });

      migrated++;
      console.log(`  ✅ Migrated user: ${user.username} (${user.email})`);
    } catch (error) {
      console.error(`  ❌ Error migrating user ${user.username}:`, error);
    }
  }

  console.log(`  📊 Users: ${migrated} migrated, ${skipped} skipped\n`);
  return { migrated, skipped };
}

async function migrateWallets(mysqlConn: mysql.Connection) {
  console.log('💰 Migrating wallets...');

  const [rows] = await mysqlConn.execute<mysql.RowDataPacket[]>(
    'SELECT * FROM wallets'
  );

  const wallets = rows as MySQLWallet[];
  let migrated = 0;

  for (const wallet of wallets) {
    try {
      // Find user by old ID (we need to map MySQL IDs to PostgreSQL)
      // Since we generated phone numbers, we need a different approach
      // For now, we'll update wallets by finding users in order
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'asc' },
        include: { wallet: true },
      });

      const user = users[wallet.user_id - 1]; // Assuming sequential migration

      if (!user || !user.wallet) {
        console.log(`  ⚠️  User with old ID ${wallet.user_id} not found, skipping wallet`);
        continue;
      }

      await prisma.wallet.update({
        where: { id: user.wallet.id },
        data: {
          balance: wallet.balance,
          totalEarned: wallet.total_earned,
          withdrawable: wallet.balance, // Assume all balance is withdrawable
        },
      });

      migrated++;
    } catch (error) {
      console.error(`  ❌ Error migrating wallet for user_id ${wallet.user_id}:`, error);
    }
  }

  console.log(`  📊 Wallets: ${migrated} migrated\n`);
  return migrated;
}

async function migrateReferrals(mysqlConn: mysql.Connection) {
  console.log('🔗 Migrating referrals...');

  const [rows] = await mysqlConn.execute<mysql.RowDataPacket[]>(
    'SELECT * FROM referrals ORDER BY id'
  );

  const referrals = rows as MySQLReferral[];
  let migrated = 0;

  // Get all users in order to map old IDs
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
  });

  for (const referral of referrals) {
    try {
      const referrer = referral.referrer_id ? users[referral.referrer_id - 1] : null;
      const referredUser = users[referral.referred_user_id - 1];

      if (!referredUser) {
        console.log(`  ⚠️  Referred user ${referral.referred_user_id} not found, skipping`);
        continue;
      }

      // Map status
      const status = referral.status === 'verified' ? 'verified' :
        referral.status === 'rejected' ? 'rejected' : 'pending';

      if (!referrer) {
        console.log(`  ⚠️  Referrer for referral ${referral.id} not found, skipping`);
        continue;
      }

      await prisma.referral.create({
        data: {
          referrerId: referrer.id,
          referredUserId: referredUser.id,
          status,
          commissionAmount: referral.commission_amount,
          level: 1, // Default to L1, adjust if you have level data
        },
      });

      migrated++;
    } catch (error) {
      console.error(`  ❌ Error migrating referral ${referral.id}:`, error);
    }
  }

  console.log(`  📊 Referrals: ${migrated} migrated\n`);
  return migrated;
}

async function migrateWithdrawals(mysqlConn: mysql.Connection) {
  console.log('💸 Migrating withdrawals...');

  const [rows] = await mysqlConn.execute<mysql.RowDataPacket[]>(
    'SELECT * FROM withdrawals ORDER BY id'
  );

  const withdrawals = rows as MySQLWithdrawal[];
  let migrated = 0;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    include: { wallet: true },
  });

  for (const withdrawal of withdrawals) {
    try {
      const user = users[withdrawal.user_id - 1];

      if (!user || !user.wallet) {
        console.log(`  ⚠️  User ${withdrawal.user_id} not found, skipping withdrawal`);
        continue;
      }

      // Map status
      const status = withdrawal.status === 'processed' ? WithdrawalStatus.COMPLETED :
        withdrawal.status === 'failed' ? WithdrawalStatus.FAILED :
          WithdrawalStatus.PENDING;

      await prisma.withdrawal.create({
        data: {
          userId: user.id,
          amount: withdrawal.amount,
          status,
          upiId: withdrawal.upi_id,
          processedAt: withdrawal.processed_at,
        },
      });

      migrated++;
    } catch (error) {
      console.error(`  ❌ Error migrating withdrawal ${withdrawal.id}:`, error);
    }
  }

  console.log(`  📊 Withdrawals: ${migrated} migrated\n`);
  return migrated;
}

async function main() {
  console.log('🚀 Starting data migration from MySQL to PostgreSQL...\n');

  let mysqlConn: mysql.Connection | null = null;

  try {
    // Connect to MySQL
    console.log('📡 Connecting to MySQL...');
    mysqlConn = await mysql.createConnection(mysqlConfig);
    console.log('✅ Connected to MySQL\n');

    // Test PostgreSQL connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Run migrations
    await migrateUsers(mysqlConn);
    await migrateWallets(mysqlConn);
    await migrateReferrals(mysqlConn);
    await migrateWithdrawals(mysqlConn);

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (mysqlConn) {
      await mysqlConn.end();
    }
    await prisma.$disconnect();
  }
}

main();

