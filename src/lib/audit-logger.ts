import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

type AuditAction =
    | "USER_LOGIN" | "USER_REGISTER" | "USER_UPDATE" | "USER_DELETE"
    | "ADMIN_LOGIN"
    | "TASK_CREATE" | "TASK_UPDATE" | "TASK_DELETE" | "TASK_ARCHIVE"
    | "SUBMISSION_APPROVE" | "SUBMISSION_REJECT"
    | "WITHDRAWAL_REQUEST" | "WITHDRAWAL_APPROVE" | "WITHDRAWAL_REJECT" | "WITHDRAWAL_PROCESS"
    | "SETTINGS_UPDATE" | "CONFIG_CHANGE"
    | "FRAUD_DETECTED" | "SHADOW_BAN" | "UNBAN";

interface AuditLogParams {
    action: AuditAction;
    actorId?: string; // ID of the user performing the action
    entityId?: string; // ID of the object being acted upon
    entityType?: string; // Table name or Entity type
    metadata?: Record<string, any>; // Extra details (diffs, reasons, etc.)
}

/**
 * Log a sensitive action to the Audit Logs
 */
export async function logAudit(params: AuditLogParams) {
    try {
        const { action, actorId, entityId, entityType, metadata } = params;

        // Attempt to capture IP/UserAgent if in a web context
        let ip = "unknown";
        let userAgent = "unknown";
        try {
            const headersList = headers();
            ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
            userAgent = headersList.get("user-agent") || "unknown";
        } catch (e) {
            // Ignore header access errors (e.g. if called from Cron or non-request context)
        }

        await prisma.auditLog.create({
            data: {
                action,
                actorId,
                entityId,
                entityType,
                metadata: {
                    ...metadata,
                    ip,
                    userAgent
                }
            }
        });
    } catch (error) {
        console.error("[AuditLog] Failed to create log:", error);
        // Silent fail to avoid breaking the main flow
    }
}
