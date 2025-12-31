import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';
import 'dotenv/config'; // Load .env file
// fetch is global in Node 18+

const prisma = new PrismaClient();
const AUTH_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "fallback-secret-if-missing";
const API_URL = "http://localhost:3000/api";

async function generateToken(userId: string) {
    const verifiedSecret = new TextEncoder().encode(AUTH_SECRET);
    return new SignJWT({ sub: userId, role: 'USER' })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1h')
        .sign(verifiedSecret);
}

async function main() {
    console.log("🚀 Starting Economy Verification...");

    // 1. Create Test User
    const email = `economy_test_${Date.now()}@test.com`;
    const user = await prisma.user.create({
        data: {
            email,
            username: `econ_${Date.now()}`,
            wallet: {
                create: {
                    balance: 0,
                    withdrawable: 1000, // Give them money to test withdrawal
                    lockedAmount: 0,
                    coins: 500
                }
            }
        },
        include: { wallet: true }
    });
    console.log(`✅ Created user: ${user.id} (${user.email})`);

    // 2. Generate Token
    const token = await generateToken(user.id);
    console.log(`🔑 Generated token`);

    // 3. Test Wallet API
    const walletRes = await fetch(`${API_URL}/member/wallet`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const walletData = await walletRes.json();
    console.log("💰 Wallet API Response:", walletData.success ? "Success" : "Failed");
    if (!walletData.success || walletData.wallet.withdrawable !== 1000) {
        console.error("❌ Wallet mismatch:", walletData);
        process.exit(1);
    }

    // 4. Test Withdrawal (Success Case)
    console.log("🏦 Testing Withdrawal (100 INR)...");
    const withdrawRes = await fetch(`${API_URL}/member/withdraw`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: 100,
            upiId: "test@upi"
        })
    });
    const withdrawData = await withdrawRes.json();
    console.log("✅ Withdrawal Response:", withdrawData.success ? "Success" : "Failed", withdrawData.message || withdrawData.error);

    if (!withdrawData.success) {
        console.error("❌ Withdrawal Failed unexpectedly");
        process.exit(1);
    }

    // 5. Verify DB State (Balance Deduction)
    const updatedWallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    console.log(`📉 Updated Withdrawable: ${updatedWallet?.withdrawable} (Expected 900)`);

    if (Number(updatedWallet?.withdrawable) !== 900) {
        console.error("❌ Balance deduction failed!");
        process.exit(1);
    }

    // 6. Test Withdrawal (Insufficient Funds)
    console.log("🏦 Testing Over-Withdrawal (5000 INR)...");
    const failRes = await fetch(`${API_URL}/member/withdraw`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: 5000,
            upiId: "fail@upi"
        })
    });
    const failData = await failRes.json();
    console.log("🛡️ Over-withdraw Response:", failData.success ? "Failed (Bad)" : "Success (Blocked)", failData.error);

    if (failData.success) {
        console.error("❌ Over-withdrawal passed! CRITICAL FAILURE");
        process.exit(1);
    }

    // Cleanup
    await prisma.withdrawal.deleteMany({ where: { userId: user.id } });
    await prisma.walletTransaction.deleteMany({ where: { userId: user.id } });
    await prisma.wallet.delete({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log("🧹 Cleanup complete");
}

main().catch((e) => {
    console.error("❌ Fatal Error:", e);
    if (e instanceof Error) console.error(e.stack);
});
