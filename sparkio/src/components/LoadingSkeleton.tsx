import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const LoadingSkeleton = ({ className }: { className?: string }) => (
  <Card className={cn("border-border bg-card", className)}>
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex items-center gap-2 mt-4">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-10 w-full mt-4" />
    </div>
  </Card>
);

export const WalletSkeleton = () => (
  <Card className="relative overflow-hidden border-border bg-card p-4 sm:p-6">
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 sm:h-9 sm:w-9 rounded-full" />
          <Skeleton className="h-3 w-24 sm:h-4 sm:w-32" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-10 w-32 sm:h-12 sm:w-40" />
        <Skeleton className="h-3 w-36 sm:w-48" />
      </div>
      <Skeleton className="h-10 sm:h-11 w-full" />
    </div>
  </Card>
);

export const StatsCardSkeleton = () => (
  <Card className="border-border bg-card p-3 sm:p-4">
    <div className="flex items-start justify-between gap-2">
      <div className="space-y-1.5 sm:space-y-2 flex-1">
        <Skeleton className="h-3 w-20 sm:w-24" />
        <Skeleton className="h-7 w-12 sm:h-8 sm:w-16" />
        <Skeleton className="h-2.5 w-16 sm:h-3 sm:w-20" />
      </div>
      <Skeleton className="h-7 w-7 sm:h-9 sm:w-9 rounded-lg" />
    </div>
  </Card>
);

export const ReferralListSkeleton = () => (
  <Card className="border-border bg-card p-4 sm:p-6">
    <Skeleton className="mb-3 sm:mb-4 h-5 w-32 sm:h-6 sm:w-40" />
    <div className="space-y-2 sm:space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 p-2.5 sm:p-3"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
            <div className="space-y-1.5 sm:space-y-2">
              <Skeleton className="h-3.5 w-24 sm:h-4 sm:w-32" />
              <Skeleton className="h-2.5 w-16 sm:h-3 sm:w-20" />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="h-4 w-10 sm:h-5 sm:w-12" />
            <Skeleton className="h-4 w-12 sm:h-5 sm:w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  </Card>
);

export const LeaderboardSkeleton = () => (
  <Card className="border-border bg-card p-4 sm:p-6">
    <div className="mb-3 sm:mb-4 flex items-center justify-between">
      <Skeleton className="h-5 w-32 sm:h-6 sm:w-40" />
      <Skeleton className="h-3.5 w-20 sm:h-4 sm:w-24" />
    </div>
    <div className="space-y-1.5 sm:space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/20 p-2 sm:p-3"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
            <div className="space-y-1.5 sm:space-y-2">
              <Skeleton className="h-3.5 w-20 sm:h-4 sm:w-24" />
              <Skeleton className="h-2.5 w-16 sm:h-3 sm:w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-10 sm:h-5 sm:w-12" />
        </div>
      ))}
    </div>
  </Card>
);
