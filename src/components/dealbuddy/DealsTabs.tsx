"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Clock, Users } from "lucide-react";
import { formatTimer } from "@/utils/formatTimer";

interface Deal {
    id: string;
    title: string;
    entries: number;
    maxEntries: number;
    endTimeInSeconds: number;
    status: "live" | "ended" | "upcoming";
    image?: string;
}

interface DealsTabsProps {
    initialTab?: string;
}

const DealCard = ({ deal }: { deal: Deal }) => (
    <Card className="bg-[#111111] border border-white/5 overflow-hidden hover:border-[#00F260]/30 transition-all group">
        <div className="h-32 bg-[#1A1A1A] relative">
            {/* Placeholder for image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm border border-white/10 uppercase font-bold tracking-wider">
                {deal.status}
            </span>
        </div>
        <div className="p-4 space-y-3">
            <h3 className="text-white font-medium line-clamp-1 group-hover:text-[#00F260] transition-colors">
                {deal.title}
            </h3>

            <div className="flex items-center justify-between text-xs text-[#AAAAAA]">
                <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{deal.entries}/{deal.maxEntries}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#0575E6]">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-mono">{formatTimer(deal.endTimeInSeconds)}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-[#00F260] to-[#0575E6]"
                    style={{ width: `${(deal.entries / deal.maxEntries) * 100}%` }}
                />
            </div>
        </div>
    </Card>
);

export const DealsTabs = ({ initialTab = "live" }: DealsTabsProps) => {
    // Mock data
    const liveDeals: Deal[] = [
        { id: "1", title: "iPhone 15 Pro Max", entries: 450, maxEntries: 1000, endTimeInSeconds: 3600, status: "live" },
        { id: "2", title: "PlayStation 5", entries: 120, maxEntries: 500, endTimeInSeconds: 7200, status: "live" },
    ];

    const historyDeals: Deal[] = [
        { id: "3", title: "AirPods Pro", entries: 500, maxEntries: 500, endTimeInSeconds: 0, status: "ended" },
    ];

    return (
        <Tabs defaultValue={initialTab} className="w-full">
            <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
                <TabsList className="bg-transparent gap-2 h-auto p-0 w-max">
                    {["Live", "Upcoming", "Winnings", "History"].map((tab) => (
                        <TabsTrigger
                            key={tab}
                            value={tab.toLowerCase()}
                            className="rounded-full border border-white/10 bg-[#1A1A1A] px-6 py-2.5 text-sm data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-bold text-[#AAAAAA] hover:text-white transition-all"
                        >
                            {tab}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>

            <TabsContent value="live" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {liveDeals.map((deal) => (
                        <DealCard key={deal.id} deal={deal} />
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {historyDeals.map((deal) => (
                        <DealCard key={deal.id} deal={deal} />
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="upcoming" className="mt-4">
                <div className="text-center py-10 text-[#AAAAAA]">
                    <p>Upcoming deals will appear here.</p>
                </div>
            </TabsContent>

            <TabsContent value="winnings" className="mt-4">
                <div className="text-center py-10 text-[#AAAAAA]">
                    <p>Access your prize history here.</p>
                </div>
            </TabsContent>
        </Tabs>
    );
};
