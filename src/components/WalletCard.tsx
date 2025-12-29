"use client";

import { Wallet, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WalletCardProps {
  balance: number;
  totalEarned?: number;
  onWithdraw: () => void;
}

const formatPoints = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
};

export const WalletCard = ({ balance, totalEarned = 0, onWithdraw }: WalletCardProps) => {
  const canWithdraw = balance >= 100;

  return (
    <Card className="relative overflow-hidden border-border bg-gradient-to-br from-card via-card to-card/50 p-4 sm:p-6 spark-border">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

      <div className="relative space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-1.5 sm:p-2">
              <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">My Points</h3>
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-bold text-foreground">{formatPoints(balance)}</span>
            <span className="text-sm font-medium text-muted-foreground">Pts</span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {canWithdraw
              ? "Ready to withdraw! 🎉"
              : `${formatPoints(100 - balance)} more points to unlock withdrawal`}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Lifetime earnings: <span className="font-semibold text-foreground">{formatPoints(totalEarned)} Pts</span>
          </p>
        </div>

        <Button
          onClick={onWithdraw}
          disabled={!canWithdraw}
          className={`w-full h-11 sm:h-10 text-sm sm:text-base ${canWithdraw ? 'animate-sparkle glow-md' : ''}`}
          variant={canWithdraw ? "default" : "secondary"}
        >
          <ArrowUpRight className="mr-2 h-4 w-4" />
          Withdraw to UPI
        </Button>
      </div>
    </Card>
  );
};
