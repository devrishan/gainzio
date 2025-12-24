"use client";

import { ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency, cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  status: "pending" | "completed" | "rejected";
  description: string;
  date: Date;
}

interface TransactionListProps {
  transactions: Transaction[];
}

const statusConfig = {
  pending: { icon: Clock, color: "text-primary", bg: "bg-primary/10" },
  completed: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
  rejected: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <Card className="border-border bg-card p-4 sm:p-6">
      <h3 className="mb-4 text-base font-semibold text-foreground sm:text-lg">Recent Transactions</h3>

      {transactions.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">No transactions yet</p>
        </div>
      ) : (
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {transactions.map((txn) => {
              const StatusIcon = statusConfig[txn.status].icon;
              return (
                <div
                  key={txn.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full",
                        txn.type === "credit" ? "bg-success/10" : "bg-primary/10"
                      )}
                    >
                      {txn.type === "credit" ? (
                        <ArrowDownCircle className="h-4 w-4 text-success" />
                      ) : (
                        <ArrowUpCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{txn.description}</p>
                      <p className="text-xs text-muted-foreground">{txn.date.toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        txn.type === "credit" ? "text-success" : "text-foreground"
                      )}
                    >
                      {txn.type === "credit" ? "+" : "-"}
                      {formatCurrency(txn.amount)}
                    </p>
                    <Badge variant="outline" className={cn("mt-1 text-xs", statusConfig[txn.status].bg, statusConfig[txn.status].color)}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {txn.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}
