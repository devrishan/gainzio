"use client";

import { useState } from "react";
import { Upload, CheckCircle, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatCurrency, cn } from "@/lib/utils";

interface WithdrawWithQrProps {
  availableBalance: number;
  minAmount?: number;
}

export function WithdrawWithQr({ availableBalance, minAmount = 100 }: WithdrawWithQrProps) {
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setQrImage(reader.result as string);
        toast.success("QR code uploaded");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum < minAmount) {
      toast.error(`Minimum withdrawal amount is ${formatCurrency(minAmount)}`);
      return;
    }

    if (amountNum > availableBalance) {
      toast.error("Insufficient balance");
      return;
    }

    if (!upiId.trim()) {
      toast.error("Please enter your UPI ID");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      setAmount("");
      setUpiId("");
      setQrImage(null);
    }, 3000);
  };

  if (showSuccess) {
    return (
      <Card className="border-success bg-success/5 p-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20 animate-scale-in">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-foreground">Withdrawal Requested!</h3>
        <p className="text-sm text-muted-foreground">
          Your request is being processed. You&apos;ll receive the amount within 24-48 hours.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Request Withdrawal</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min={minAmount}
            max={availableBalance}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Min ${formatCurrency(minAmount)}`}
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Available: {formatCurrency(availableBalance)}
          </p>
        </div>

        <div>
          <Label htmlFor="upiId">UPI ID</Label>
          <Input
            id="upiId"
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="username@upi"
            required
          />
        </div>

        <div>
          <Label>UPI QR Code (Optional)</Label>
          <div className="mt-2">
            {qrImage ? (
              <div className="relative inline-block">
                <img src={qrImage} alt="QR Code" className="h-32 w-32 rounded-lg border border-border object-cover" />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                  onClick={() => setQrImage(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:bg-muted/50">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="mt-2 text-xs text-muted-foreground">Upload QR</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Max 5MB • JPG, PNG</p>
        </div>

        <Button
          type="submit"
          className={cn(
            "w-full h-11",
            parseFloat(amount) >= minAmount && "animate-pulse-glow"
          )}
          disabled={isSubmitting || availableBalance < minAmount}
        >
          {isSubmitting ? "Processing..." : `Withdraw ${amount ? formatCurrency(parseFloat(amount)) : ""}`}
        </Button>
      </form>

      <p className="mt-4 text-xs text-muted-foreground">
        Withdrawals are processed within 24-48 hours on business days.
      </p>
    </Card>
  );
}
