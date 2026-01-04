import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const authOptions: NextAuthOptions = {
    debug: process.env.NODE_ENV === "development",
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            profile(profile) {
                const isAdmin = profile.email === "info.gainzio@gmail.com";
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    role: isAdmin ? "ADMIN" : "USER",
                    username: profile.email?.split("@")[0] || `user_${profile.sub}`, // Fallback username
                    emailVerified: profile.email_verified ? new Date() : null,
                };
            },
        }),
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
                const cookieStore = cookies();
                const referralCode = cookieStore.get("referral_code")?.value;

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
        async signIn({ user }) {
            // Enforce Admin Role Consistency for info.gainzio@gmail.com
            // This runs on every sign-in.
            if (user.email === "info.gainzio@gmail.com") {
                if (user.role !== "ADMIN") {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { role: "ADMIN" }
                    });
                    // Mutate the user object so the session callback gets the updated role immediately
                    user.role = "ADMIN";
                }
            }
            return true;
        },
        async redirect({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            // Allows callback URLs on the same origin
            if (new URL(url).origin === baseUrl) return url;
            return `${baseUrl}/member/dashboard`;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
                session.user.username = token.username;
                session.user.role = token.role;
            }
            return session;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.role = user.role;
            }
            // Update token if session is updated
            if (trigger === "update" && session?.username) {
                token.username = session.username;
            }
            return token;
        }
    }
};

