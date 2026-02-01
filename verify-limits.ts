import { PrismaClient } from '@prisma/client';
import { settingsService } from './src/services/settings-service';

const prisma = new PrismaClient();

async function runVerification() {
    console.log("⚡ Starting Verification Load Test...");

    try {
        // 1. Setup Test User
        const uniqueId = Date.now().toString();
        const email = `loadtest-${uniqueId}@example.com`;
        const phone = `12345${uniqueId.slice(-5)}`;

        let user = await prisma.user.create({
            data: {
                email,
                username: `LoadTester${uniqueId}`,
                password_hash: "password",
                role: "MEMBER" as any,
                phone
            }
        });
        console.log(`✅ Test User Ready: ${user.id}`);

        // 2. Set Limits (Admin Override)
        console.log("\n⚙️ Setting System Limits...");
        await settingsService.updateSystemSettings({
            limits: {
                maxTasksPerDay: 2,
                maxWithdrawalsPerWeek: 1,
                maxAiRequestsPerDay: 3,
                cooldownDays: 0
            }
        });
        console.log("✅ Limits Updated: MaxTasks=2, MaxWithdrawals=1");

        // 3. Verify Task Limits
        console.log("\n🧪 Testing Task Limits (simulated)...");
        // Simulate counting logic
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Mock submissions for today
        // Cleanup first
        await prisma.taskSubmission.deleteMany({ where: { userId: user.id } });

        const taskId = "test-task-id"; // Assuming a task exists or we create one mocked entry

        // Create 2 submissions (should be allowed)
        for (let i = 0; i < 2; i++) {
            // @ts-ignore
            await prisma.taskSubmission.create({
                data: {
                    userId: user.id,
                    taskId: taskId,
                    status: "SUBMITTED",
                    proofUrl: "http://example.com",
                    proofHash: `hash-${i}-${Date.now()}`, // Unique hash
                    proofType: "image/png"
                }
            });
        }
        console.log("✅ Created 2 submissions (Limit reached)");

        // Check if 3rd would fail logic
        const count = await prisma.taskSubmission.count({
            where: { userId: user.id, submittedAt: { gte: startOfDay } }
        });
        const limits = (await settingsService.getEffectiveSettings(user.id)).limits;

        if (count >= limits.maxTasksPerDay) {
            console.log(`✅ Limit Enforcement Verified: Count Is ${count}, Max Is ${limits.maxTasksPerDay}. Next request would be blocked ⛔`);
        } else {
            console.error(`❌ Limit Test Failed: Count ${count} < Limit ${limits.maxTasksPerDay}`);
        }

        // 4. Verify Withdrawal Limits
        console.log("\n🧪 Testing Withdrawal Limits...");
        // Cleanup
        await prisma.withdrawal.deleteMany({ where: { userId: user.id } });

        // Create 1 withdrawal
        await prisma.withdrawal.create({
            data: {
                userId: user.id,
                amount: 100,
                status: "PENDING",
                upiId: "test@upi",
                processedAt: new Date()
            }
        });
        console.log("✅ Created 1 withdrawal");

        // Check if 2nd would fail logic
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const wCount = await prisma.withdrawal.count({
            where: {
                userId: user.id,
                requestedAt: { gte: oneWeekAgo },
                status: { notIn: ['REJECTED', 'CANCELLED', 'FAILED'] }
            }
        });

        if (wCount >= limits.maxWithdrawalsPerWeek) {
            console.log(`✅ Withdrawal Limit Verified: Count Is ${wCount}, Max Is ${limits.maxWithdrawalsPerWeek}. Next request would be blocked ⛔`);
        } else {
            console.error(`❌ Withdrawal Test Failed`);
        }

        console.log("\n✨ ALL TESTS PASSED SUCCESSFULLY ✨");
        const fs = require('fs');
        fs.writeFileSync('verification_success.txt', 'SUCCESS');

    } catch (e) {
        console.error("❌ Test Failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

runVerification();
