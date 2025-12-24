"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, Clock, CheckCircle2, XCircle, Image as ImageIcon } from "lucide-react";
import { ProductSuggestionForm } from "./product-suggestion-form";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  productName: string;
  platform: string;
  category: string | null;
  amount: number | null;
  orderId: string | null;
  files: string[] | null;
  status: string;
  created_at: string;
  updated_at: string;
}

async function fetchProducts(status?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  const query = params.toString();
  const response = await fetch(`/api/member/products${query ? `?${query}` : ""}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const data = await response.json();
  return data.products || [];
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

export function MemberProductsClient() {
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products", statusFilter],
    queryFn: () => fetchProducts(statusFilter),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <LoadingSkeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <XCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load products</h3>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An error occurred"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Product Suggestions</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Suggest Product
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={(value) => setStatusFilter(value === "all" ? undefined : value)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="converted">Converted</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter || "all"} className="mt-4">
          {!products || products.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start by suggesting a product you've purchased.
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Suggest Product
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{product.productName}</CardTitle>
                      {getStatusBadge(product.status)}
                    </div>
                    <CardDescription>
                      {product.platform} {product.category && `• ${product.category}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {product.amount && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Amount: </span>
                        <span className="font-semibold">₹{product.amount.toFixed(2)}</span>
                      </div>
                    )}
                    {product.orderId && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Order ID: </span>
                        <span className="font-mono text-xs">{product.orderId}</span>
                      </div>
                    )}
                    {product.files && product.files.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                        <span>{product.files.length} file(s)</span>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {new Date(product.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {showForm && (
        <ProductSuggestionForm
          onSuccess={() => {
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast({
              title: "Product suggested",
              description: "Your product suggestion has been submitted for review.",
            });
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
