"use client";

import { useState } from "react";
import { Upload, CheckCircle, X, Sparkles, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
      <Card className="border-green-500/20 bg-green-500/5 glass-morphism p-8 text-center animate-in zoom-in-95 duration-300">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-bounce">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h3 className="mb-2 text-2xl font-bold text-foreground">Withdrawal Requested!</h3>
        <p className="text-muted-foreground max-w-xs mx-auto">
          Your request is being processed. Funds should reflect in your account within 24-48 hours.
        </p>
      </Card>
    );
  }

  return (
    <Card className="glass-morphism border-white/5">
      <CardHeader className="pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <QrCode className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Express Withdrawal</CardTitle>
            <CardDescription>Scan & Pay via UPI QR</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-xs uppercase font-semibold text-muted-foreground">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min={minAmount}
                  max={availableBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Min ${formatCurrency(minAmount)}`}
                  className="bg-muted/20 border-white/10 focus:border-primary/50"
                  required
                />
                <p className="text-xs text-muted-foreground flex justify-between">
                  <span>Available:</span>
                  <span className="text-foreground font-medium">{formatCurrency(availableBalance)}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="upiId" className="text-xs uppercase font-semibold text-muted-foreground">UPI ID</Label>
                <Input
                  id="upiId"
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@upi"
                  className="bg-muted/20 border-white/10 focus:border-primary/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase font-semibold text-muted-foreground">UPI QR Code (Optional)</Label>
              <div className="mt-1">
                {qrImage ? (
                  <div className="relative inline-block w-full">
                    <img src={qrImage} alt="QR Code" className="h-[140px] w-full rounded-xl border border-white/10 object-cover bg-black/20" />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute right-2 top-2 h-7 w-7 rounded-full shadow-lg"
                      onClick={() => setQrImage(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex h-[140px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-muted/5 transition-all hover:bg-muted/10 hover:border-primary/30 group">
                    <div className="p-3 rounded-full bg-muted/10 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <span className="mt-3 text-sm font-medium text-muted-foreground group-hover:text-foreground">Click to upload QR</span>
                    <span className="text-xs text-muted-foreground/50 mt-1">PNG, JPG up to 5MB</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className={cn(
              "w-full h-12 text-base font-medium shadow-lg hover:shadow-primary/20 transition-all",
              parseFloat(amount) >= minAmount && "animate-pulse-glow"
            )}
            disabled={isSubmitting || availableBalance < minAmount}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-spin" /> Processing...
              </span>
            ) : (
              `Withdraw ${amount ? formatCurrency(parseFloat(amount)) : ""}`
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Payments are processed securely via UPI within 24 hours.
        </p>
      </CardContent>
    </Card>
  );
}
