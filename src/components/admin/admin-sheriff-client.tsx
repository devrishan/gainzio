"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, AlertTriangle, Users, Ban, Eye, Fingerprint } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export function AdminSheriffClient() {
    const { data: sheriff, isLoading } = useQuery({
        queryKey: ["admin-sheriff"],
        queryFn: async () => {
            const res = await fetch("/api/admin/security/sheriff");
            return res.json();
        }
    });

    if (isLoading) {
        return <div className="p-12 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-zinc-500" /></div>;
    }

    const { ipClusters, velocityUsers } = sheriff?.sheriff || { ipClusters: [], velocityUsers: [] };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                    <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-white">The Sheriff</h1>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Automated Fraud Detection System</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* IP CLUSTERS */}
                <Card className="bg-zinc-950/40 border-red-500/20 backdrop-blur-md">
                    <CardHeader className="border-b border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Fingerprint className="w-5 h-5 text-amber-500" />
                                <CardTitle className="text-sm font-black uppercase text-zinc-300 tracking-widest">Duplicate IP Clusters</CardTitle>
                            </div>
                            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">{ipClusters.length} Found</Badge>
                        </div>
                        <CardDescription>Multiple accounts sharing the same connection.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {ipClusters.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500 text-sm">No clusters found. Clean streets.</div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {ipClusters.map((cluster: any, idx: number) => (
                                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <code className="text-sm font-mono text-purple-300 bg-purple-500/10 px-2 py-1 rounded">{cluster.ipAddress}</code>
                                                <Badge className="bg-zinc-800 text-zinc-400 hover:bg-zinc-700">{Number(cluster.userCount)} Users</Badge>
                                            </div>
                                            <div className="mt-2 text-xs text-zinc-500 font-mono overflow-ellipsis max-w-[300px] truncate">
                                                IDs: {cluster.userIds.join(", ")}
                                            </div>
                                        </div>
                                        <Button size="sm" variant="destructive" className="h-8">
                                            <Ban className="w-3 h-3 mr-2" /> Ban Cluster
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* VELOCITY CHECKS */}
                <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-md">
                    <CardHeader className="border-b border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-500" /> {/* Activity is not imported, let's fix import */}
                                <CardTitle className="text-sm font-black uppercase text-zinc-300 tracking-widest">High Velocity</CardTitle>
                            </div>
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">{velocityUsers.length} Suspects</Badge>
                        </div>
                        <CardDescription>> 20 Tasks in 24 hours.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {velocityUsers.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500 text-sm">No speedsters detected.</div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {velocityUsers.map((item: any, idx: number) => (
                                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-400">
                                                {item.user?.username?.[0] || "?"}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{item.user?.username || "Unknown"}</p>
                                                <p className="text-xs text-zinc-500">{item.user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-white">{item.count}</p>
                                            <p className="text-[10px] text-zinc-500 uppercase">Tasks/24h</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}

// Missing import fix
import { Activity } from "lucide-react";
