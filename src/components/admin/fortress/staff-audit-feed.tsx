"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Shield, User, DollarSign, Ban, Edit, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function StaffAuditFeed() {
    const { data: logs, isLoading } = useQuery({
        queryKey: ["admin-audit"],
        queryFn: async () => (await fetch("/api/admin/audit/feed")).json().then(r => r.logs),
        refetchInterval: 5000 // Real-time feed
    });

    if (isLoading) return <div className="h-[400px] flex items-center justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>;

    const getIcon = (action: string) => {
        if (action.includes("BAN")) return <Ban className="w-3 h-3 text-red-500" />;
        if (action.includes("ADJUST")) return <DollarSign className="w-3 h-3 text-amber-500" />;
        if (action.includes("UPDATE")) return <Edit className="w-3 h-3 text-blue-500" />;
        return <Shield className="w-3 h-3 text-zinc-500" />;
    };

    return (
        <div className="bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-md h-[500px] flex flex-col">
            <div className="p-4 border-b border-white/5 bg-white/5 rounded-t-xl flex justify-between items-center">
                <h3 className="font-bold text-sm text-zinc-300 uppercase tracking-widest">Global Audit Feed</h3>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full text-[10px] text-green-400 border border-green-500/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    LIVE
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {logs?.map((log: any) => (
                        <div key={log.id} className="flex gap-3 relative pb-4 last:pb-0 border-l border-white/5 pl-4 last:border-0 ml-2">
                            <div className="absolute -left-[21px] top-0 h-6 w-6 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
                                {getIcon(log.action)}
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white">{log.admin?.username || "System"}</span>
                                    <span className="text-[10px] text-zinc-500 font-mono">{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
                                </div>
                                <p className="text-xs text-zinc-400">
                                    <span className="text-zinc-500 font-mono uppercase text-[10px] mr-1">[{log.action}]</span>
                                    {log.details.substring(0, 100)}
                                    {log.user && <span className="text-blue-400 ml-1">@{log.user.username}</span>}
                                </p>
                            </div>
                        </div>
                    ))}
                    {logs?.length === 0 && <div className="text-center text-zinc-500 text-xs py-10">No recent activity.</div>}
                </div>
            </ScrollArea>
        </div>
    );
}
