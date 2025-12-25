import { AdminTaskSubmissionsClient } from "@/components/admin/admin-task-submissions-client";
import { getTaskSubmissions } from "@/services/admin";
export const dynamic = "force-dynamic";

export default async function AdminTasksPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string; per_page?: string };
}) {
  const status = searchParams.status || undefined;
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const perPage = searchParams.per_page ? parseInt(searchParams.per_page, 10) : 20;

  const { data: submissions, pagination } = await getTaskSubmissions({
    status,
    page,
    per_page: perPage,
  });

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Task Submissions</h1>
        <p className="text-sm text-muted-foreground">Review and manage task submissions from members.</p>
      </header>

      <AdminTaskSubmissionsClient submissions={submissions} pagination={pagination} statusFilter={status} />
    </section>
  );
}

