import { PrismaClient, Role, Rank } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Demo User...');

    const demoPassword = await bcrypt.hash('Demo@123', 10);

    try {
        const demoUser = await prisma.user.upsert({
            where: { email: 'demo@gainzio.com' },
            update: {
                hashedPassword: demoPassword,
                role: Role.USER,
            },
            create: {
                email: 'demo@gainzio.com',
                username: 'demouser',
                name: 'Demo User',
                role: Role.USER,
                referralCode: 'DEMO001',
                hashedPassword: demoPassword,
                wallet: {
                    create: {
                        balance: 1000,
                        pendingAmount: 0,
                        withdrawable: 1000,
                        lockedAmount: 0,
                        coins: 500,
                        totalEarned: 1000,
                        currency: 'INR',
                    },
                },
                gamification: {
                    create: {
                        xp: 100,
                        rank: Rank.NEWBIE,
                        streakDays: 5,
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
        console.log('✅ Demo user created/updated:', demoUser.id);
    } catch (error) {
        console.error('Error seeding demo user:', error);
    }
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
