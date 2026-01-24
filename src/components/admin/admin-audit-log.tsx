"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, ShieldAlert, Clock, User as UserIcon, Terminal } from "lucide-react";
import { format } from "date-fns";

interface AuditLog {
    id: string;
    action: string;
    user: {
        username: string;
        role: string;
    } | null;
    entityType: string | null;
    entityId: string | null;
    metadata: any;
    createdAt: string;
}

export function AdminAuditLog() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["admin-security-logs", page, search],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: "20",
                search,
            });
            const res = await fetch(`/api/admin/security/logs?${params}`);
            if (!res.ok) throw new Error("Failed to fetch logs");
            return await res.json();
        },
        placeholderData: keepPreviousData,
    });

    const logs: AuditLog[] = data?.logs || [];
    const pagination = data?.pagination || { total_pages: 1 };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 bg-zinc-950/40 p-2 rounded-xl border border-white/5 backdrop-blur-md max-w-sm">
                <Search className="h-4 w-4 text-zinc-500 ml-2" />
                <Input
                    placeholder="Search logs..."
                    className="border-none bg-transparent focus-visible:ring-0"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="rounded-xl border border-white/5 bg-zinc-950/40 overflow-hidden backdrop-blur-md">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Timestamp</TableHead>
                            <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Actor</TableHead>
                            <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Action</TableHead>
                            <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Target / Metadata</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-zinc-600" />
                                </TableCell>
                            </TableRow>
                        ) : logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-zinc-500">
                                    No audit records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id} className="border-white/5 hover:bg-white/5">
                                    <TableCell className="font-mono text-xs text-zinc-400 whitespace-nowrap">
                                        {format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1 rounded-md ${log.user?.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                                {log.user?.role === 'ADMIN' ? <ShieldAlert className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                                            </div>
                                            <span className="text-sm font-medium text-zinc-300">
                                                {log.user?.username || "System"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono bg-blue-500/10 text-blue-400 border-blue-500/20">
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {log.entityType && (
                                                <div className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase font-bold">
                                                    <Terminal className="h-3 w-3" />
                                                    {log.entityType} : {log.entityId}
                                                </div>
                                            )}
                                            {log.metadata && (
                                                <pre className="text-[10px] text-zinc-400 overflow-x-auto max-w-[300px]">
                                                    {JSON.stringify(log.metadata)}
                                                </pre>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || isLoading}
                >
                    Previous
                </Button>
                <span className="text-xs text-zinc-500 font-mono">
                    Page {page} of {pagination.total_pages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= pagination.total_pages || isLoading}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
