import { NextAuthOptions, Theme } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import * as bcrypt from "bcryptjs";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

import { createTransport } from "nodemailer";

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
                port: process.env.EMAIL_SERVER_PORT ? Number(process.env.EMAIL_SERVER_PORT) : undefined,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
            sendVerificationRequest: async ({ identifier: email, url, provider, theme }) => {
                // 1. Rate Limit Check
                const limitWindow = 10 * 60 * 1000; // 10 minutes
                const limitCount = 3; // Max 3 emails per 10 mins
                const windowStart = new Date(Date.now() - limitWindow);

                const count = await prisma.rateLimit.count({
                    where: {
                        identifier: email,
                        type: "email_login",
                        createdAt: { gt: windowStart }
                    }
                });

                if (count >= limitCount) {
                    throw new Error("Rate limit exceeded. Please try again later.");
                }

                // 2. Record Attempt
                await prisma.rateLimit.create({
                    data: {
                        identifier: email,
                        type: "email_login",
                        windowStart: new Date(),
                        expiresAt: new Date(Date.now() + limitWindow),
                    }
                });

                // 3. Send Email
                const { host } = new URL(url);
                const transport = createTransport(provider.server);
                const result = await transport.sendMail({
                    to: email,
                    from: provider.from,
                    subject: `Sign in to ${host}`,
                    text: text({ url, host }),
                    html: html({ url, host, theme }),
                });

                const failed = result.rejected.concat(result.pending).filter(Boolean);
                if (failed.length) {
                    throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
                }
            },
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                connectType: { label: "Connect Type", type: "text" },
                identifier: { label: "Identifier", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.identifier || !credentials?.password || !credentials?.connectType) {
                    throw new Error("Missing credentials");
                }

                const { identifier, password, connectType } = credentials;
                let user = null;

                // 1. Resolve User by Connect Type (Strict)
                if (connectType === "CONNECTEMAIL") {
                    user = await prisma.user.findUnique({ where: { email: identifier } });
                } else if (connectType === "CONNECTPHONENUMBER") {
                    user = await prisma.user.findUnique({ where: { phone: identifier } });
                } else if (connectType === "CONNECTUSERNAME") {
                    user = await prisma.user.findUnique({ where: { username: identifier } });
                } else {
                    throw new Error("Invalid connection type");
                }

                // 2. TIMING ATTACK PROTECTION: Always hash compare even if user not found
                if (!user || !user.password_hash) {
                    // Fake comparison with a VALID hash to ensure time taken is similar to real comparison
                    // $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4hZ1a8F9.C is 'password' hash with cost 12
                    await bcrypt.compare(password, "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4hZ1a8F9.C");
                    throw new Error("Invalid credentials");
                }

                // 3. CHECK LOCK STATUS
                if (user.is_locked) {
                    if (user.lock_until && user.lock_until > new Date()) {
                        throw new Error("Account is locked. try again later.");
                    }
                    // Unlock if time passed
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { is_locked: false, failed_attempts: 0, lock_until: null }
                    });
                }

                // 4. VERIFY PASSWORD
                const storedHash = user.password_hash;
                if (!storedHash) throw new Error("Invalid credentials");

                const isValid = await bcrypt.compare(password, storedHash);

                if (!isValid) {
                    // Increment failed attempts
                    const attempts = (user.failed_attempts || 0) + 1;
                    let updateData: any = { failed_attempts: attempts };

                    // Lock Policy:
                    // ADMIN: 3 attempts -> 30 mins lock
                    // USER: 5 attempts -> 15 mins lock
                    const isSystemRole = user.role === "ADMIN" || user.role === "VERIFIER";
                    const limit = isSystemRole ? 3 : 5;
                    const lockTime = isSystemRole ? 30 : 15;

                    if (attempts >= limit) {
                        updateData.is_locked = true;
                        updateData.lock_until = new Date(Date.now() + lockTime * 60 * 1000);
                    }

                    await prisma.user.update({
                        where: { id: user.id },
                        data: updateData
                    });

                    throw new Error("Invalid credentials");
                }

                // 5. SUCCESS: Reset lock & Update stats
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        failed_attempts: 0,
                        is_locked: false,
                        lock_until: null,
                        last_login_at: new Date(),
                    }
                });

                return user;
            }
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
            // 1. Auto-generate username if missing (e.g. Google Login)
            // ---------------------------------------------------------
            if (!user.username) {
                const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                const username = `gainzio_${randomSuffix}`;

                await prisma.user.update({
                    where: { id: user.id },
                    data: { username },
                });
            }

            // ---------------------------------------------------------
            // 2. Referral-Aware Login Logic
            // ---------------------------------------------------------
            // Why here? This event runs ONLY when a new user is created in the DB.
            // Perfect for "First-time attribution only".
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
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
                // @ts-expect-error - username is added to token in jwt callback
                session.user.username = token.username;
                // @ts-expect-error - role is added to token in jwt callback
                session.user.role = token.role;
            }
            return session;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                // @ts-expect-error - username property exists on user object from Prisma
                token.username = user.username;
                // @ts-expect-error - role property exists on user object from Prisma
                token.role = user.role;
            }
            // Update token if session is updated (e.g. username change)
            if (trigger === "update" && session?.username) {
                token.username = session.username;
            }
            return token;
        }
    }
};

/**
 * Email HTML body
 * Insert invisible space into domains from being turned into a hyperlink by email
 * clients like Outlook and Apple mail, as this is confusing because it seems
 * like they are supposed to click on it to sign in.
 *
 * @note We don't add the email address to avoid needing to escape it,
 * if you do, remember to sanitize it!
 */
function html(params: { url: string; host: string; theme: Theme }) {
    const { url, host, theme } = params;

    const escapedHost = host.replace(/\./g, "&#8203;.");

    const brandColor = theme.brandColor || "#346df1";
    const color = {
        background: "#f9f9f9",
        text: "#444",
        mainBackground: "#fff",
        buttonBackground: brandColor,
        buttonBorder: brandColor,
        buttonText: theme.buttonText || "#fff",
    };

    return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Sign in to <strong>${escapedHost}</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
                in</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`;
}

/** Email Text body (fallback for email clients that don't render HTML) */
function text({ url, host }: { url: string; host: string }) {
    return `Sign in to ${host}\n${url}\n\n`;
}
