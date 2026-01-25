import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyPassword } from "@/lib/hash";

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

                if (!user || user.role !== "ADMIN") {
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
        async signIn({ user, account }) {
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

            // Allow admin to sign in via Credentials
            if (account?.provider === "credentials") {
                return user.role === "ADMIN";
            }

            return true;
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
                session.user.role = (token.role as "ADMIN" | "USER") || "USER";
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

