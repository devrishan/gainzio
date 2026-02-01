"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletCard } from "@/components/WalletCard";
import { WithdrawalHistoryClient } from "@/components/member/withdrawal-history-client";
import { MemberDashboardPayload, Withdrawal } from "@/services/member";
import { DollarSign, Clock, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface EarningsDashboardProps {
    dashboard: MemberDashboardPayload;
    withdrawals: Withdrawal[];
}

export function EarningsDashboard({ dashboard, withdrawals }: EarningsDashboardProps) {
    const router = useRouter();

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                <WalletCard
                    balance={dashboard.wallet.balance}
                    totalEarned={dashboard.wallet.total_earned}
                    onWithdraw={() => router.push("/member/withdraw")}
                />
                <Card className="spark-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Withdrawals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            ₹{withdrawals
                                .filter(w => w.status === 'COMPLETED' || w.status === 'APPROVED')
                                .reduce((acc, curr) => acc + curr.amount, 0)
                                .toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Processed successfully</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="history" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="active">Active Earnings</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Wallet Breakdown</CardTitle>
                            <CardDescription>Funds currently available for withdrawal</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">Task Earnings</div>
                                        <div className="text-xs text-muted-foreground">From verified tasks</div>
                                    </div>
                                </div>
                                <div className="font-bold">₹{dashboard.wallet.balance.toFixed(2)}</div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                    <WithdrawalHistoryClient withdrawals={withdrawals} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
