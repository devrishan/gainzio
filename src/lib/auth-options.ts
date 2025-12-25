import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: process.env.EMAIL_SERVER_PORT,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
        error: "/login", // Error code passed in query string as ?error=
        verifyRequest: "/verify-request", // (used for check email message)
    },
    events: {
        createUser: async ({ user }) => {
            // ---------------------------------------------------------
            // Referral-Aware Login Logic
            // ---------------------------------------------------------
            // Why here? This event runs ONLY when a new user is created in the DB.
            // Perfect for "First-time attribution only".

            try {
                const cookieStore = cookies();
                const referralCode = cookieStore.get("referral_code")?.value;

                if (referralCode) {
                    // 1. Find the referrer
                    const referrer = await prisma.user.findUnique({
                        where: { referralCode: referralCode },
                    });

                    if (referrer && referrer.id !== user.id) {
                        // 2. Assign referrer to the new user
                        // We use update because the user is already created by the adapter
                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                referredById: referrer.id,
                                // Also create a Referral Event record for tracking/rewards
                                referredUserEvents: {
                                    create: {
                                        referrerId: referrer.id,
                                        level: 1,
                                        status: "pending",
                                        commissionAmount: 0 // Will be calculated later based on rules
                                    }
                                }
                            }
                        });
                        console.log(`[Referral] User ${user.id} referred by ${referrer.id} (${referralCode})`);
                    }
                }
            } catch (error) {
                console.error("[Referral Error] Failed to process referral:", error);
                // Swallow error to not fail the login
            }
        },
    },
    callbacks: {
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
                // Add role if needed
            }
            return session;
        },
        async jwt({ token, user }) {
            return token;
        }
    }
};
