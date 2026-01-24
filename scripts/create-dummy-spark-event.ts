import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EVENT_TYPES = [
    { type: 'TASK_APPROVED', template: 'User_{id} completed a high-value task!' },
    { type: 'RANK_UPGRADE', template: 'User_{id} just reached {rank} rank! 🏆' },
    { type: 'REFERRAL_VERIFIED', template: 'User_{id} invited a new member to the squad.' },
    { type: 'WITHDRAWAL_COMPLETED', template: 'User_{id} just cashed out ₹{amount}!' },
    { type: 'REWARD', template: 'User_{id} claimed a daily streak bonus.' }
];

const RANKS = ['PRO', 'ELITE', 'MASTER'];

async function main() {
    try {
        console.log('Clearing old spark events...');
        // Optional: clear old public events to keep the wall fresh
        // await prisma.sparkEvent.deleteMany({ where: { isPublic: true } });

        console.log('Seeding Spark Wall with diverse events...');
        const events = [];

        for (let i = 0; i < 20; i++) {
            const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
            const userId = Math.floor(1000 + Math.random() * 9000);

            let message = eventType.template.replace('{id}', userId.toString());
            let data = {};

            if (eventType.type === 'RANK_UPGRADE') {
                const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
                message = message.replace('{rank}', rank);
                data = { rank };
            } else if (eventType.type === 'WITHDRAWAL_COMPLETED') {
                const amount = (Math.floor(Math.random() * 50) + 1) * 100;
                message = message.replace('{amount}', amount.toString());
                data = { amount };
            }

            // Random time within last 24 hours
            const timeAgo = Math.floor(Math.random() * 24 * 60 * 60 * 1000);
            const createdAt = new Date(Date.now() - timeAgo);

            events.push({
                type: eventType.type,
                message,
                isPublic: true,
                data,
                createdAt
            });
        }

        await prisma.sparkEvent.createMany({
            data: events
        });

        console.log(`Successfully created ${events.length} spark events.`);
    } catch (e) {
        console.error('Error seeding spark wall:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
