"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, Database, Server, Cpu } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ServerHealthMonitor() {
    const { data: health } = useQuery({
        queryKey: ["admin-health"],
        queryFn: async () => (await fetch("/api/admin/system/health")).json().then(r => r.health),
        refetchInterval: 3000
    });

    const getStatusColor = (val: number, type: 'cpu' | 'mem') => {
        if (type === 'cpu') return val > 80 ? 'text-red-500' : 'text-emerald-500';
        return val > 90 ? 'text-red-500' : 'text-emerald-500';
    };

    return (
        <div className="grid grid-cols-3 gap-4">

            <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-md">
                <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-full text-blue-400">
                        <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase">CPU Load</div>
                        <div className={`text-xl font-black font-mono ${getStatusColor(health?.cpu || 0, 'cpu')}`}>
                            {health?.cpu || 0}%
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-md">
                <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-full text-purple-400">
                        <Server className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase">Memory</div>
                        <div className={`text-xl font-black font-mono ${getStatusColor(health?.memory || 0, 'mem')}`}>
                            {health?.memory || 0}%
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-md">
                <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-full text-amber-400">
                        <Database className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase">DB Latency</div>
                        <div className="text-xl font-black font-mono text-zinc-300">
                            {health?.dbLatency || 0}ms
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
