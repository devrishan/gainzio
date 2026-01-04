import { Card } from "@/components/ui/card";
import { ShieldAlert, ShieldCheck, UserCog, ScrollText } from "lucide-react";
import { getAdminSecurityLogs } from "@/services/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

const hardeningTips = [
  {
    title: "Enable Two-Factor Authentication",
    description: "Require 2FA for all admin accounts via your identity provider to prevent credential stuffing.",
    icon: ShieldCheck,
  },
  {
    title: "Rotate JWT Secrets Regularly",
    description: "Rotate the JWT secret every 90 days and store it in a vault such as AWS Secrets Manager.",
    icon: ShieldAlert,
  },
  {
    title: "Review Admin Roles",
    description: "Audit admin access quarterly and ensure the principle of least privilege is enforced.",
    icon: UserCog,
  },
];

export default async function AdminSecurityPage() {
  const { logs } = await getAdminSecurityLogs();

  return (
    <section className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Security Center</h1>
        <p className="text-sm text-muted-foreground">
          Configure staff access, audit logs, and platform hardening policies.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {hardeningTips.map((tip) => (
          <Card key={tip.title} className="border-border bg-card p-5">
            <tip.icon className="mb-3 h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">{tip.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{tip.description}</p>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">System Audit Logs</h2>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    {log.actor ? (
                      <div className="flex flex-col">
                        <span className="font-medium">{log.actor.username || "Unknown"}</span>
                        <span className="text-xs text-muted-foreground">{log.actor.role}</span>
                      </div>
                    ) : (
                      "System"
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span>{log.entityType}</span>
                      <span className="text-muted-foreground">{log.entityId}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-md truncate">
                    {JSON.stringify(log.metadata)}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No security events recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
