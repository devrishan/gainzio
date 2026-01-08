import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-10 w-[250px] bg-white/5" />
                <Skeleton className="h-4 w-[400px] bg-white/5" />
            </div>

            {/* Hero Section Grid Skeleton */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Rank Card Skeleton (Large) */}
                <Card className="glass-morphism border-white/5 col-span-4 h-[280px]">
                    <CardHeader className="space-y-2">
                        <Skeleton className="h-4 w-[100px] bg-white/10" />
                        <Skeleton className="h-8 w-[200px] bg-white/10" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-4 w-full bg-white/5" />
                        <Skeleton className="h-2 w-full bg-white/5 rounded-full" />
                        <div className="flex justify-between mt-auto">
                            <Skeleton className="h-8 w-[100px] bg-white/10" />
                            <Skeleton className="h-8 w-[100px] bg-white/10" />
                        </div>
                    </CardContent>
                </Card>

                {/* Wallet Card Skeleton */}
                <Card className="glass-morphism border-white/5 col-span-3 h-[280px] flex flex-col justify-between">
                    <CardHeader>
                        <Skeleton className="h-6 w-[120px] bg-white/10" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-12 w-[150px] bg-white/10" />
                        <Skeleton className="h-10 w-full bg-white/5" />
                    </CardContent>
                </Card>
            </div>

            {/* Squad Goal Skeleton */}
            <Card className="glass-morphism border-white/5">
                <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between">
                        <Skeleton className="h-6 w-[200px] bg-white/10" />
                        <Skeleton className="h-6 w-[100px] bg-white/10" />
                    </div>
                    <Skeleton className="h-3 w-full bg-white/5 rounded-full" />
                </CardContent>
            </Card>

            {/* Stats Row Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="glass-morphism border-white/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-[100px] bg-white/10" />
                            <Skeleton className="h-4 w-4 rounded-full bg-white/10" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[100px] bg-white/10 mb-2" />
                            <Skeleton className="h-3 w-[80%] bg-white/5" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Daily Missions Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-8 w-[200px] bg-white/5" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="glass-morphism border-white/5 h-[200px]">
                            <CardHeader>
                                <Skeleton className="h-6 w-[150px] bg-white/10" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-4 w-full bg-white/5" />
                                <Skeleton className="h-4 w-[80%] bg-white/5" />
                                <Skeleton className="h-10 w-full bg-white/10 mt-auto" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
