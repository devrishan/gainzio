"use client";

import { Card } from "@/components/ui/card";
import { Timer, ShoppingBag } from "lucide-react";
import { formatTimer } from "@/utils/formatTimer";
import { Button } from "@/components/ui/button";

interface YardSaleCardProps {
    title: string;
    image?: string;
    price: number;
    originalPrice: number;
    endTimeInSeconds: number;
    sold?: boolean;
}

export const YardSaleCard = ({
    title,
    image,
    price,
    originalPrice,
    endTimeInSeconds,
    sold = false
}: YardSaleCardProps) => {
    const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

    return (
        <Card className="group relative bg-[#111111] overflow-hidden rounded-xl border-none shadow-lg">
            {/* Image Area */}
            <div className="aspect-square bg-[#1A1A1A] relative p-4 flex items-center justify-center">
                {/* Discount Badge */}
                <div className="absolute top-3 left-3 bg-[#00F260] text-black text-xs font-bold px-2 py-1 rounded-full z-10">
                    -{discount}% OFF
                </div>

                {/* Placeholder for Image */}
                <div className="w-full h-full bg-gradient-to-br from-[#222] to-[#111] rounded-lg flex items-center justify-center text-[#333]">
                    <ShoppingBag className="w-12 h-12 opacity-20" />
                </div>

                {/* Timer overlay */}
                {!sold && (
                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md rounded-lg px-2 py-1 flex items-center gap-1.5 border border-white/10">
                        <Timer className="w-3.5 h-3.5 text-[#00F260]" />
                        <span className="text-xs font-mono font-medium text-white">
                            {formatTimer(endTimeInSeconds)}
                        </span>
                    </div>
                )}

                {/* Sold Overlay */}
                {sold && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="bg-[#FF4D4D] text-white px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-sm transform -rotate-6 shadow-xl border border-white/20">
                            Sold Out
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <div className="space-y-1">
                    <h3 className="text-white font-medium text-sm line-clamp-2 leading-relaxed group-hover:text-[#00F260] transition-colors">
                        {title}
                    </h3>
                </div>

                <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                        <span className="text-[#AAAAAA] text-xs line-through">₹{originalPrice}</span>
                        <span className="text-white font-bold text-lg">₹{price}</span>
                    </div>
                    <Button
                        size="sm"
                        disabled={sold}
                        className={`h-8 px-4 text-xs font-bold ${sold
                                ? 'bg-[#1A1A1A] text-[#AAAAAA] cursor-not-allowed'
                                : 'bg-white text-black hover:bg-white/90 hover:scale-105 transition-all'
                            }`}
                    >
                        {sold ? 'Sold' : 'Buy Now'}
                    </Button>
                </div>
            </div>
        </Card>
    );
};
