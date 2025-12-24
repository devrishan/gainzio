"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, Star } from "lucide-react";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import Link from "next/link";

interface TopSuggestion {
  suggestionId: string;
  score: number;
  productName: string;
  platform: string;
  category: string | null;
  amount: number | null;
  createdAt: string;
}

async function getTopSuggestions(limit: number = 10): Promise<TopSuggestion[]> {
  const response = await fetch(`/api/products/top-suggestions?limit=${limit}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch top suggestions");
  }
  const data = await response.json();
  return data.suggestions;
}

const PLATFORM_COLORS: Record<string, string> = {
  amazon: "bg-orange-500/20 text-orange-600",
  flipkart: "bg-blue-500/20 text-blue-600",
  meesho: "bg-pink-500/20 text-pink-600",
  myntra: "bg-purple-500/20 text-purple-600",
  default: "bg-gray-500/20 text-gray-600",
};

export function TopSuggestions({ limit = 10 }: { limit?: number }) {
  const { data: suggestions, isLoading, error } = useQuery<TopSuggestion[]>({
    queryKey: ["topSuggestions", limit],
    queryFn: () => getTopSuggestions(limit),
    staleTime: 3600000, // 1 hour
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-48" />
      </div>
    );
  }

  if (error || !suggestions || suggestions.length === 0) {
    return null; // Don't show anything if there are no suggestions
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Product Suggestions
            </CardTitle>
            <CardDescription>Most popular and trending product suggestions</CardDescription>
          </div>
          <Link href="/member/products">
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              View All
            </Badge>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.suggestionId}
              className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-semibold text-sm truncate">{suggestion.productName}</p>
                  {index < 3 && (
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={PLATFORM_COLORS[suggestion.platform.toLowerCase()] || PLATFORM_COLORS.default}
                  >
                    {suggestion.platform}
                  </Badge>
                  {suggestion.category && (
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.category}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  {suggestion.amount && (
                    <p className="text-sm font-medium">₹{suggestion.amount.toFixed(2)}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Score: {suggestion.score.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

