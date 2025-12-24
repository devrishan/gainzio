import { AdminSubmissionsClient } from "@/components/admin/admin-submissions-client";
import { getAdminSubmissions } from "@/services/admin";

export default async function AdminSubmissionsPage() {
  const submissions = await getAdminSubmissions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Task Submissions</h1>
        <p className="text-muted-foreground">Review and approve member task submissions</p>
      </div>

      <AdminSubmissionsClient submissions={submissions} />
    </div>
  );
}
