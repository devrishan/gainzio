"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Check, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";

import type { AdminWithdrawal } from "@/services/admin";

const statusStyles: Record<AdminWithdrawal["status"], string> = {
  pending: "bg-primary/10 text-primary",
  processed: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
};

interface AdminWithdrawalsClientProps {
  withdrawals: AdminWithdrawal[];
}

export function AdminWithdrawalsClient({ withdrawals }: AdminWithdrawalsClientProps) {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async ({ withdrawal_id, new_status }: { withdrawal_id: number; new_status: "processed" | "failed" }) => {
      const response = await fetch("/api/admin/withdrawals/process", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawal_id, new_status }),
      });

      const result = await response.json().catch(() => ({ success: false, error: "Unable to update withdrawal." }));
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to update withdrawal.");
      }
      return result;
    },
    onSuccess: (_, { new_status }) => {
      toast.success("Withdrawal updated", {
        description: `Marked as ${new_status}.`,
      });
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error("Update failed", { description: error.message });
    },
  });

  return (
    <Card className="border-border bg-card">
      <div className="border-b border-border/60 p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-foreground">Pending Withdrawals</h2>
        <p className="text-sm text-muted-foreground">Confirm or decline payout requests submitted by members.</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>UPI ID</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Requested</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {withdrawals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                No withdrawal requests waiting. Nicely done!
              </TableCell>
            </TableRow>
          ) : (
            withdrawals.map((withdrawal) => (
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
                <TableCell className="text-right">
                  <Badge variant="outline" className={statusStyles[withdrawal.status]}>
                    {withdrawal.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={withdrawal.status !== "pending" || mutation.isPending}
                    onClick={() => mutation.mutate({ withdrawal_id: withdrawal.id, new_status: "processed" })}
                  >
                    <Check className="h-4 w-4 text-success" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={withdrawal.status !== "pending" || mutation.isPending}
                    onClick={() => mutation.mutate({ withdrawal_id: withdrawal.id, new_status: "failed" })}
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

