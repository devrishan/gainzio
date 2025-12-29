import { MemberDashboardClient } from "@/components/member/member-dashboard-client";
import { getMemberDashboard, getMemberReferrals, getMemberSquad } from "@/services/member";
export const dynamic = "force-dynamic";

export default async function MemberDashboardPage() {
  const [dashboard, referrals, squad] = await Promise.all([
    getMemberDashboard(),
    getMemberReferrals(),
    getMemberSquad()
  ]);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Member Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Track referral performance, wallet balance, and leaderboard standings.
        </p>
      </header>

      <MemberDashboardClient dashboard={dashboard} referrals={referrals} squad={squad} />
    </section>
  );
}

