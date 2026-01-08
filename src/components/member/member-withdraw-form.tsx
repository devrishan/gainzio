"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Wallet, Sparkles, IndianRupee } from "lucide-react";

const schema = z.object({
  amount: z
    .string()
    .min(1)
    .transform((value) => parseFloat(value))
    .refine((value) => value > 0, "Enter a positive amount."),
  upi_id: z.string().min(5, "Enter a valid UPI ID."),
});

type WithdrawFormValues = z.infer<typeof schema>;

interface MemberWithdrawFormProps {
  balance: number;
}

export function MemberWithdrawForm({ balance }: MemberWithdrawFormProps) {
  const router = useRouter();

  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: "" as any,
      upi_id: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: WithdrawFormValues) => {
      const response = await fetch("/api/member/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json().catch(() => ({ success: false, error: "Unable to submit." }));

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to submit withdrawal.");
      }

      return result;
    },
    onSuccess: () => {
      toast.success("Withdrawal requested", {
        description: "We will process your UPI payout shortly.",
      });
      form.reset();
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error("Withdrawal failed", { description: error.message });
    },
  });

  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000" />
      <Card className="relative glass-morphism border-white/5 shadow-xl">
        <CardHeader className="pb-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Wallet className="h-5 w-5 text-primary" />
                Withdraw Funds
              </CardTitle>
              <CardDescription className="mt-1">Transfer earnings to your bank via UPI</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Balance</p>
              <p className="text-xl font-bold text-primary">{balance.toFixed(0)} Pts</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Amount (Points)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          step="1"
                          min={1}
                          max={balance}
                          placeholder="Enter points to withdraw..."
                          className="pl-9 bg-muted/20 border-white/10 focus:border-primary/50 transition-colors h-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="upi_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">UPI ID</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Sparkles className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="username@upi"
                          className="pl-9 bg-muted/20 border-white/10 focus:border-primary/50 transition-colors h-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Processing Request..." : "Request Withdrawal"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
