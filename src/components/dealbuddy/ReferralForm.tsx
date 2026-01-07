"use client";

import { Copy, Share2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { maskPhoneNumber, maskUserId } from "@/utils/maskPhone";
import { useState } from "react";
import { toast } from "sonner";

interface Referral {
    id: string;
    userId: string;
    phone: string;
    date: string;
    status: "active" | "pending";
}

interface ReferralFormProps {
    referralCode: string;
    referrals?: Referral[];
}

export const ReferralForm = ({ referralCode, referrals = [] }: ReferralFormProps) => {
    const [copied, setCopied] = useState(false);

    const shareMessage = `Join DealBuddy! Use my code ${referralCode} and win rewards.`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        toast.success("Referral code copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Join DealBuddy",
                text: shareMessage,
                url: window.location.href,
            }).catch(console.error);
        } else {
            // Fallback for desktop or non-supported browsers, maybe open whatsapp
            window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
        }
    };

    return (
        <div className="space-y-6">
            <Card className="bg-[#111111] border-none p-6 rounded-xl space-y-4">
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-white">Refer & Earn</h3>
                    <p className="text-[#AAAAAA] text-sm">
                        Share your unique code with friends and earn rewards when they join!
                    </p>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-[#00F260] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <Input
                            value={referralCode}
                            readOnly
                            className="bg-[#1A1A1A] border-white/10 text-white font-mono text-center tracking-wider h-12 focus-visible:ring-[#00F260]"
                        />
                    </div>
                    <Button
                        onClick={handleCopy}
                        variant="outline"
                        className="h-12 w-12 p-0 border-white/10 bg-[#1A1A1A] hover:bg-[#222] hover:text-[#00F260]"
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>

                <Button
                    onClick={handleShare}
                    className="w-full h-12 bg-white text-black hover:bg-white/90 font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Share2 className="mr-2 h-4 w-4" />
                    Refer & Earn
                </Button>
            </Card>

            {/* Referrals List demonstrating masking */}
            {referrals.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-[#AAAAAA] uppercase tracking-wider">Your Referrals</h4>
                    <div className="space-y-2">
                        {referrals.map((ref) => (
                            <Card key={ref.id} className="bg-[#111111] border border-white/5 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-[#1A1A1A] flex items-center justify-center border border-white/5">
                                        <User className="h-5 w-5 text-[#AAAAAA]" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">{maskUserId(ref.userId)}</p>
                                        <p className="text-[#AAAAAA] text-xs">{maskPhoneNumber(ref.phone)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[#0575E6] text-xs font-medium bg-[#0575E6]/10 px-2 py-1 rounded">
                                        {ref.status === 'active' ? 'Active' : 'Pending'}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
