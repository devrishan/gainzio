
import { getAdminMemberById } from "@/services/admin";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import {
    User, Mail, Phone, Calendar, Clock, creditCard,
    Shield, Activity, Users, DollarSign, Ban, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function MemberDetailPage({ params }: { params: { id: string } }) {
    const user = await getAdminMemberById(params.id);

    if (!user) {
        return (
            <div className="p-8 text-center text-neutral-400">
                User not found.
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black italic tracking-tight uppercase text-white/90">
                            {user.username || "Anonymous Agent"}
                        </h1>
                        <Badge variant="outline" className={`border-0 uppercase text-[10px] font-black tracking-widest ${user.role === "ADMIN"
                            ? "bg-purple-500/10 text-purple-400"
                            : "bg-zinc-800/50 text-zinc-400"
                            }`}>
                            {user.role}
                        </Badge>
                        <Badge variant="outline" className={`border-0 uppercase text-[10px] font-black tracking-widest ${user.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                            }`}>
                            {user.status}
                        </Badge>
                    </div>
                    <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest">ID: {user.id}</p>
                </div>
                <div className="flex gap-2">
                    {user.status === "Active" ? (
                        <Button variant="destructive" size="sm" className="font-bold">
                            <Ban className="w-4 h-4 mr-2" /> Suspend User
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" className="font-bold border-emerald-500/50 text-emerald-400 hover:bg-emerald-950/30">
                            <CheckCircle className="w-4 h-4 mr-2" /> Activate User
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* User Identity Card */}
                <Card className="col-span-1 p-6 bg-zinc-950/40 border-white/5 backdrop-blur-sm space-y-6">
                    <h3 className="text-xs font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Identity & Security
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-zinc-900/50 border border-white/5">
                                <Mail className="w-4 h-4 text-zinc-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Email Address</p>
                                <p className="text-sm font-medium text-white">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-zinc-900/50 border border-white/5">
                                <Phone className="w-4 h-4 text-zinc-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Phone Number</p>
                                <p className="text-sm font-medium text-white">{user.phone || "Not set"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-zinc-900/50 border border-white/5">
                                <Calendar className="w-4 h-4 text-zinc-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Joined On</p>
                                <p className="text-sm font-medium text-white">{format(new Date(user.createdAt), "PPP")}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-zinc-900/50 border border-white/5">
                                <Clock className="w-4 h-4 text-zinc-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Last Active</p>
                                <p className="text-sm font-medium text-white">
                                    {user.lastLoginAt ? format(new Date(user.lastLoginAt), "PPP p") : "Never"}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Financial & Activity Layout */}
                <div className="col-span-1 lg:col-span-2 space-y-6">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-4 bg-zinc-900/20 border-white/5 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <DollarSign className="w-4 h-4 text-emerald-400" />
                                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Wallet Balance</span>
                            </div>
                            <p className="text-2xl font-bold text-white">₹{user.walletBalance.toLocaleString()}</p>
                        </Card>

                        <Card className="p-4 bg-zinc-900/20 border-white/5 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <Activity className="w-4 h-4 text-blue-400" />
                                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Total Earnings</span>
                            </div>
                            <p className="text-2xl font-bold text-white">₹{user.totalEarnings.toLocaleString()}</p>
                        </Card>

                        <Card className="p-4 bg-zinc-900/20 border-white/5 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <Users className="w-4 h-4 text-amber-400" />
                                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Referrals</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{user.stats.referrals}</p>
                        </Card>
                    </div>

                    {/* Detailed Activity Breakdown */}
                    <Card className="p-6 bg-zinc-950/40 border-white/5 backdrop-blur-sm">
                        <h3 className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-6">Activity Snapshot</h3>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase mb-1">Tasks Submitted</p>
                                <p className="text-xl font-bold text-white">{user.stats.tasks}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase mb-1">Withdrawal Requests</p>
                                <p className="text-xl font-bold text-white">{user.stats.withdrawals}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase mb-1">Referral Code</p>
                                <code className="text-sm bg-zinc-900 px-2 py-1 rounded text-purple-300 font-mono">{user.referralCode || "NONE"}</code>
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase mb-1">Referred By</p>
                                {user.referredBy ? (
                                    <span className="text-sm text-blue-400 font-medium cursor-pointer">{user.referredBy.username}</span>
                                ) : (
                                    <span className="text-sm text-zinc-600 italic">Direct Join/Unknown</span>
                                )}
                            </div>
                        </div>
                    </Card>

                </div>

            </div>
        </div>
    );
}
