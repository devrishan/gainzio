import { GamificationDashboard } from "@/components/member/gamification-dashboard";
import { BadgesList } from "@/components/member/badges-list";

export default function MemberGamificationPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Gamification</h1>
        <p className="text-sm text-muted-foreground">
          Track your XP, rank, badges, and streaks. Level up by completing tasks and referring friends!
        </p>
      </header>

      <GamificationDashboard />
      <BadgesList />
    </section>
  );
}

