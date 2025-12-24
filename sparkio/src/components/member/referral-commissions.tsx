"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Coins } from "lucide-react";

interface ReferralCommission {
  level: number;
  amount: number;
  count: number;
}

interface ReferralCommissionsProps {
  commissions: ReferralCommission[];
  totalCommission: number;
}

export function ReferralCommissions({ commissions, totalCommission }: ReferralCommissionsProps) {
  const l1Commission = commissions.find((c) => c.level === 1);
  const l2Commission = commissions.find((c) => c.level === 2);
  const l3Commission = commissions.find((c) => c.level === 3);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Commission Breakdown
          </CardTitle>
          <CardDescription>Earnings from your referral network</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Commission</p>
              <p className="text-2xl font-bold text-blue-600">₹{totalCommission.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {/* Level 1 */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="bg-blue-500/20 text-blue-600">
                  Level 1
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {l1Commission?.count || 0} referrals
                </span>
              </div>
              <p className="text-xl font-semibold">₹{l1Commission?.amount.toFixed(2) || "0.00"}</p>
              <p className="text-xs text-muted-foreground mt-1">50% commission</p>
            </div>

            {/* Level 2 */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="bg-green-500/20 text-green-600">
                  Level 2
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {l2Commission?.count || 0} referrals
                </span>
              </div>
              <p className="text-xl font-semibold">₹{l2Commission?.amount.toFixed(2) || "0.00"}</p>
              <p className="text-xs text-muted-foreground mt-1">30% commission</p>
            </div>

            {/* Level 3 */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="bg-purple-500/20 text-purple-600">
                  Level 3
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {l3Commission?.count || 0} referrals
                </span>
              </div>
              <p className="text-xl font-semibold">₹{l3Commission?.amount.toFixed(2) || "0.00"}</p>
              <p className="text-xs text-muted-foreground mt-1">20% commission</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

