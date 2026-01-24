import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const event = await prisma.sparkEvent.create({
            data: {
                type: 'REWARD',
                message: 'A User just earned 100 XP from a Daily Quest!',
                isPublic: true,
                data: { xp: 100 }
            }
        });
        console.log('Created dummy event:', event);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
