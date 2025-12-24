import { Card } from "@/components/ui/card";
import { ShieldAlert, ShieldCheck, UserCog } from "lucide-react";

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

export default function AdminSecurityPage() {
  return (
    <section className="space-y-6">
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
    </section>
  );
}

