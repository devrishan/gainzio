import { getAdminDashboard } from "@/services/admin";
import { DashboardViewClient } from "@/components/admin/dashboard-view-client";

export default async function AdminDashboardPage() {
  const { metrics } = await getAdminDashboard();

  return <DashboardViewClient metrics={metrics} />;
}
