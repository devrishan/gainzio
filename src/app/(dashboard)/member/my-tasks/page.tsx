import { MemberSubmissionsDashboard } from "@/components/member/member-submissions-dashboard";

export const dynamic = "force-dynamic";

export default function MyTasksPage() {
    return (
        <section className="space-y-6">
            <header className="space-y-1">
                <h1 className="text-3xl font-semibold tracking-tight">My Tasks</h1>
                <p className="text-sm text-muted-foreground">
                    Track your task submissions, approvals, and history.
                </p>
            </header>

            <MemberSubmissionsDashboard />
        </section>
    );
}
