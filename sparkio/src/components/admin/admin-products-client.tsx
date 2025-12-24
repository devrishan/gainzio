"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, CheckCircle2, XCircle, Package, Search, Filter, ArrowUpDown } from "lucide-react";
import { ConvertSuggestionDialog } from "./convert-suggestion-dialog";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useToast } from "@/hooks/use-toast";

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

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case "approved":
      return (
        <Badge variant="default" className="gap-1 bg-green-600">
          <CheckCircle2 className="h-3 w-3" />
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      );
    case "converted":
      return (
        <Badge variant="secondary" className="gap-1">
          <Package className="h-3 w-3" />
          Converted
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
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
    mutationFn: async ({ suggestionId, taskData }: { suggestionId: string; taskData: any }) => {
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
        title: "Suggestion converted",
        description: "The product suggestion has been converted to a task.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Conversion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <LoadingSkeleton className="h-96" />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <XCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load suggestions</h3>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const suggestions = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter product suggestions by status and platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform-filter">Platform</Label>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger id="platform-filter">
                  <SelectValue placeholder="All platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="amazon">Amazon</SelectItem>
                  <SelectItem value="flipkart">Flipkart</SelectItem>
                  <SelectItem value="myntra">Myntra</SelectItem>
                  <SelectItem value="nykaa">Nykaa</SelectItem>
                  <SelectItem value="swiggy">Swiggy</SelectItem>
                  <SelectItem value="zomato">Zomato</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter("");
                  setPlatformFilter("");
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Suggestions</CardTitle>
          <CardDescription>
            {pagination ? `${pagination.total} total suggestions` : "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No suggestions found</h3>
              <p className="text-sm text-muted-foreground">
                {statusFilter || platformFilter
                  ? "Try adjusting your filters"
                  : "No product suggestions have been submitted yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suggestions.map((suggestion) => (
                      <TableRow key={suggestion.id}>
                        <TableCell className="font-medium">
                          {suggestion.productName}
                          {suggestion.category && (
                            <div className="text-xs text-muted-foreground">{suggestion.category}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{suggestion.platform}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {suggestion.user.username || suggestion.user.email || suggestion.user.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          {suggestion.amount ? `₹${suggestion.amount.toFixed(2)}` : "-"}
                        </TableCell>
                        <TableCell>{getStatusBadge(suggestion.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(suggestion.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {suggestion.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => setSelectedSuggestion(suggestion)}
                            >
                              Convert to Task
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.total_pages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                      disabled={pagination.page === pagination.total_pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Convert Dialog */}
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

