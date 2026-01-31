import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const zones = [
        {
            name: "Dashboard Main Banner",
            slug: "dashboard_main_banner",
            width: 800,
            height: 128,
            description: "Banner appearing above the stats grid on member dashboard."
        },
        {
            name: "Dashboard Sidebar Square",
            slug: "dashboard_sidebar_square",
            width: 300,
            height: 300,
            description: "Square ad in the sidebar column."
        }
    ];

    console.log("Seeding Ad Zones...");

    for (const zone of zones) {
        await prisma.adZone.upsert({
            where: { slug: zone.slug },
            update: {},
            create: zone
        });
        console.log(`- Upserted zone: ${zone.slug}`);
    }

    console.log("Seeding complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
