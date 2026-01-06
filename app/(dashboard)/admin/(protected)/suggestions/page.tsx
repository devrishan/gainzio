
import { getAdminSuggestions } from "@/services/admin";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import {
    ShoppingBag, Link as LinkIcon, ExternalLink, Clock, CheckCircle, XCircle
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SuggestionsPage() {
    const suggestions = await getAdminSuggestions();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Product Suggestions</h1>
                <p className="text-neutral-500 mt-1">Review and manage user-submitted product requests.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {suggestions.length === 0 ? (
                    <div className="p-12 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-neutral-500">
                        <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
                        <p>No new suggestions found.</p>
                    </div>
                ) : (
                    suggestions.map((item) => (
                        <Card key={item.id} className="p-6 bg-zinc-950/40 border-white/5 backdrop-blur-sm hover:bg-zinc-900/40 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-white text-lg">{item.productName}</h3>
                                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider border-white/10 text-neutral-400">
                                            {item.platform}
                                        </Badge>
                                        <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider border-0 ${item.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                                item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    'bg-red-500/10 text-red-500'
                                            }`}>
                                            {item.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-zinc-500 flex items-center gap-2">
                                        <span>Suggested by <span className="text-zinc-300 font-medium">{item.user.username}</span></span>
                                        <span>•</span>
                                        <span>{format(new Date(item.createdAt), "PPP")}</span>
                                    </p>
                                    {item.amount && (
                                        <p className="text-sm font-mono text-emerald-400 font-bold mt-2">
                                            Target Price: ₹{item.amount.toLocaleString()}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Actions Stub - In a real app these would call client components/server actions */}
                                    {item.status === 'pending' && (
                                        <>
                                            <button className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors" title="Approve">
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors" title="Reject">
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
