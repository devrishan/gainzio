"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Withdrawal } from "@/services/member";
import { format } from "date-fns";
import { AlertCircle, CheckCircle2, Clock, XCircle, History } from "lucide-react";

interface WithdrawalHistoryClientProps {
    withdrawals: Withdrawal[];
}

function getStatusBadge(status: string) {
    switch (status) {
        case "COMPLETED":
        case "APPROVED":
            return (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Paid
                </Badge>
            );
        case "PENDING":
        case "PROCESSING":
            return (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                    <Clock className="mr-1 h-3 w-3" /> Processing
                </Badge>
            );
        case "REJECTED":
        case "FAILED":
        case "CANCELLED":
            return (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                    <XCircle className="mr-1 h-3 w-3" /> Failed
                </Badge>
            );
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

export function WithdrawalHistoryClient({ withdrawals }: WithdrawalHistoryClientProps) {
    if (withdrawals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center glass-morphism rounded-xl border-dashed border-white/10">
                <div className="p-4 rounded-full bg-muted/10 mb-4">
                    <History className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No withdrawals yet</h3>
                <p className="text-sm text-muted-foreground max-w-xs mt-1">Once you complete tasks and earn rewards, your withdrawal history will appear here.</p>
            </div>
        );
    }

    return (
        <Card className="glass-morphism border-white/5 overflow-hidden">
            <CardHeader className="bg-muted/5 border-b border-white/5">
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
                <CardDescription>History of all your payout requests</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/5">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="pl-6">Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right pr-6">UPI ID</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {withdrawals.map((withdrawal) => (
                            <TableRow key={withdrawal.id} className="border-white/5 hover:bg-muted/50 transition-colors">
                                <TableCell className="pl-6 font-medium text-muted-foreground">
                                    {format(new Date(withdrawal.requestedAt), "MMM d, yyyy")}
                                </TableCell>
                                <TableCell className="font-bold text-foreground">
                                    {Number(withdrawal.amount).toFixed(0)} Pts
                                </TableCell>
                                <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                                <TableCell className="text-right font-mono text-xs text-muted-foreground pr-6">
                                    {withdrawal.upiId}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
