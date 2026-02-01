"use client";

import { useMemo } from "react";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Banknote, Users, TrendingUp, Activity } from "lucide-react";

interface AnalyticsDataPoint {
    date: string;
    newUsers: number;
    dau: number;
    coinsMinted: number;
    coinsBurned: number;
    submissions: number;
    approvals: number;
}

interface AnalyticsChartsProps {
    data: AnalyticsDataPoint[];
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {

    const totals = useMemo(() => {
        return data.reduce((acc, curr) => ({
            newUsers: acc.newUsers + curr.newUsers,
            minted: acc.minted + curr.coinsMinted,
            burned: acc.burned + curr.coinsBurned,
            submissions: acc.submissions + curr.submissions
        }), { newUsers: 0, minted: 0, burned: 0, submissions: 0 });
    }, [data]);

    return (
        <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-500/5 to-transparent border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">New Users (30d)</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-white">{totals.newUsers}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500/5 to-transparent border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">Coins Minted</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-white">{totals.minted.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-rose-500/5 to-transparent border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">Coins Burned</CardTitle>
                        <Banknote className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-white">{totals.burned.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500/5 to-transparent border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">Tasks Submitted</CardTitle>
                        <Activity className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-white">{totals.submissions}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="growth" className="w-full space-y-4">
                <TabsList className="bg-transparent border border-white/5 p-1 h-auto w-auto inline-flex">
                    <TabsTrigger value="growth" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-neutral-500 text-xs font-bold uppercase tracking-wider">Growth</TabsTrigger>
                    <TabsTrigger value="economy" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-neutral-500 text-xs font-bold uppercase tracking-wider">Economy</TabsTrigger>
                    <TabsTrigger value="tasks" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-neutral-500 text-xs font-bold uppercase tracking-wider">Tasks</TabsTrigger>
                </TabsList>

                <TabsContent value="growth" className="pt-2">
                    <Card className="bg-transparent border-white/5">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-white">User Acquisition</CardTitle>
                            <CardDescription className="text-xs text-neutral-500">Daily registrations trend</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(str) => str.slice(5)}
                                        stroke="#525252"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#525252"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', color: '#fff' }}
                                        labelStyle={{ color: '#a3a3a3', fontSize: '12px', marginBottom: '8px' }}
                                    />
                                    <Area type="monotone" dataKey="newUsers" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="economy" className="pt-2">
                    <Card className="bg-transparent border-white/5">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-white">Economy Flow</CardTitle>
                            <CardDescription className="text-xs text-neutral-500">Minted vs Burned Volume</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(str) => str.slice(5)}
                                        stroke="#525252"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#525252"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#ffffff05' }}
                                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                    <Bar dataKey="coinsMinted" name="Earned" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="coinsBurned" name="Spent" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tasks" className="pt-2">
                    <Card className="bg-transparent border-white/5">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-white">Task Velocity</CardTitle>
                            <CardDescription className="text-xs text-neutral-500">Submissions over time</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(str) => str.slice(5)}
                                        stroke="#525252"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#525252"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                    <Line type="monotone" dataKey="submissions" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="approvals" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

