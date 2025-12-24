import { MaintenanceScheduler } from "@/components/admin/maintenance-scheduler";

export default function AdminMaintenancePage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Maintenance Mode</h1>
        <p className="text-sm text-muted-foreground">
          Disable login temporarily, set a message, and define when access should automatically resume.
        </p>
      </header>

      <MaintenanceScheduler />
    </section>
  );
}


