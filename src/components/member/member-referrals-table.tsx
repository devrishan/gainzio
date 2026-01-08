"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { MemberReferral } from "@/services/member";

const statusColor: Record<MemberReferral["status"], string> = {
  verified: "bg-success/10 text-success",
  pending: "bg-primary/10 text-primary",
  rejected: "bg-destructive/10 text-destructive",
};

export function MemberReferralsTable({ referrals }: { referrals: MemberReferral[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<MemberReferral["status"] | "all">("all");

  const filteredReferrals = useMemo(() => {
    return referrals.filter((referral) => {
      const matchesSearch =
        (referral.referred_user.username || "").toLowerCase().includes(search.toLowerCase()) ||
        (referral.referred_user.email || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" ? true : referral.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [referrals, search, status]);

  return (
    <Card className="border-border bg-card">
      <div className="space-y-4 p-4 sm:p-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Referral History</h2>
          <p className="text-sm text-muted-foreground">
            Monitor each invitation, its status, and the reward amount earned.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name or email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(["all", "verified", "pending", "rejected"] as const).map((value) => (
              <Button
                key={value}
                type="button"
                variant={status === value ? "default" : "outline"}
                size="sm"
                className={
                  value !== "all" && status === value ? statusColor[value as MemberReferral["status"]] : undefined
                }
                onClick={() => setStatus(value)}
              >
                {value === "all" ? "All" : value.charAt(0).toUpperCase() + value.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="block sm:hidden">
        {filteredReferrals.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No referrals match your filters.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredReferrals.map((referral) => (
              <div key={referral.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{referral.referred_user.username}</div>
                    <div className="text-xs text-muted-foreground">{referral.referred_user.email}</div>
                  </div>
                  <Badge variant="outline" className={statusColor[referral.status]}>
                    {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{new Date(referral.created_at).toLocaleDateString()}</span>
                  <span className="font-bold text-success">₹{referral.commission_amount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Commission</TableHead>
              <TableHead className="text-right">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReferrals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No referrals match your filters just yet.
                </TableCell>
              </TableRow>
            ) : (
              filteredReferrals.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell className="font-medium">{referral.referred_user.username}</TableCell>
                  <TableCell className="text-muted-foreground">{referral.referred_user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColor[referral.status]}>
                      {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">₹{referral.commission_amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(referral.created_at).toLocaleDateString()}
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

