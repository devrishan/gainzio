import { MemberDashboardClient } from "@/components/member/member-dashboard-client";
import { getMemberDashboard, getMemberReferrals } from "@/services/member";

export default async function MemberDashboardPage() {
  const [dashboard, referrals] = await Promise.all([getMemberDashboard(), getMemberReferrals()]);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Member Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Track referral performance, wallet balance, and leaderboard standings.
        </p>
      </header>

      <MemberDashboardClient dashboard={dashboard} referrals={referrals} />
    </section>
  );
}

