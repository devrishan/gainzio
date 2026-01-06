import { Card } from "@/components/ui/card";
import { ShieldAlert, ShieldCheck, UserCog, ScrollText, Lock } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const hardeningTips = [
  {
    title: "2FA Enforcement",
    description: "Mandatory two-factor authentication for all administrative access.",
    icon: ShieldCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20"
  },
  {
    title: "Secret Rotation",
    description: "90-day rotation cycle for JWT secrets and API keys.",
    icon: ShieldAlert,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20"
  },
  {
    title: "RBAC Audit",
    description: "Quarterly review of administrative privileges and role assignment.",
    icon: UserCog,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20"
  },
];

export default async function AdminSecurityPage() {
  const { logs } = await getAdminSecurityLogs();

  return (
    <div className="space-y-8 relative">
      {/* Background Decor */}
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-red-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-60 -right-40 h-[400px] w-[400px] rounded-full bg-orange-900/10 blur-[100px] pointer-events-none" />

      <header className="relative z-10 space-y-1">
        <div className="flex items-center gap-2">
          <Lock className="h-6 w-6 text-orange-500" />
          <h1 className="text-3xl font-black italic tracking-tight uppercase text-white/90">Security Grid</h1>
        </div>
        <p className="text-sm font-medium text-zinc-500 max-w-lg">
          Platform hardening protocols, access control logs, and threat monitoring.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3 relative z-10">
        {hardeningTips.map((tip) => (
          <Card key={tip.title} className={`border p-6 bg-zinc-950/40 backdrop-blur-md ${tip.border} hover:border-white/20 transition-colors`}>
            <div className={`h-10 w-10 rounded-lg ${tip.bg} flex items-center justify-center mb-4`}>
              <tip.icon className={`h-5 w-5 ${tip.color}`} />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight">{tip.title}</h3>
            <p className="mt-2 text-xs font-medium text-zinc-500 leading-relaxed">{tip.description}</p>
          </Card>
        ))}
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-1 bg-orange-500 rounded-full" />
          <h2 className="text-lg font-bold uppercase tracking-widest text-white/80">System Audit Trail</h2>
        </div>

        <Card className="border-white/5 bg-zinc-950/40 backdrop-blur-2xl p-6 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

          <div className="rounded-2xl border border-white/5 overflow-hidden">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="text-[10px] font-black uppercase text-zinc-500 tracking-widest pl-6">Timestamp</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Actor Identity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Event Type</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Target Entity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Payload</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-white/5 border-white/5 transition-colors">
                    <TableCell className="whitespace-nowrap pl-6 bg-transparent">
                      <span className="font-mono text-[10px] text-zinc-400">
                        {format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                      </span>
                    </TableCell>
                    <TableCell>
                      {log.actor ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-xs">{log.actor.username || "Unknown"}</span>
                          <Badge variant="outline" className="w-fit mt-1 border-white/10 bg-white/5 text-[9px] uppercase tracking-widest text-zinc-500">
                            {log.actor.role}
                          </Badge>
                        </div>
                      ) : (
                        <span className="font-bold text-orange-400 text-xs uppercase tracking-wider">System Daemon</span>
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-xs text-white uppercase tracking-tight">{log.action}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="text-zinc-400 font-mono text-[10px] uppercase">{log.entityType}</span>
                        <span className="text-zinc-600 font-mono text-[10px]">{log.entityId?.substring(0, 8)}...</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[10px] font-mono text-zinc-500 max-w-xs truncate">
                      {JSON.stringify(log.metadata)}
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-zinc-600">
                      <div className="flex flex-col items-center gap-2 opacity-50">
                        <ShieldCheck className="h-8 w-8" />
                        <span className="text-xs font-bold uppercase tracking-widest">Secure State: No Anomalies</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
