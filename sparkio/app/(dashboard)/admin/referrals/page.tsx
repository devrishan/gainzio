import { AdminReferralsClient } from "@/components/admin/admin-referrals-client";
import { getAdminReferrals } from "@/services/admin";

interface AdminReferralsPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function AdminReferralsPage({ searchParams }: AdminReferralsPageProps) {
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const page = typeof searchParams.page === "string" ? searchParams.page : undefined;
  const perPage = typeof searchParams.per_page === "string" ? searchParams.per_page : undefined;

  const data = await getAdminReferrals({
    ...(status ? { status } : {}),
    ...(page ? { page } : {}),
    ...(perPage ? { per_page: perPage } : {}),
  });

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Referral Pipeline</h1>
        <p className="text-sm text-muted-foreground">Review and action referrals from the entire Sparkio network.</p>
      </header>

      <AdminReferralsClient referrals={data.data} pagination={data.pagination} statusFilter={status} />
    </section>
  );
}

