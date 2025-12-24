"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ReferralInsightsChartProps {
  data: Array<{ week: string; referrals: number }>;
}

export function ReferralInsightsChart({ data }: ReferralInsightsChartProps) {
  return (
    <Card className="border-border bg-card p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-accent" />
        <h3 className="text-base font-semibold text-foreground sm:text-lg">Referral Insights</h3>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="week"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
              cursor={{ fill: "hsl(var(--muted))" }}
            />
            <Bar dataKey="referrals" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Weekly referral activity over the last 8 weeks
      </p>
    </Card>
  );
}
