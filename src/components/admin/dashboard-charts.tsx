"use client";

import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { DateRange } from "react-day-picker";

interface DashboardChartsProps {
    dateRange?: DateRange;
}

export function DashboardCharts({ dateRange }: DashboardChartsProps) {
    const { data, isLoading } = useQuery({
        queryKey: ["admin-analytics", dateRange],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (dateRange?.from) params.set("from", dateRange.from.toISOString());
            if (dateRange?.to) params.set("to", dateRange.to.toISOString());

            const res = await fetch(`/api/admin/analytics?${params.toString()}`);
            return res.json();
        },
    });

    if (isLoading) {
        return (
            <Card className="col-span-1 lg:col-span-2 border-white/5 bg-zinc-950/30 backdrop-blur-md h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </Card>
        );
    }

    const chartData = data?.analytics || [];

    return (
        <Card className="col-span-1 lg:col-span-2 border-white/5 bg-zinc-950/30 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="text-sm font-black uppercase text-zinc-400 tracking-widest">30-Day Performance</CardTitle>
                <CardDescription className="font-mono text-xs">Real-time user growth vs revenue</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#666"
                                fontSize={10}
                                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis yAxisId="left" stroke="#8b5cf6" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
                                itemStyle={{ padding: 0 }}
                            />
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="users"
                                stroke="#8b5cf6"
                                fillOpacity={1}
                                fill="url(#colorUsers)"
                                strokeWidth={2}
                                name="New Users"
                            />
                            <Area
                                yAxisId="right"
                                type="monotone"
                                dataKey="revenue"
                                stroke="#10b981"
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                strokeWidth={2}
                                name="Revenue (₹)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
