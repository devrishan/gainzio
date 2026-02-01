import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyPassword } from "@/lib/hash";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
    debug: process.env.NODE_ENV === "development",
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            profile(profile) {
                const isSuperAdmin = profile.email === "info.gainzio@gmail.com";
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    role: isSuperAdmin ? "SUPER_ADMIN" : "USER",
                    username: profile.email?.split("@")[0] + Math.floor(1000 + Math.random() * 9000).toString(), // Fallback username with random suffix
                    emailVerified: profile.email_verified ? new Date() : null,
                };
            },
            allowDangerousEmailAccountLinking: true,
        }),
        CredentialsProvider({
            name: "Admin Login",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                // Allow any admin-level role
                if (!user || !["ADMIN", "SUPER_ADMIN", "SUPPORT"].includes(user.role)) {
                    throw new Error("Access denied");
                }

                if (!user.password_hash) {
                    throw new Error("Admin must log in via Google first to set up");
                }

                const isValid = await verifyPassword(credentials.password, user.password_hash);

                if (!isValid) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    username: user.username || user.email?.split("@")[0] || "Admin",
                    image: user.image,
                };
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    events: {
        createUser: async ({ user }) => {
            // ---------------------------------------------------------
            // 2. Referral-Aware Login Logic
            // ---------------------------------------------------------
            try {
                // Safeguard cookie access
                let referralCode: string | undefined;
                try {
                    const cookieStore = cookies();
                    referralCode = cookieStore.get("referral_code")?.value;
                } catch (e) {
                    // Ignore cookie errors (e.g. in some server contexts)
                }

                if (referralCode) {
                    // Find the referrer
                    const referrer = await prisma.user.findUnique({
                        where: { referralCode: referralCode },
                    });

                    if (referrer && referrer.id !== user.id) {
                        // Assign referrer to the new user
                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                referredById: referrer.id,
                                referredUserEvents: {
                                    create: {
                                        referrerId: referrer.id,
                                        level: 1,
                                        status: "pending",
                                        commissionAmount: 0
                                    }
                                }
                            }
                        });
                        console.log(`[Referral] User ${user.id} referred by ${referrer.id} (${referralCode})`);
                    }
                }
            } catch (error) {
                console.error("[Referral Error] Failed to process referral:", error);
            }
        },
    },
    callbacks: {
        async signIn({ user, account }) {
            try {
                // Enforce Super Admin Role Consistency for info.gainzio@gmail.com
                // This runs on every sign-in.
                if (user.email === "info.gainzio@gmail.com") {
                    if (user.role !== "SUPER_ADMIN") {
                        // Only attempt update if user definitely exists in DB to avoid race conditions/errors on first login
                        // Checks if this is a new signup flow where database record might not exist yet
                        // However, 'user' object here might be from provider or DB.
                        // Best safe guard: try/catch the update
                        try {
                            // We check if the user actually exists in the DB before trying to update
                            // Note: 'user.id' from provider might match DB id if derived from sub, but let's be safe.
                            const existingUser = await prisma.user.findUnique({ where: { email: user.email } });

                            if (existingUser) {
                                await prisma.user.update({
                                    where: { id: existingUser.id },
                                    // Use type assertion to bypass potential stale Prisma types
                                    data: { role: "SUPER_ADMIN" as any }
                                });
                                // Mutate local object so session sees it
                                user.role = "SUPER_ADMIN";
                            }
                        } catch (err) {
                            console.warn("[Auth] Failed to auto-update super admin role:", err);
                            // Do not block sign in
                        }
                    }
                }

                // Allow admin-level users to sign in via Credentials
                if (account?.provider === "credentials") {
                    return ["ADMIN", "SUPER_ADMIN", "SUPPORT"].includes(user.role);
                }

                return true;
            } catch (error) {
                console.error("[Auth] SignIn callback error:", error);
                return false; // Fail safe
            }
        },
        async redirect({ url, baseUrl }) {
            // If the user is an admin, always send them to admin dashboard if they are coming from an admin login flow
            // Note: We can't easily detect "where they came from" here directly without custom params, 
            // but the middleware handles the route protection.

            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            // Allows callback URLs on the same origin
            if (new URL(url).origin === baseUrl) return url;
            return `${baseUrl}/member/dashboard`;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
                session.user.username = token.username || "";
                session.user.role = (token.role as "ADMIN" | "USER" | "SUPER_ADMIN" | "SUPPORT") || "USER";
                session.user.dob = token.dob ? new Date(token.dob as any).toISOString() : null;
                session.user.state = token.state as string | null;
                session.user.district = token.district as string | null;
            }
            return session;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.role = user.role;
                token.dob = user.dob;
                token.state = user.state;
                token.district = user.district;
            }
            // Update token if session is updated
            if (trigger === "update" && session?.username) {
                token.username = session.username;
            }
            return token;
        }
    }
};

