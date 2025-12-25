# PostgreSQL Setup & Migration Guide

## Step 1: Install PostgreSQL (if not already installed)

### Windows:
1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set for the `postgres` user
4. Default port is `5432`

### Verify Installation:
```bash
psql --version
```

## Step 2: Create PostgreSQL Database

Open a command prompt and run:

```bash
# Connect to PostgreSQL (default user is 'postgres')
psql -U postgres

# Or if you have a password prompt:
psql -U postgres -h localhost
```

Then in the PostgreSQL prompt:
```sql
-- Create the database
CREATE DATABASE earniq;

-- Exit psql
\q
```

**Alternative (one-line):**
```bash
# Windows (if psql is in PATH)
psql -U postgres -c "CREATE DATABASE earniq;"

# Or using createdb command
createdb -U postgres earniq
```

## Step 3: Update .env File

Open your `.env` file and update the `DATABASE_URL`:

```env
# Change from:
DATABASE_URL="mysql://root@127.0.0.1:3306/sparkio"

# To (replace 'password' with your PostgreSQL password):
DATABASE_URL="postgresql://postgres:password@localhost:5432/earniq?schema=public"
```

**Format:** `postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public`

**Common configurations:**
- Default user: `postgres`
- Default port: `5432`
- Default host: `localhost` or `127.0.0.1`

## Step 4: Run Prisma Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Create database tables
npm run db:migrate
```

This will:
- Create all tables in PostgreSQL
- Set up relationships and indexes
- Create migration history

## Step 5: Migrate Data from MySQL

Once the PostgreSQL schema is ready:

```bash
# Make sure MySQL variables are set in .env:
# MYSQL_HOST="127.0.0.1"
# MYSQL_PORT="3306"
# MYSQL_DATABASE="sparkio"
# MYSQL_USER="root"
# MYSQL_PASSWORD=""

# Run data migration
npm run db:migrate-data
```

## Troubleshooting

### "Connection refused" error:
- Check if PostgreSQL service is running
- Windows: Services → PostgreSQL
- Verify port 5432 is not blocked

### "Authentication failed":
- Check username/password in DATABASE_URL
- Try: `psql -U postgres` to test connection

### "Database does not exist":
- Create it manually: `CREATE DATABASE earniq;`
- Or use: `createdb -U postgres earniq`

### "Password authentication failed":
- Reset PostgreSQL password or use correct password in DATABASE_URL
- For development, you can set `trust` authentication in `pg_hba.conf`

