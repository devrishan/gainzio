"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Withdrawal } from "@/services/member";
import { format } from "date-fns";
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";

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
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No withdrawals yet</p>
                    <p className="text-sm text-muted-foreground">Your withdrawal history will appear here.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">UPI ID</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {withdrawals.map((withdrawal) => (
                            <TableRow key={withdrawal.id}>
                                <TableCell className="font-medium">
                                    {format(new Date(withdrawal.requestedAt), "MMM d, yyyy")}
                                </TableCell>
                                <TableCell>{Number(withdrawal.amount).toFixed(0)} Pts</TableCell>
                                <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                                <TableCell className="text-right font-mono text-xs text-muted-foreground">
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
