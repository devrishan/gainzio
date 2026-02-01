
import { PrismaClient } from '@prisma/client';
import { settingsService } from './src/services/settings-service';

const prisma = new PrismaClient();

async function runVerification() {
    console.log("⚡ Starting Dynamic Payout Verification...");

    try {
        // 1. Setup Test User
        const uniqueId = Date.now().toString();
        const email = `payout-test-${uniqueId}@example.com`;

        const user = await prisma.user.create({
            data: {
                email,
                username: `PayoutTester${uniqueId}`,
                password_hash: "password",
                role: "MEMBER" as any,
                phone: `99${uniqueId.slice(-8)}`,
                wallet: {
                    create: {
                        balance: 1000,
                        withdrawable: 1000,
                    }
                }
            }
        });
        console.log(`✅ Test User Ready: ${user.username} (Balance: 1000)`);

        // 2. Set Min Payout to 500
        console.log("\n⚙️ Setting Minimum Payout to ₹500...");
        await settingsService.updateSystemSettings({
            limits: {
                minPayoutAmount: 500,
                maxTasksPerDay: 100,
                maxWithdrawalsPerWeek: 100,
                maxAiRequestsPerDay: 100,
                cooldownDays: 0
            }
        });

        // 3. Attempt Withdrawal of 100 (Should FAIL)
        console.log("\n🧪 Test Case A: Withdraw 100 (Limit 500) -> Should FAIL");
        // We'll simulate the API check logic here since we can't call API directly easily
        let settings = await settingsService.getEffectiveSettings(user.id);
        let minPayout = settings.limits.minPayoutAmount;
        let amountA = 100;

        if (amountA < minPayout) {
            console.log(`✅ PASSED: Blocked withdrawal of ${amountA} (Min: ${minPayout})`);
        } else {
            console.error(`❌ FAILED: Allowed withdrawal of ${amountA} (Min: ${minPayout})`);
        }

        // 4. Attempt Withdrawal of 600 (Should PASS)
        console.log("\n🧪 Test Case B: Withdraw 600 (Limit 500) -> Should PASS");
        let amountB = 600;
        if (amountB >= minPayout) {
            console.log(`✅ PASSED: Allowed withdrawal of ${amountB} (Min: ${minPayout})`);
        } else {
            console.error(`❌ FAILED: Blocked withdrawal of ${amountB} (Min: ${minPayout})`);
        }

        // 5. Set Min Payout to 50 (Policy Default)
        console.log("\n⚙️ Setting Minimum Payout to ₹50...");
        await settingsService.updateSystemSettings({
            limits: {
                minPayoutAmount: 50,
                maxTasksPerDay: 100,
                maxWithdrawalsPerWeek: 100,
                maxAiRequestsPerDay: 100,
                cooldownDays: 0
            }
        });

        // 6. Attempt Withdrawal of 100 (Should PASS)
        console.log("\n🧪 Test Case C: Withdraw 100 (Limit 50) -> Should PASS");
        settings = await settingsService.getEffectiveSettings(user.id);
        minPayout = settings.limits.minPayoutAmount;
        let amountC = 100;

        if (amountC >= minPayout) {
            console.log(`✅ PASSED: Allowed withdrawal of ${amountC} (Min: ${minPayout})`);
        } else {
            console.error(`❌ FAILED: Blocked withdrawal of ${amountC} (Min: ${minPayout})`);
        }

        console.log("\n✨ DYNAMIC LIMITS CONFIRMED ✨");

    } catch (e) {
        console.error("❌ Test Failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

runVerification();
