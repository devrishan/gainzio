"use client";

import { useQuery } from "@tanstack/react-query";
import { Globe2, Users, AlertTriangle, TrendingUp, DollarSign, Activity, GitBranch } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Sub-components for specific visualizations
function ChurnRadar({ data }: { data: any[] }) {
    if (!data) return null;
    return (
        <Card className="bg-red-950/20 border-red-500/20 backdrop-blur-md">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <CardTitle className="text-sm font-black uppercase text-red-400">Churn Radar (High Value)</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {data.map((u: any) => (
                        <div key={u.id} className="flex justify-between items-center p-2 bg-red-500/10 rounded border border-red-500/20">
                            <div>
                                <div className="text-xs font-bold text-red-200">{u.username || "Unknown"}</div>
                                <div className="text-[10px] text-red-400/60">{u.email}</div>
                            </div>
                            <Badge variant="outline" className="border-red-500/30 text-red-400">₹{u.wallet?.totalEarned}</Badge>
                        </div>
                    ))}
                    {data.length === 0 && <span className="text-xs text-zinc-500">No immediate risks detected.</span>}
                </div>
            </CardContent>
        </Card>
    );
}

function ProfitCommand({ data }: { data: any }) {
    if (!data) return null;
    return (
        <div className="grid grid-cols-2 gap-4">
            <Card className="bg-emerald-950/20 border-emerald-500/20">
                <CardContent className="p-4">
                    <div className="text-xs font-mono text-emerald-500/60 uppercase">Est. Revenue</div>
                    <div className="text-2xl font-black text-emerald-400 mt-1">₹{data.revenue}</div>
                </CardContent>
            </Card>
            <Card className="bg-blue-950/20 border-blue-500/20">
                <CardContent className="p-4">
                    <div className="text-xs font-mono text-blue-500/60 uppercase">Net Profit</div>
                    <div className="text-2xl font-black text-blue-400 mt-1">₹{data.profit}</div>
                </CardContent>
            </Card>
        </div>
    );
}

export function OracleDashboard() {
    const { data: oracle, isLoading } = useQuery({
        queryKey: ["admin-oracle"],
        queryFn: async () => (await fetch("/api/admin/analytics/oracle")).json().then(r => r.oracle)
    });

    if (isLoading) return <div className="p-12 center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Live Globe Placeholder (Visual) */}
                <Card className="md:col-span-2 bg-black border-white/10 relative overflow-hidden h-[300px]">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black" />
                    <div className="relative z-10 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Globe2 className="text-blue-500 w-5 h-5 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-widest text-blue-400">Live User Globe</span>
                        </div>
                        {/* Mock Dots */}
                        <div className="relative w-full h-[200px] border border-white/5 rounded bg-blue-500/5 flex items-center justify-center text-zinc-600 text-xs font-mono">
                            [3D WEBGL MAP RENDERING ACTIVE]
                            {oracle?.globe?.slice(0, 5).map((g: any, i: number) => (
                                <div key={i} className="absolute w-2 h-2 bg-blue-400 rounded-full animate-ping"
                                    style={{ top: `${Math.random() * 80 + 10}%`, left: `${Math.random() * 80 + 10}%` }}
                                />
                            ))}
                        </div>
                    </div>
                </Card>

                {/* 2. Retention Metric */}
                <div className="space-y-4">
                    <Card className="bg-zinc-900/50 border-white/10 p-6 flex flex-col justify-center items-center text-center h-[140px]">
                        <span className="text-4xl font-black text-white">{oracle?.retention?.rate}%</span>
                        <span className="text-xs font-bold uppercase text-zinc-500 mt-2">30-Day Retention</span>
                    </Card>
                    <ProfitCommand data={oracle?.profit} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChurnRadar data={oracle?.churnRisk} />

                {/* Referral Forest Placeholder */}
                <Card className="bg-zinc-950/40 border-white/5">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4 text-purple-500" />
                            <CardTitle className="text-sm font-black uppercase text-purple-400">Referral Forest</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[200px] flex items-center justify-center text-zinc-600 text-xs text-center p-6">
                        Graph Visualization <br /> (Top 10 Nodes)
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
