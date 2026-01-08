```typescript
import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: "ADMIN" | "USER";
            username: string;
            referral_code?: string;
            dob?: string | null;
            state?: string | null;
            district?: string | null;
        } & DefaultSession["user"]
    }

    interface User {
        id: string;
        role: "ADMIN" | "USER";
        username: string;
        referral_code?: string;
        dob?: Date | null;
        state?: string | null;
        district?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        username?: string | null
        role?: string | null
    }
}
