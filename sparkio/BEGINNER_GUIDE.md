# Beginner's Guide to Setting Up the Database

## What We're Doing
We're setting up your database so your app can work. Think of it like setting up a filing cabinet for your app's data.

## Step-by-Step Instructions

### Step 1: Install Prisma (The Database Tool)
Open your terminal/command prompt in the project folder and run:
```bash
npm install prisma @prisma/client
```
This installs the tools we need to work with the database.

### Step 2: Create .env File
We need to tell the app where your database is located.

1. In your project folder, create a file named `.env` (just `.env`, nothing else)
2. Copy this content into it:
```
DATABASE_URL="mysql://root@127.0.0.1:3306/sparkio"

DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sparkio
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=replace-with-32-char-secret
JWT_TTL=3600

FRONTEND_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
API_BASE_URL=http://localhost:8080
```

### Step 3: Clean Up Old Database Tables
Your database has old tables that conflict with the new ones. We need to remove them.

**In phpMyAdmin:**
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Click on `sparkio` database on the left
3. You'll see tables like: `users`, `referrals`, `wallets`, `withdrawals`, `ads`
4. Click the checkbox at the top to select ALL tables
5. From the dropdown at the bottom, choose "Drop" (delete)
6. Click "Yes" to confirm

**OR use SQL:**
In phpMyAdmin, go to the SQL tab and run:
```sql
DROP TABLE IF EXISTS ads;
DROP TABLE IF EXISTS withdrawals;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS referrals;
DROP TABLE IF EXISTS users;
```

### Step 4: Create New Database Tables
Now we'll create the new tables using Prisma:
```bash
npx prisma db push
```
This will ask you to confirm - type `y` and press Enter.

### Step 5: Generate Database Code
This creates code so your app can talk to the database:
```bash
npx prisma generate
```

### Step 6: Build Your App
Finally, build your app:
```bash
npm run build
```

## Troubleshooting

**Problem: "Cannot find module 'prisma'"**
- Solution: Run `npm install prisma @prisma/client` again

**Problem: "Access denied"**
- Solution: Check if MySQL password is needed. If yes, update DATABASE_URL to: `mysql://root:YOUR_PASSWORD@127.0.0.1:3306/sparkio`

**Problem: "Table already exists"**
- Solution: Make sure you dropped all old tables in Step 3

**Problem: MySQL not running**
- Solution: Open XAMPP Control Panel and make sure MySQL is running (green)

## Need Help?
If you get stuck at any step, let me know what error message you see!

