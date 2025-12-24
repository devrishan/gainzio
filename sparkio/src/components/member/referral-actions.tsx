"use client";

import { useState } from "react";
import { Copy, Share2, Send, UserPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReferralActionsProps {
  referralLink: string;
  referralCode: string;
}

export function ReferralActions({ referralLink, referralCode }: ReferralActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShareWhatsApp = () => {
    const message = `🎉 Join me on Earniq and start earning real rewards! Use my referral code: ${referralCode}\n\n${referralLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleResendLink = () => {
    // Simulate resend action
    toast.success("Referral link resent successfully!");
  };

  const handleAddReferral = () => {
    toast.info("Add referral feature coming soon!");
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Button
        onClick={handleCopyLink}
        className={cn(
          "group relative h-11 overflow-hidden transition-all duration-300",
          copied && "animate-sparkle"
        )}
      >
        {copied ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4" />
            Copy Referral Link
          </>
        )}
      </Button>

      <Button onClick={handleShareWhatsApp} variant="outline" className="h-11">
        <Share2 className="mr-2 h-4 w-4" />
        Share on WhatsApp
      </Button>

      <Button onClick={handleResendLink} variant="outline" className="h-11">
        <Send className="mr-2 h-4 w-4" />
        Resend Link
      </Button>

      <Button onClick={handleAddReferral} variant="outline" className="h-11">
        <UserPlus className="mr-2 h-4 w-4" />
        Add New Referral
      </Button>
    </div>
  );
}
