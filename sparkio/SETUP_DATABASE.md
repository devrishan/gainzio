# Database Setup Guide

## Step 1: Install Prisma
```bash
npm install prisma @prisma/client
```

## Step 2: Create .env file
Create a `.env` file in the root directory with:
```
DATABASE_URL="mysql://root@127.0.0.1:3306/sparkio"
```

If your MySQL has a password:
```
DATABASE_URL="mysql://root:YOUR_PASSWORD@127.0.0.1:3306/sparkio"
```

## Step 3: Handle Database Conflict

You have two options:

### Option A: Reset Database (Recommended if no important data)

1. **Drop existing tables** (in phpMyAdmin or MySQL):
   - Go to phpMyAdmin
   - Select `sparkio` database
   - Drop all existing tables (users, referrals, wallets, withdrawals, ads)

2. **Push Prisma schema**:
   ```bash
   npx prisma db push
   ```

3. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

### Option B: Use a New Database (Keep old data)

1. **Create new database**:
   ```sql
   CREATE DATABASE sparkio_prisma CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Update .env**:
   ```
   DATABASE_URL="mysql://root@127.0.0.1:3306/sparkio_prisma"
   ```

3. **Push Prisma schema**:
   ```bash
   npx prisma db push
   ```

4. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

## Step 4: Build the Project
```bash
npm run build
```

## Troubleshooting

- **Error: Duplicate key name**: The old schema has conflicting indexes. Use Option A to reset.
- **Error: Table already exists**: Drop the conflicting tables first.
- **Connection refused**: Make sure MySQL is running in XAMPP.

