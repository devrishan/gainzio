import { WithdrawalRequestDialog } from "@/components/wallet/withdrawal-request-dialog";
import { Card } from "@/components/ui/card";
import { getMemberDashboard } from "@/services/member";
export const dynamic = "force-dynamic";

export default async function MemberWithdrawPage() {
  const dashboard = await getMemberDashboard();

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Withdraw Earnings</h1>
        <p className="text-sm text-muted-foreground">
          Request withdrawals to your preferred UPI account once your balance is ready.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="border-border bg-card p-8 flex flex-col items-center justify-center gap-6 min-h-[400px]">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-primary">Your Balance</h2>
            <p className="text-4xl font-black text-white">{dashboard.wallet.balance.toFixed(2)} <span className="text-lg text-muted-foreground font-medium">Points</span></p>
          </div>
          <WithdrawalRequestDialog currentBalance={Number(dashboard.wallet.balance)} />
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Select your preferred payout method (UPI or Bank Transfer) in the next step.
          </p>
        </Card>

        <Card className="h-fit border-border bg-card p-6 text-sm text-muted-foreground">
          <h3 className="text-lg font-semibold text-foreground">Withdrawal Checklist</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-primary">
            <li>Minimum withdrawal is 100 Points to maintain fair processing for all members.</li>
            <li>Ensure the UPI ID belongs to you to avoid failed transactions.</li>
            <li>Withdrawals are reviewed within 24 hours on business days.</li>
            <li>
              Track the status in your <a href="/member/withdraw/history" className="underline hover:text-primary">withdrawal history</a> after submitting.
            </li>
          </ul>
        </Card>
      </div>
    </section>
  );
}

