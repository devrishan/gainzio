
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const email = "info.gainzio@gmail.com";
    const password = "Admin@123";
    const hashedPassword = await hash(password, 12);

    const admin = await prisma.user.upsert({
        where: { email },
        update: {
            password_hash: hashedPassword,
            role: "ADMIN",
        },
        create: {
            email,
            password_hash: hashedPassword,
            role: "ADMIN",
            username: "admin_superuser",
            name: "Super Admin",
            phone: "+919999999999", // Dummy phone to satisfy unique constraint if needed
        },
    });

    console.log({ admin });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
