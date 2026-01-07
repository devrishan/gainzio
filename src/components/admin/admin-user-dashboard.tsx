"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
    User, Mail, Phone, Calendar, Clock, CreditCard,
    Shield, Activity, Users, DollarSign, Ban, CheckCircle,
    AlertTriangle, Banknote, History, Network
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminMemberDetail } from "@/services/admin";
import { Loader2 } from "lucide-react";

interface AdminUserDashboardProps {
    user: AdminMemberDetail;
}

export function AdminUserDashboard({ user }: AdminUserDashboardProps) {

    // Fetch deep stats
    const { data: stats, isLoading } = useQuery({
        queryKey: ["admin-member-stats", user.id],
        queryFn: async () => {
            const res = await fetch(`/api/admin/members/${user.id}/stats`);
            return res.json();
        }
    });

    const walletHistory = stats?.crm?.walletHistory || [];
    const activityLogs = stats?.crm?.activityLogs || [];
    const referrals = stats?.crm?.referrals || [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white uppercase border-2 border-white/10 shadow-xl">
                            {user.username?.[0] || "U"}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-black italic tracking-tight uppercase text-white/90">
                                    {user.username || "Anonymous"}
                                </h1>
                                <Badge variant="outline" className={`border-0 uppercase text-[10px] font-black tracking-widest ${user.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                                    }`}>
                                    {user.status}
                                </Badge>
                            </div>
                            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest pl-1">{user.email}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-white/10 hover:bg-white/5">
                        Reset Password
                    </Button>
                    {user.status === "Active" ? (
                        <Button variant="destructive" className="font-bold">
                            <Ban className="w-4 h-4 mr-2" /> Suspend
                        </Button>
                    ) : (
                        <Button variant="outline" className="font-bold border-emerald-500/50 text-emerald-400 hover:bg-emerald-950/30">
                            <CheckCircle className="w-4 h-4 mr-2" /> Activate
                        </Button>
                    )}
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-zinc-950/50 border border-white/5 p-1">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-800">Overview</TabsTrigger>
                    <TabsTrigger value="wallet" className="data-[state=active]:bg-zinc-800">Wallet & Payouts</TabsTrigger>
                    <TabsTrigger value="activity" className="data-[state=active]:bg-zinc-800">Activity Logs</TabsTrigger>
                    <TabsTrigger value="referrals" className="data-[state=active]:bg-zinc-800">Referral Tree</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Quick Stats */}
                        <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Wallet Balance</p>
                                        <p className="text-2xl font-black text-white">₹{user.walletBalance.toLocaleString()}</p>
                                    </div>
                                    <Banknote className="w-8 h-8 text-emerald-500/20" />
                                </CardContent>
                            </Card>
                            <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Total Earnings</p>
                                        <p className="text-2xl font-black text-white">₹{user.totalEarnings.toLocaleString()}</p>
                                    </div>
                                    <DollarSign className="w-8 h-8 text-blue-500/20" />
                                </CardContent>
                            </Card>
                            <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Referrals</p>
                                        <p className="text-2xl font-black text-white">{user.stats.referrals}</p>
                                    </div>
                                    <Users className="w-8 h-8 text-amber-500/20" />
                                </CardContent>
                            </Card>
                            <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Risk Score</p>
                                        <p className="text-2xl font-black text-emerald-400">Low</p>
                                    </div>
                                    <Shield className="w-8 h-8 text-emerald-500/20" />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Identity Card */}
                        <Card className="col-span-1 border-white/5 bg-zinc-950/30">
                            <CardHeader>
                                <CardTitle className="text-sm font-black uppercase text-zinc-400 tracking-widest">User Identity</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-xs text-zinc-500 font-mono uppercase">User ID</span>
                                    <span className="text-xs font-mono text-white truncate max-w-[150px]">{user.id}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-xs text-zinc-500 font-mono uppercase">Role</span>
                                    <span className="text-xs font-bold text-white">{user.role}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-xs text-zinc-500 font-mono uppercase">Joined</span>
                                    <span className="text-xs text-zinc-300">{format(new Date(user.createdAt), "PPP")}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-xs text-zinc-500 font-mono uppercase">Last Login</span>
                                    <span className="text-xs text-zinc-300">{user.lastLoginAt ? format(new Date(user.lastLoginAt), "PPP p") : "Never"}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-xs text-zinc-500 font-mono uppercase">Referral Code</span>
                                    <Badge variant="secondary" className="font-mono text-[10px]">{user.referralCode || "N/A"}</Badge>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-xs text-zinc-500 font-mono uppercase">Referred By</span>
                                    <span className="text-xs text-blue-400 cursor-pointer hover:underline">{user.referredBy?.username || "None"}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity Mini-Feed */}
                        <Card className="col-span-1 lg:col-span-2 border-white/5 bg-zinc-950/30">
                            <CardHeader>
                                <CardTitle className="text-sm font-black uppercase text-zinc-400 tracking-widest">Recent System Logs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-zinc-600" /></div>
                                ) : activityLogs.length === 0 ? (
                                    <p className="text-sm text-zinc-500 text-center py-8">No recent logs found.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {activityLogs.map((log: any) => (
                                            <div key={log.id} className="flex items-start gap-4">
                                                <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-white">{log.action}</p>
                                                    <p className="text-xs text-zinc-500 font-mono">{format(new Date(log.createdAt), "PPP p")}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* WALLET TAB */}
                <TabsContent value="wallet" className="space-y-6">
                    <Card className="border-white/5 bg-zinc-950/30">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase text-zinc-400 tracking-widest">Transaction Volume</CardTitle>
                            <CardDescription>Wallet activity over time</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {isLoading ? (
                                <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-zinc-600" /></div>
                            ) : walletHistory.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-zinc-500">No transaction history</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={walletHistory}>
                                        <defs>
                                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis dataKey="date" hide />
                                        <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorAmount)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* REFERRALS TAB */}
                <TabsContent value="referrals" className="space-y-6">
                    <Card className="border-white/5 bg-zinc-950/30">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase text-zinc-400 tracking-widest">Direct Referrals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-zinc-600" /></div>
                            ) : referrals.length === 0 ? (
                                <p className="text-sm text-zinc-500 text-center py-8">No referrals yet.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {referrals.map((ref: any) => (
                                        <div key={ref.id} className="p-4 rounded-lg bg-zinc-900/50 border border-white/5 flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-400">
                                                {ref.username?.[0] || "?"}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{ref.username || "Anonymous"}</p>
                                                <p className="text-xs text-zinc-500 font-mono">{format(new Date(ref.createdAt), "PP")}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
