const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Shop Items...');

    const items = [
        {
            name: 'Streak Freeze',
            description: 'Miss a day without losing your streak!',
            cost: 500,
            type: 'CONSUMABLE',
            icon: 'Snowflake',
            isActive: true
        },
        {
            name: 'Double XP Boost',
            description: 'Earn 2x XP for the next 24 hours.',
            cost: 1000,
            type: 'PERK',
            icon: 'Zap',
            isActive: true
        },
        {
            name: 'Task Peek',
            description: 'See tomorrow\'s daily tasks ahead of time.',
            cost: 200,
            type: 'CONSUMABLE',
            icon: 'Eye',
            isActive: true
        }
    ];

    for (const item of items) {
        await prisma.shopItem.create({
            data: item
        });
        console.log(`Created: ${item.name}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
