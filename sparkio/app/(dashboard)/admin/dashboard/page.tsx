import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";
import { getAdminDashboard, getAdminWithdrawals } from "@/services/admin";

export default async function AdminDashboardPage() {
  const [dashboard, withdrawals] = await Promise.all([getAdminDashboard(), getAdminWithdrawals()]);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">Monitor platform health, earnings, and pending workflows.</p>
      </header>

      <AdminDashboardClient metrics={dashboard.metrics} pendingWithdrawals={withdrawals} />
    </section>
  );
}

