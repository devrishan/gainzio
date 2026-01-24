"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIInsightCardProps {
    stats: any[];
}

export function AIInsightCard({ stats }: AIInsightCardProps) {
    const [insight, setInsight] = useState("");
    const [isTyping, setIsTyping] = useState(true);

    // Simple "AI" logic to generate a message
    useEffect(() => {
        if (!stats || stats.length === 0) return;

        const lastDay = stats[stats.length - 1];
        const prevDay = stats[stats.length - 2] || lastDay;

        let message = "System status nominal. ";

        if (lastDay.newUsers > prevDay.newUsers) {
            message += "User acquisition accelerating. Recommended action: Increase referral limits.";
        } else if (lastDay.coinsMinted > lastDay.coinsBurned * 2) {
            message += "Inflation alert. Coin minting exceeds burn rate by 200%. Suggest releasing new Shop items.";
        } else {
            message += "Economy stable. User retention within expected parameters.";
        }

        setInsight(message);
    }, [stats]);

    return (
        <Card className="relative overflow-hidden border-purple-500/30 bg-black/40 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 animate-pulse pointer-events-none" />

            <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <BrainCircuit className="h-5 w-5 text-purple-400" />
                <CardTitle className="text-sm font-mono tracking-widest text-purple-200 uppercase">
                    CORTEX INTELLIGENCE
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="min-h-[60px] font-mono text-sm text-purple-100/90 leading-relaxed relative">
                    <Typewriter text={insight} speed={30} onComplete={() => setIsTyping(false)} />
                    <span className="inline-block w-2 h-4 ml-1 bg-purple-400 animate-pulse align-middle" />
                </div>
            </CardContent>
        </Card>
    );
}

function Typewriter({ text, speed = 50, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText((prev) => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
                onComplete?.();
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed, onComplete]);

    return <span>{displayedText}</span>;
}
