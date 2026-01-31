import { MaintenanceScheduler } from "@/components/admin/maintenance-scheduler";
import { getAdminMaintenanceState } from "@/services/admin";

export const dynamic = "force-dynamic";

export default async function AdminMaintenancePage() {
  const initialState = await getAdminMaintenanceState();

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Maintenance Mode</h1>
        <p className="text-sm text-muted-foreground">
          Disable login temporarily, set a message, and define when access should automatically resume.
        </p>
      </header>

      <MaintenanceScheduler initialState={initialState} />
    </section>
  );
}
