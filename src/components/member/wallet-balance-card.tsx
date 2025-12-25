"use client";

import { Wallet, Clock, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface WalletBalanceCardProps {
  totalBalance: number;
  pendingBalance: number;
  availableBalance: number;
}

export function WalletBalanceCard({ totalBalance, pendingBalance, availableBalance }: WalletBalanceCardProps) {
  return (
    <Card className="spark-border overflow-hidden border-border bg-gradient-to-br from-card via-card to-card/80 p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Wallet className="h-5 w-5 text-primary" />
        <h3 className="text-base font-semibold text-foreground sm:text-lg">Wallet Balance</h3>
      </div>

      <div className="space-y-4">
        {/* Total Balance */}
        <div className="rounded-xl bg-primary/10 p-4">
          <p className="text-xs text-muted-foreground sm:text-sm">Total Balance</p>
          <p className="text-2xl font-bold text-primary sm:text-3xl">{formatCurrency(totalBalance)}</p>
        </div>

        {/* Pending & Available */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <p className="text-base font-semibold text-foreground sm:text-lg">{formatCurrency(pendingBalance)}</p>
          </div>

          <div className="rounded-lg bg-success/10 p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-success" />
              <p className="text-xs text-success">Available</p>
            </div>
            <p className="text-base font-semibold text-success sm:text-lg">{formatCurrency(availableBalance)}</p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Your details are protected and visible only to you.
      </p>
    </Card>
  );
}
