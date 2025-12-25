import { MemberTasksClient } from "@/components/member/member-tasks-client";

export default function MemberTasksPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Available Tasks</h1>
        <p className="text-sm text-muted-foreground">
          Complete tasks and earn rewards. Upload proof to get verified.
        </p>
      </header>

      <MemberTasksClient />
    </section>
  );
}
