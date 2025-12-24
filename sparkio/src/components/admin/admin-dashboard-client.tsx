"use client";

import { useRouter } from "next/navigation";
import { Banknote, HandCoins, Users } from "lucide-react";

import { StatsCard } from "@/components/StatsCard";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import type { AdminDashboardMetrics, AdminWithdrawal } from "@/services/admin";

interface AdminDashboardClientProps {
  metrics: AdminDashboardMetrics["metrics"];
  pendingWithdrawals: AdminWithdrawal[];
}

export function AdminDashboardClient({ metrics, pendingWithdrawals }: AdminDashboardClientProps) {
  const router = useRouter();

  const summary = [
    {
      title: "Total Users",
      value: metrics.total_users,
      subtitle: "Across the entire network",
      icon: Users,
    },
    {
      title: "Pending Withdrawals",
      value: metrics.pending_withdrawals.count,
      subtitle: `₹${metrics.pending_withdrawals.amount.toFixed(2)} waiting`,
      icon: HandCoins,
    },
    {
      title: "Total Earnings Paid",
      value: `₹${metrics.total_earnings_paid.toFixed(2)}`,
      subtitle: "Lifetime payouts to members",
      icon: Banknote,
    },
  ];

  const latestWithdrawals = pendingWithdrawals.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <StatsCard
            key={item.title}
            title={item.title}
            value={item.value}
            subtitle={item.subtitle}
            icon={item.icon}
          />
        ))}
      </div>

      <Card className="border-border bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Pending Withdrawals</h3>
            <p className="text-sm text-muted-foreground">
              Approve or reject payouts to keep the community paid on time.
            </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin/withdrawals")}>
            Manage Queue
          </Button>
        </div>
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>UPI ID</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Requested</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {latestWithdrawals.length === 0 ? (
              <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    No pending withdrawals. You&apos;re all caught up!
                </TableCell>
              </TableRow>
            ) : (
              latestWithdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{withdrawal.user.username}</span>
                      <span className="text-xs text-muted-foreground">{withdrawal.user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{withdrawal.upi_id}</TableCell>
                  <TableCell className="text-right font-semibold">₹{withdrawal.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(withdrawal.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

