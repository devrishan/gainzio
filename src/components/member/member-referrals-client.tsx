"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { AlertCircle, CheckCircle2, Clock, Users } from "lucide-react";
import { ReferralTree } from "./referral-tree";
import { ReferralCommissions } from "./referral-commissions";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Referral {
  id: string;
  referred_user: {
    id: string;
    username: string | null;
    email: string | null;
    phone: string;
    created_at: string;
  };
  level: number;
  status: string;
  commission_amount: number;
  created_at: string;
  updated_at: string;
}

interface ReferralStats {
  total: number;
  verified: number;
  pending: number;
  total_commission: number;
}

interface ReferralChain {
  referrer: { id: string; referralCode: string; username: string | null } | null;
  direct_referrals: Array<{ id: string; referralCode: string; username: string | null }>;
}

interface ReferralData {
  referrals: Referral[];
  stats: ReferralStats;
  chain: ReferralChain;
  tree: ReferralLevel[] | null;
}

interface ReferralLevel {
  level: number;
  userId: string;
  referralCode: string;
  username: string | null;
  phone: string;
}

async function getMemberReferralsClient(includeTree: boolean = false): Promise<ReferralData> {
  const params = new URLSearchParams();
  if (includeTree) params.append("include_tree", "true");
  const response = await fetch(`/api/member/referrals?${params.toString()}`, {
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch referrals");
  }
  return response.json();
}

function getStatusBadge(status: string) {
  switch (status) {
    case "verified":
      return (
        <Badge variant="outline" className="bg-green-500/20 text-green-600">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Verified
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-500/20 text-yellow-600">
          <Clock className="mr-1 h-3 w-3" /> Pending
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="outline" className="bg-red-500/20 text-red-600">
          <AlertCircle className="mr-1 h-3 w-3" /> Rejected
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getLevelBadge(level: number) {
  const colors = {
    1: "bg-blue-500/20 text-blue-600",
    2: "bg-green-500/20 text-green-600",
    3: "bg-purple-500/20 text-purple-600",
  };
  return (
    <Badge variant="outline" className={colors[level as keyof typeof colors] || ""}>
      L{level}
    </Badge>
  );
}

export function MemberReferralsClient() {
  const [showTree, setShowTree] = useState(false);
  const { data, isLoading, error } = useQuery<ReferralData>({
    queryKey: ["memberReferrals", showTree],
    queryFn: () => getMemberReferralsClient(showTree),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-48" />
        <LoadingSkeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load referrals</h3>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An error occurred while loading referrals"}
        </p>
      </div>
    );
  }

  const referrals = data?.referrals || [];
  const stats = data?.stats || { total: 0, verified: 0, pending: 0, total_commission: 0 };
  const tree = data?.tree || [];

  // Calculate commission breakdown by level
  const commissionBreakdown = [
    {
      level: 1,
      amount: referrals
        .filter((r) => r.level === 1 && r.status === "verified")
        .reduce((sum, r) => sum + r.commission_amount, 0),
      count: referrals.filter((r) => r.level === 1 && r.status === "verified").length,
    },
    {
      level: 2,
      amount: referrals
        .filter((r) => r.level === 2 && r.status === "verified")
        .reduce((sum, r) => sum + r.commission_amount, 0),
      count: referrals.filter((r) => r.level === 2 && r.status === "verified").length,
    },
    {
      level: 3,
      amount: referrals
        .filter((r) => r.level === 3 && r.status === "verified")
        .reduce((sum, r) => sum + r.commission_amount, 0),
      count: referrals.filter((r) => r.level === 3 && r.status === "verified").length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{stats.total_commission.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Breakdown */}
      <ReferralCommissions commissions={commissionBreakdown} totalCommission={stats.total_commission} />

      {/* Referral Tree Toggle */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setShowTree(!showTree)}>
          <Users className="mr-2 h-4 w-4" />
          {showTree ? "Hide" : "Show"} Referral Tree
        </Button>
      </div>

      {/* Referral Tree */}
      {showTree && tree && tree.length > 0 && <ReferralTree tree={tree} />}

      {/* Referrals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
          <CardDescription>Users who joined using your referral code</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No referrals yet. Start sharing your referral code!
                  </TableCell>
                </TableRow>
              ) : (
                referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {referral.referred_user.username || `User ${referral.referred_user.phone.slice(-4)}`}
                        </span>
                        <span className="text-xs text-muted-foreground">{referral.referred_user.email || referral.referred_user.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getLevelBadge(referral.level)}</TableCell>
                    <TableCell>{getStatusBadge(referral.status)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{referral.commission_amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {new Date(referral.referred_user.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

