import { AdminAuditLog } from "@/components/admin/admin-audit-log";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Security Logs | Admin",
  description: "Audit trail of all administrative actions",
};

export default function SecurityLogsPage() {
  return (
    <div className="space-y-8 relative">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-emerald-900/10 blur-[120px] pointer-events-none" />

      <header className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="h-6 w-6 text-emerald-500" />
          <h1 className="text-3xl font-black italic tracking-tight uppercase text-white/90">Security Audit</h1>
        </div>
        <p className="text-zinc-500 font-medium">Traceable history of all system modifications and user sanctions.</p>
      </header>

      <div className="relative z-10">
        <AdminAuditLog />
      </div>
    </div>
  );
}
