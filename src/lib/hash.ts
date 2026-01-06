import { compare, hash } from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
    return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const isValid = await compare(password, hashedPassword);
    return isValid;
}
