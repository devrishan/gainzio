"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";

type Role = "USER" | "SUPPORT" | "ADMIN" | "SUPER_ADMIN" | "VERIFIER" | "PAYOUT_MANAGER";

interface RoleGuardProps {
    children: ReactNode;
    minRole?: Role;
    allowedRoles?: Role[];
    fallback?: ReactNode;
}

const ROLE_HIERARCHY: Record<Role, number> = {
    USER: 0,
    SUPPORT: 1,
    VERIFIER: 1,
    PAYOUT_MANAGER: 2,
    ADMIN: 2,
    SUPER_ADMIN: 3
};

export function RoleGuard({ children, minRole, allowedRoles, fallback = null }: RoleGuardProps) {
    const { data: session } = useSession();
    const userRole = session?.user?.role as Role | undefined;

    if (!userRole) return <>{fallback}</>;

    // 1. Array Check (Specific Roles)
    if (allowedRoles) {
        if (allowedRoles.includes(userRole)) {
            return <>{children}</>;
        }
    }

    // 2. Hierarchy Check (Min Role)
    if (minRole) {
        const userLevel = ROLE_HIERARCHY[userRole] || 0;
        const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

        if (userLevel >= requiredLevel) {
            return <>{children}</>;
        }
    }

    return <>{fallback}</>;
}
