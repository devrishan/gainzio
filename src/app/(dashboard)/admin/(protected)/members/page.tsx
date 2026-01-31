import Link from "next/link";
import { getAdminMembers } from "@/services/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MemberActions } from "@/components/admin/member-actions";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Search, Shield, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function MemberManagementPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const { users, pagination } = await getAdminMembers(searchParams);

  return (
    <div className="space-y-8 relative">
      {/* Background Decor */}
      <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-60 -left-40 h-[400px] w-[400px] rounded-full bg-blue-900/10 blur-[100px] pointer-events-none" />

      <header className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-black italic tracking-tight uppercase text-white/90">Member Database</h1>
          </div>
          <p className="text-sm font-medium text-zinc-500 max-w-lg">
            Manage user access, roles, and account status across the specific verified network.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-950/40 p-1 rounded-xl border border-white/5 backdrop-blur-md">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              name="search"
              type="search"
              placeholder="Search database..."
              className="pl-9 w-[280px] bg-transparent border-none text-white placeholder:text-zinc-600 focus-visible:ring-0"
              defaultValue={searchParams.search}
            />
          </div>
        </div>
      </header>

      <Card className="relative z-10 border-white/5 bg-zinc-950/40 backdrop-blur-2xl p-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

        <div className="rounded-2xl border border-white/5 overflow-hidden">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="text-[10px] font-black uppercase text-zinc-500 tracking-widest pl-6">User Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Access Role</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Wallet Balance</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Joined On</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Last Active</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase text-zinc-500 tracking-widest pr-6">Commands</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-white/5 border-white/5 transition-colors group">
                  <TableCell className="pl-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm group-hover:text-primary transition-colors">{user.username || "Anonymous Agent"}</span>
                      <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">{user.email}</span>
                      {user.phone && <span className="text-[10px] text-zinc-600">{user.phone}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-0 uppercase text-[10px] font-black tracking-widest ${user.role === "ADMIN"
                      ? "bg-purple-500/10 text-purple-400"
                      : "bg-zinc-800/50 text-zinc-400"
                      }`}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-emerald-400 font-bold">₹{user.walletBalance.toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="text-zinc-500 text-xs font-medium">
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-zinc-500 text-xs font-medium">
                    {user.lastLoginAt
                      ? format(new Date(user.lastLoginAt), "MMM d, HH:mm")
                      : <span className="text-zinc-700 italic">Inactive</span>}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <MemberActions
                      userId={user.id}
                      userRole={user.role}
                    // Assuming getAdminMembers now returns these fields or we need to update the query
                    // For now we'll pass defaults if missing, but we should update the service type definition
                    />
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <Shield className="h-8 w-8 text-zinc-600" />
                      <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">No verified members found</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex items-center justify-center gap-2 text-xs text-zinc-600 font-mono uppercase tracking-widest">
        <span>Query returned {users.length} of {pagination.total} records</span>
      </div>
    </div>
  );
}
