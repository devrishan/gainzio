"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { AlertCircle, CheckCircle2, Clock, Users, Trophy, Wallet, GitBranch, ChevronRight } from "lucide-react";
import { ReferralTree } from "./referral-tree";
import { ReferralCommissions } from "./referral-commissions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Verified
                </Badge>
            );
        case "pending":
            return (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                    <Clock className="mr-1 h-3 w-3" /> Pending
                </Badge>
            );
        case "rejected":
            return (
                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                    <AlertCircle className="mr-1 h-3 w-3" /> Rejected
                </Badge>
            );
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

function getLevelBadge(level: number) {
    const colors = {
        1: "bg-blue-500/10 text-blue-500 border-blue-500/20 ring-blue-500/20",
        2: "bg-purple-500/10 text-purple-500 border-purple-500/20 ring-purple-500/20",
        3: "bg-pink-500/10 text-pink-500 border-pink-500/20 ring-pink-500/20",
    };
    return (
        <Badge variant="outline" className={`ring-1 ${colors[level as keyof typeof colors] || ""}`}>
            Level {level}
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
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <LoadingSkeleton key={i} className="h-32 rounded-xl glass-morphism" />)}
                </div>
                <LoadingSkeleton className="h-64 rounded-xl glass-morphism" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center glass-morphism rounded-xl border-destructive/20 bg-destructive/5">
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

    const statsCards = [
        { label: "Total Referrals", value: stats.total, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Verified", value: stats.verified, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
        { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
        { label: "Total Commission", value: `${stats.total_commission.toFixed(0)} Pts`, icon: Trophy, color: "text-primary", bg: "bg-primary/10" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Premium Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                    >
                        <Card className="glass-morphism border-white/5 shadow-sm hover:shadow-md transition-all duration-300">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                    <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Commission Breakdown */}
            <div className="glass-morphism rounded-2xl p-1">
                <ReferralCommissions commissions={commissionBreakdown} totalCommission={stats.total_commission} />
            </div>

            {/* Actions & Tree */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        onClick={() => setShowTree(!showTree)}
                        className="glass-morphism border-primary/20 hover:bg-primary/10"
                    >
                        {showTree ? <ChevronRight className="mr-2 h-4 w-4" /> : <GitBranch className="mr-2 h-4 w-4" />}
                        {showTree ? "Hide" : "Visualize"} Referral Tree
                    </Button>
                </div>

                {showTree && tree && tree.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="glass-morphism rounded-2xl p-6 border-white/10"
                    >
                        <ReferralTree tree={tree} />
                    </motion.div>
                )}
            </div>

            {/* Referrals Table */}
            <Card className="glass-morphism border-white/5 overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-muted/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Network Activity</CardTitle>
                            <CardDescription>Track real-time signups and earnings</CardDescription>
                        </div>
                        <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table className="min-w-[800px]">
                            <TableHeader className="bg-muted/10">
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableHead className="pl-6">User</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Commission</TableHead>
                                    <TableHead className="text-right pr-6">Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {referrals.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-16 text-center text-sm text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <Users className="h-8 w-8 text-muted-foreground/50" />
                                                <p>No referrals yet.</p>
                                                <p className="text-xs">Share your link to start building your network!</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    referrals.map((referral) => (
                                        <TableRow key={referral.id} className="hover:bg-muted/50 border-white/5 transition-colors">
                                            <TableCell className="pl-6 font-medium">
                                                <div className="flex flex-col">
                                                    <span className="text-foreground">
                                                        {referral.referred_user.username || `User ${referral.referred_user.phone.slice(-4)}`}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {referral.referred_user.email || referral.referred_user.phone}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getLevelBadge(referral.level)}</TableCell>
                                            <TableCell>{getStatusBadge(referral.status)}</TableCell>
                                            <TableCell className="text-right font-bold text-primary">
                                                +{referral.commission_amount.toFixed(0)} Pts
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground text-xs pr-6 font-mono">
                                                {new Date(referral.referred_user.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
