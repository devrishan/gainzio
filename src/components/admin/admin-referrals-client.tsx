"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Filter, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";

import type { AdminReferral } from "@/services/admin";

const statusBadge: Record<AdminReferral["status"], string> = {
  verified: "bg-success/10 text-success",
  pending: "bg-primary/10 text-primary",
  rejected: "bg-destructive/10 text-destructive",
};

interface AdminReferralsClientProps {
  referrals: AdminReferral[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  statusFilter?: string | null;
}

export function AdminReferralsClient({ referrals, pagination, statusFilter }: AdminReferralsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mutation = useMutation({
    mutationFn: async ({ referral_id, new_status }: { referral_id: number; new_status: "verified" | "rejected" }) => {
      const response = await fetch("/api/admin/referrals/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referral_id, new_status }),
      });

      const result = await response.json().catch(() => ({ success: false, error: "Unable to update referral." }));
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to update referral.");
      }
      return result;
    },
    onSuccess: (_, { new_status }) => {
      toast.success("Referral updated", {
        description: `Referral marked as ${new_status}.`,
      });
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error("Update failed", { description: error.message });
    },
  });

  const setSearchParams = (updater: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    updater(params);
    router.replace(`/admin/referrals?${params.toString()}`);
  };

  const handleFilterChange = (value: string | null) => {
    setSearchParams((params) => {
      if (value) {
        params.set("status", value);
      } else {
        params.delete("status");
      }
      params.delete("page");
    });
  };

  const navigateToPage = (page: number) => {
    setSearchParams((params) => {
      params.set("page", String(page));
    });
  };

  return (
    <Card className="border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-4 sm:p-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Referral Pipeline</h2>
          <p className="text-sm text-muted-foreground">
            Review member invites, verify commissions, and keep quality high.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={statusFilter ?? "all"}
            onChange={(event) => handleFilterChange(event.target.value === "all" ? null : event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Referrer</TableHead>
            <TableHead>Referred</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Commission</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {referrals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                Nothing to review right now — enjoy the calm!
              </TableCell>
            </TableRow>
          ) : (
            referrals.map((referral) => (
              <TableRow key={referral.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{referral.referrer.username}</span>
                    <span className="text-xs text-muted-foreground">{referral.referrer.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{referral.referred.username}</span>
                    <span className="text-xs text-muted-foreground">{referral.referred.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusBadge[referral.status]}>
                    {referral.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">₹{referral.commission_amount.toFixed(2)}</TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={referral.status === "verified" || mutation.isPending}
                    onClick={() => mutation.mutate({ referral_id: referral.id, new_status: "verified" })}
                  >
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={referral.status === "rejected" || mutation.isPending}
                    onClick={() => mutation.mutate({ referral_id: referral.id, new_status: "rejected" })}
                  >
                    <XCircle className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-xs text-muted-foreground sm:px-6">
        <span>
          Showing {(pagination.page - 1) * pagination.per_page + 1}-
          {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => navigateToPage(pagination.page - 1)}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.total_pages}
            onClick={() => navigateToPage(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}

