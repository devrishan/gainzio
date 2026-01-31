import { MemberReferralsClient } from "@/components/member/member-referrals-client";

export default async function MemberReferralsPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Referrals</h1>
        <p className="text-sm text-muted-foreground">
          See who joined using your code, monitor their status, and track your multi-level commission earnings.
        </p>
      </header>

      <MemberReferralsClient />
    </section>
  );
}

