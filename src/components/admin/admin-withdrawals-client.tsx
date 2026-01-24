"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Check, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import type { AdminWithdrawal } from "@/services/admin";

const statusStyles: Record<AdminWithdrawal["status"], string> = {
  pending: "bg-primary/10 text-primary",
  processed: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
  APPROVED: "bg-blue-500/10 text-blue-500",
  REJECTED: "bg-destructive/10 text-destructive",
  PROCESSING: "bg-yellow-500/10 text-yellow-500",
  COMPLETED: "bg-success/10 text-success",
};

interface AdminWithdrawalsClientProps {
  withdrawals: AdminWithdrawal[];
}

export function AdminWithdrawalsClient({ withdrawals }: AdminWithdrawalsClientProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  const toggleSelectAll = () => {
    if (selectedIds.length === withdrawals.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(withdrawals.map(w => w.id.toString()));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBatchAction = async (action: "APPROVED" | "REJECTED" | "PROCESSING") => {
    if (!selectedIds.length) return;
    setIsBatchProcessing(true);
    try {
      const res = await fetch("/api/admin/withdrawals/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action })
      });
      if (!res.ok) throw new Error("Batch failed");

      toast.success(`Batch processed ${selectedIds.length} items`);
      setSelectedIds([]);
      router.refresh();
    } catch (e) {
      toast.error("Batch action failed");
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async ({ withdrawal_id, new_status }: { withdrawal_id: number; new_status: "APPROVED" | "REJECTED" }) => {
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
      <div className="border-b border-border/60 p-4 sm:p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Pending Withdrawals</h2>
          <p className="text-sm text-muted-foreground">Confirm or decline payout requests submitted by members.</p>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5">
            <span className="text-sm text-muted-foreground mr-2">{selectedIds.length} selected</span>
            <Button size="sm" onClick={() => handleBatchAction("PROCESSING")} disabled={isBatchProcessing} className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20">
              Mark Processing
            </Button>
            <Button size="sm" onClick={() => handleBatchAction("APPROVED")} disabled={isBatchProcessing} className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">
              Approve All
            </Button>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedIds.length === withdrawals.length && withdrawals.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
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
                    <Checkbox
                      checked={selectedIds.includes(withdrawal.id.toString())}
                      onCheckedChange={() => toggleSelect(withdrawal.id.toString())}
                    />
                  </TableCell>
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
                      onClick={() => mutation.mutate({ withdrawal_id: withdrawal.id, new_status: "APPROVED" })}
                    >
                      <Check className="h-4 w-4 text-success" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={withdrawal.status !== "pending" || mutation.isPending}
                      onClick={() => mutation.mutate({ withdrawal_id: withdrawal.id, new_status: "REJECTED" })}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

