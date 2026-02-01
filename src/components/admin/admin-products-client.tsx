"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package, CheckCircle2, XCircle, Clock, ShoppingBag,
  ExternalLink, Filter, RotateCcw, ArrowRight, Layers
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { ConvertSuggestionDialog } from "./convert-suggestion-dialog";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProductSuggestion {
  id: string;
  productName: string;
  platform: string;
  category: string | null;
  amount: number | null;
  orderId: string | null;
  files: string[] | null;
  status: string;
  user: {
    id: string;
    phone: string;
    username: string | null;
    email: string | null;
  };
  created_at: string;
  updated_at: string;
}

interface ProductSuggestionsResponse {
  success: boolean;
  data: ProductSuggestion[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

async function fetchSuggestions(filters: {
  status?: string;
  platform?: string;
  page?: number;
}): Promise<ProductSuggestionsResponse> {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.platform) params.append("platform", filters.platform);
  if (filters.page) params.append("page", filters.page.toString());

  const response = await fetch(`/api/admin/products/suggestions?${params.toString()}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch suggestions");
  }

  return response.json();
}

export function AdminProductsClient() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [platformFilter, setPlatformFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ProductSuggestion | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-product-suggestions", statusFilter, platformFilter, page],
    queryFn: () => fetchSuggestions({ status: statusFilter || undefined, platform: platformFilter || undefined, page }),
  });

  const convertMutation = useMutation({
    mutationFn: async ({ suggestionId, taskData }: { suggestionId: string; taskData: Record<string, any> }) => {
      const response = await fetch(`/api/admin/products/suggestions/${suggestionId}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to convert suggestion");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-product-suggestions"] });
      setSelectedSuggestion(null);
      toast({
        title: "Success",
        description: "Review conversion complete",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Conversion Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><LoadingSkeleton className="h-[300px] w-full" /><LoadingSkeleton className="h-[300px] w-full" /><LoadingSkeleton className="h-[300px] w-full" /></div>;

  if (error) return (
    <div className="h-[400px] flex flex-col items-center justify-center border border-white/5 bg-white/5 rounded-xl text-neutral-500">
      <XCircle className="w-12 h-12 mb-4 opacity-50" />
      <p>Failed to retrieve material data.</p>
    </div>
  );

  const suggestions = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-8">
      {/* Header and Filter Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-pink-500/10 to-transparent border border-white/5 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-pink-500" />
            Material Requests
          </h2>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">
            Pending Reviews: <span className="text-white">{suggestions.filter(s => s.status === 'pending').length}</span>
          </p>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button className="relative z-10 bg-white/10 hover:bg-white/20 border border-white/5 text-white font-bold uppercase tracking-wider text-xs">
              <Filter className="w-4 h-4 mr-2" />
              Filters & Options
              {(statusFilter || platformFilter) && <div className="ml-2 w-2 h-2 rounded-full bg-pink-500" />}
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-neutral-950 border-l border-white/10">
            <SheetHeader>
              <SheetTitle className="text-white uppercase font-black tracking-tight">Data Filters</SheetTitle>
              <SheetDescription className="text-neutral-500">
                Refine the material request list.
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6 mt-8">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-400 uppercase">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-white/10">
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-400 uppercase">Platform</Label>
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="All Platforms" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-white/10">
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="amazon">Amazon</SelectItem>
                    <SelectItem value="flipkart">Flipkart</SelectItem>
                    <SelectItem value="myntra">Myntra</SelectItem>
                    <SelectItem value="nykaa">Nykaa</SelectItem>
                    <SelectItem value="swiggy">Swiggy</SelectItem>
                    <SelectItem value="zomato">Zomato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  setStatusFilter("");
                  setPlatformFilter("");
                  setPage(1);
                }}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Product Card Grid */}
      {suggestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
          <Layers className="h-16 w-16 text-neutral-700 mb-6" />
          <h3 className="text-lg font-bold text-neutral-300">No Materials Found</h3>
          <p className="text-sm text-neutral-500 mt-2">Try adjusting the filters or wait for new submissions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {suggestions.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="bg-black/40 backdrop-blur-sm border-white/5 hover:border-pink-500/30 transition-all duration-300 overflow-hidden group h-full flex flex-col relative">
                {/* Card Accent */}
                <div className={cn("absolute top-0 left-0 w-1 h-full",
                  item.status === 'pending' ? 'bg-amber-500' :
                    item.status === 'approved' || item.status === 'converted' ? 'bg-emerald-500' : 'bg-red-500'
                )} />

                <CardHeader className="pb-3 pl-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <Badge variant="outline" className="border-white/10 bg-white/5 text-[10px] uppercase tracking-widest text-neutral-400 mb-2">
                        {item.platform}
                      </Badge>
                      <CardTitle className="text-lg font-bold text-white line-clamp-1" title={item.productName}>
                        {item.productName}
                      </CardTitle>
                      <CardDescription className="font-mono text-xs text-neutral-500">
                        {item.category || "Uncategorized"}
                      </CardDescription>
                    </div>
                    <div className={cn("p-2 rounded-full",
                      item.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                        item.status === 'approved' || item.status === 'converted' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    )}>
                      {item.status === 'pending' && <Clock className="w-4 h-4" />}
                      {(item.status === 'approved' || item.status === 'converted') && <CheckCircle2 className="w-4 h-4" />}
                      {item.status === 'rejected' && <XCircle className="w-4 h-4" />}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 pl-6">
                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-white/5">
                    <div className="space-y-1">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold">User</span>
                      <p className="text-sm font-semibold text-neutral-300 truncate">{item.user.username}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold">Value</span>
                      <p className="text-sm font-semibold text-white">₹{item.amount?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>ID: <span className="font-mono text-neutral-400">...{item.id.slice(-6)}</span></span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
                <CardFooter className="bg-white/[0.02] border-t border-white/5 p-4 flex justify-between items-center pl-6">
                  <Button variant="ghost" size="sm" className="text-xs text-neutral-400 hover:text-white">
                    Details <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                  {item.status === 'pending' && (
                    <Button
                      size="sm"
                      className="bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs"
                      onClick={() => setSelectedSuggestion(item)}
                    >
                      Convert <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="border-white/10 bg-black hover:bg-white/10">
            Previous
          </Button>
          <span className="text-xs font-mono text-neutral-500">Page {page} of {pagination.total_pages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))} disabled={page === pagination.total_pages} className="border-white/10 bg-black hover:bg-white/10">
            Next
          </Button>
        </div>
      )}

      {/* Dialog */}
      {selectedSuggestion && (
        <ConvertSuggestionDialog
          suggestion={selectedSuggestion}
          onConvert={(taskData) => {
            convertMutation.mutate({ suggestionId: selectedSuggestion.id, taskData });
          }}
          onCancel={() => setSelectedSuggestion(null)}
        />
      )}
    </div>
  );
}


