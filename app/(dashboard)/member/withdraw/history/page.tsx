import { WithdrawalHistoryClient } from "@/components/member/withdrawal-history-client";
import { getWithdrawalHistory } from "@/services/member";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function WithdrawalHistoryPage() {
    const withdrawals = await getWithdrawalHistory();

    return (
        <section className="space-y-6">
            <header className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                    <Button variant="ghost" size="icon" asChild className="-ml-2 h-8 w-8">
                        <Link href="/member/withdraw">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-semibold tracking-tight">Withdrawal History</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                    Track the status of your past requests.
                </p>
            </header>

            <WithdrawalHistoryClient withdrawals={withdrawals} />
        </section>
    );
}
