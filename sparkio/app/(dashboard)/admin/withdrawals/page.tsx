import { AdminWithdrawalsClient } from "@/components/admin/admin-withdrawals-client";
import { getAdminWithdrawals } from "@/services/admin";

export default async function AdminWithdrawalsPage() {
  const withdrawals = await getAdminWithdrawals("pending");

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Withdrawal Queue</h1>
        <p className="text-sm text-muted-foreground">Process pending UPI payout requests quickly and securely.</p>
      </header>

      <AdminWithdrawalsClient withdrawals={withdrawals} />
    </section>
  );
}

