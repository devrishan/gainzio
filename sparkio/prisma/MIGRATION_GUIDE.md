# Data Migration Guide: MySQL → PostgreSQL

This guide explains how to migrate your existing data from the MySQL `sparkio` database to the new PostgreSQL `earniq` database.

## Prerequisites

1. **PostgreSQL Database**: Ensure PostgreSQL is installed and running
2. **MySQL Database**: Your existing MySQL database should be accessible
3. **Node.js Dependencies**: Install required packages

## Step 1: Install Dependencies

```bash
npm install
```

This will install `mysql2` which is needed for the migration script.

## Step 2: Configure Environment Variables

Add the following to your `.env` file:

```env
# PostgreSQL (new database)
DATABASE_URL="postgresql://user:password@localhost:5432/earniq?schema=public"

# MySQL (old database - for migration)
MYSQL_HOST="127.0.0.1"
MYSQL_PORT="3306"
MYSQL_DATABASE="sparkio"
MYSQL_USER="root"
MYSQL_PASSWORD=""
```

## Step 3: Create PostgreSQL Database

```bash
# Using psql
createdb earniq

# Or using SQL
psql -U postgres -c "CREATE DATABASE earniq;"
```

## Step 4: Run Prisma Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations to create tables
npm run db:migrate
```

## Step 5: Run Data Migration

```bash
npx tsx prisma/migrate-data.ts
```

This script will:
- ✅ Connect to both MySQL and PostgreSQL
- ✅ Migrate users (with wallet and gamification setup)
- ✅ Migrate wallet balances
- ✅ Migrate referrals
- ✅ Migrate withdrawals

## Important Notes

### Phone Number Mapping

The migration script generates temporary phone numbers for users since the old schema didn't have phone numbers. **You'll need to update phone numbers manually** or ask users to verify their phone numbers through OTP.

To update phone numbers after migration:

```sql
-- Example: Update a user's phone number
UPDATE "User" SET phone = '9876543210' WHERE email = 'user@example.com';
```

### User ID Mapping

The script assumes users are migrated in the same order. If you have a large database, you may want to:
1. Export MySQL user IDs and emails
2. Create a mapping file
3. Update the migration script to use the mapping

### Password Hashes

Existing password hashes are preserved, so users can still log in with their old passwords (if password-based login is enabled).

### Referral Relationships

Referral relationships are preserved, but you may need to verify multi-level referrals (L1/L2/L3) as the old schema only had direct referrals.

## Verification

After migration, verify the data:

```bash
# Check user count
npx prisma studio
# Or use SQL
psql -U postgres -d earniq -c "SELECT COUNT(*) FROM \"User\";"
```

## Troubleshooting

### Connection Errors

- Ensure both databases are running
- Check firewall settings
- Verify credentials in `.env`

### Data Mismatches

- Check console output for skipped records
- Review error messages for specific issues
- Some data may need manual correction

### Phone Number Issues

Since the old schema didn't have phone numbers, you'll need to:
1. Contact users to verify their phone numbers
2. Or import phone numbers from another source
3. Or use a phone number generation strategy that matches your business logic

## Next Steps

After successful migration:

1. ✅ Test authentication with migrated users
2. ✅ Verify wallet balances
3. ✅ Check referral relationships
4. ✅ Test withdrawal functionality
5. ✅ Update phone numbers for users
6. ✅ Run the seed script to add any missing default data

## Rollback

If something goes wrong, you can:
1. Drop the PostgreSQL database: `DROP DATABASE earniq;`
2. Recreate it and run migrations again
3. Re-run the migration script

The original MySQL database remains untouched, so you can always start fresh.

