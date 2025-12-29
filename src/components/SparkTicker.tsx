"use client";

import { useEffect, useState, useRef } from "react";
import { Sparkles, X, ChevronRight, Trophy, ExternalLink } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SparkEvent {
    id: string;
    type: string;
    message: string;
    data: any;
    createdAt: string;
}

export function SparkTicker() {
    const [currentEvent, setCurrentEvent] = useState<SparkEvent | null>(null);
    const [queue, setQueue] = useState<SparkEvent[]>([]);
    const [isVisible, setIsVisible] = useState(true);
    const eventSourceRef = useRef<EventSource | null>(null);
    const router = useRouter();

    // Helper: Mask Username (e.g., "Rishan" -> "R****n")
    const maskUsername = (name: string) => {
        if (!name || name.length < 3) return "User";
        const first = name[0];
        const last = name[name.length - 1];
        return `${first}****${last}`;
    };

    useEffect(() => {
        const eventSource = new EventSource("/api/sse/spark");
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (e) => {
            try {
                const payload = JSON.parse(e.data);
                if (payload.type === "event") {
                    const event = payload.data;

                    // Filter: only show earnings or major events
                    const validTypes = ['TASK_APPROVED', 'REFERRAL_VERIFIED', 'WITHDRAWAL_COMPLETED', 'BADGE_EARNED'];
                    if (validTypes.includes(event.type)) {
                        setQueue((prev) => [...prev, event]);
                    }
                }
            } catch (err) {/* Ignore parsing errors */ }
        };

        return () => eventSource.close();
    }, []);

    // Ticker Loop: Process queue every 4 seconds
    useEffect(() => {
        if (queue.length === 0) return;

        if (!currentEvent) {
            const nextEvent = queue[0];
            setCurrentEvent(nextEvent);
            setQueue((prev) => prev.slice(1));
        }

        const timer = setTimeout(() => {
            setCurrentEvent(null); // Clear to trigger exit animation
        }, 4000); // Show each event for 4s

        return () => clearTimeout(timer);
    }, [queue, currentEvent]);

    if (!isVisible || !currentEvent) return null;

    const handleAction = () => {
        // Deep link logic
        if (currentEvent.data?.taskId) {
            router.push(`/member/tasks/${currentEvent.data.taskId}`);
        } else if (currentEvent.type === 'REFERRAL_VERIFIED') {
            router.push('/member/referrals');
        }
        setIsVisible(false); // Close after interacting
    };

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-8 md:left-auto md:right-8 md:w-96">
            <AnimatePresence>
                <motion.div
                    initial={{ y: 50, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0, scale: 0.95 }}
                    className="relative overflow-hidden rounded-xl border border-yellow-500/50 bg-slate-900/90 p-3 shadow-2xl backdrop-blur-md"
                >
                    {/* Progress Bar (Timer) */}
                    <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 4, ease: "linear" }}
                        className="absolute bottom-0 left-0 h-1 bg-yellow-500"
                    />

                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-500">
                            {currentEvent.type === 'TASK_APPROVED' && <Sparkles className="h-5 w-5" />}
                            {currentEvent.type === 'REFERRAL_VERIFIED' && <Trophy className="h-5 w-5" />}
                            {currentEvent.type === 'WITHDRAWAL_COMPLETED' && <ExternalLink className="h-5 w-5" />}
                        </div>

                        <div className="flex-1 cursor-pointer" onClick={handleAction}>
                            <p className="text-xs font-medium text-slate-400">
                                {currentEvent.type === 'TASK_APPROVED' && 'Someone just earned!'}
                                {currentEvent.type === 'REFERRAL_VERIFIED' && 'New Network growth!'}
                                {currentEvent.type === 'WITHDRAWAL_COMPLETED' && 'Payout success!'}
                            </p>
                            <p className="text-sm font-bold text-white">
                                <span className="text-yellow-400">{maskUsername(currentEvent.data?.username || "User")}</span>
                                {' '}
                                {currentEvent.type === 'TASK_APPROVED' && `earned ₹${currentEvent.data?.amount || 50}`}
                                {currentEvent.type === 'REFERRAL_VERIFIED' && `earned bonus from a friend`}
                                {currentEvent.type === 'WITHDRAWAL_COMPLETED' && `withdrew ₹${currentEvent.data?.amount}`}
                            </p>
                        </div>

                        <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:bg-white/10" onClick={() => setIsVisible(false)}>
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
