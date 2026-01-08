import { MemberDashboardClient } from "@/components/member/member-dashboard-client";
import { getDashboardData, getMemberReferralsData, getMemberSquadData } from "@/services/member-server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MemberDashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  const [dashboard, referrals, squad] = await Promise.all([
    getDashboardData(user.userId),
    getMemberReferralsData(user.userId),
    getMemberSquadData(user.userId)
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

