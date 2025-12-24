import { MemberWithdrawForm } from "@/components/member/member-withdraw-form";
import { Card } from "@/components/ui/card";
import { getMemberDashboard } from "@/services/member";

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
        <MemberWithdrawForm balance={dashboard.wallet.balance} />

        <Card className="h-fit border-border bg-card p-6 text-sm text-muted-foreground">
          <h3 className="text-lg font-semibold text-foreground">Withdrawal Checklist</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-primary">
            <li>Minimum withdrawal is ₹100 to maintain fair processing for all members.</li>
            <li>Ensure the UPI ID belongs to you to avoid failed transactions.</li>
            <li>Withdrawals are reviewed within 24 hours on business days.</li>
            <li>Track the status in your withdrawal history after submitting.</li>
          </ul>
        </Card>
      </div>
    </section>
  );
}

