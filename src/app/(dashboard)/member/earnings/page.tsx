import { getMemberDashboard, getWithdrawalHistory } from "@/services/member";
import { EarningsDashboard } from "@/components/member/earnings-dashboard";

export const dynamic = "force-dynamic";

export default async function EarningsPage() {
    const [dashboard, withdrawals] = await Promise.all([
        getMemberDashboard(),
        getWithdrawalHistory()
    ]);

    return (
        <section className="space-y-6">
            <header className="space-y-1">
                <h1 className="text-3xl font-semibold tracking-tight">Earnings & Rewards</h1>
                <p className="text-sm text-muted-foreground">
                    Track your income sources and withdrawal history.
                </p>
            </header>

            <EarningsDashboard dashboard={dashboard} withdrawals={withdrawals} />
        </section>
    );
}
