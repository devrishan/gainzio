"use client";

import { Wallet, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WalletViewProps {
    coins: number;
}

export const WalletView = ({ coins }: WalletViewProps) => {
    const inrValue = (coins / 100).toFixed(2);

    return (
        <Card className="relative overflow-hidden border-none bg-[#111111] bg-gradient-to-b from-[#111111] to-[#1A1A1A] p-6 shadow-lg rounded-xl">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-full bg-[#0575E6]/10">
                            <Wallet className="w-5 h-5 text-[#0575E6]" />
                        </div>
                        <span className="text-[#AAAAAA] font-medium text-sm">My Wallet</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="w-4 h-4 text-[#AAAAAA] hover:text-white transition-colors" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-[#1A1A1A] border-none text-white text-xs">
                                    <p>100 Coins = ₹1</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-4xl font-bold text-white tracking-tight">
                            {coins.toLocaleString()} <span className="text-lg font-medium text-[#AAAAAA]">Coins</span>
                        </h2>
                        <div className="flex items-center gap-2">
                            <p className="text-[#00F260] font-medium text-lg">
                                ≈ ₹{inrValue}
                            </p>
                            <span className="text-xs text-[#AAAAAA] px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                                Withdrawable
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative gradient blob */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-gradient-to-br from-[#00F260] to-[#0575E6] rounded-full blur-[60px] opacity-20 pointer-events-none" />
        </Card>
    );
};
