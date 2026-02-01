"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, IndianRupee, Landmark, Wallet } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const withdrawalSchema = z.object({
    amount: z.coerce
        .number()
        .min(100, "Minimum withdrawal is ₹100")
        .max(100000, "Maximum withdrawal is ₹1,00,000"),
    paymentMethod: z.enum(["UPI", "BANK"], {
        required_error: "Please select a payment method",
    }),
    upiId: z.string().optional(),
    accountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
}).refine((data) => {
    if (data.paymentMethod === "UPI" && !data.upiId) {
        return false;
    }
    if (data.paymentMethod === "BANK" && (!data.accountNumber || !data.ifscCode)) {
        return false;
    }
    return true;
}, {
    message: "Please fill in the required payment details",
    path: ["paymentMethod"],
});

interface WithdrawalRequestDialogProps {
    currentBalance: number;
    trigger?: React.ReactNode;
}

export function WithdrawalRequestDialog({ currentBalance, trigger }: WithdrawalRequestDialogProps) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof withdrawalSchema>>({
        resolver: zodResolver(withdrawalSchema),
        defaultValues: {
            amount: 0,
            paymentMethod: "UPI",
            upiId: "",
            accountNumber: "",
            ifscCode: "",
        },
    });

    const { mutate, isPending } = useMutation({
        mutationFn: async (values: z.infer<typeof withdrawalSchema>) => {
            const response = await fetch("/api/member/withdrawals/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to submit request");
            }
            return response.json();
        },
        onSuccess: (data) => {
            toast.success("Withdrawal Requested", {
                description: `₹${data.withdrawal.amount} request submitted successfully.`,
            });
            setOpen(false);
            form.reset();
            // Invalidate wallet queries to refresh balance
            queryClient.invalidateQueries({ queryKey: ["wallet"] });
        },
        onError: (error) => {
            toast.error("Request Failed", {
                description: error.message,
            });
        },
    });

    const onSubmit = (values: z.infer<typeof withdrawalSchema>) => {
        if (values.amount > currentBalance) {
            form.setError("amount", {
                type: "manual",
                message: "Insufficient withdrawable balance",
            });
            return;
        }
        mutate(values);
    };

    const paymentMethod = form.watch("paymentMethod");

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="default"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all duration-300"
                    >
                        Request Withdrawal
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-black/80 backdrop-blur-xl border-primary/20 text-white shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-primary">
                        <Wallet className="w-5 h-5" />
                        Withdraw Funds
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Current Withdrawable Balance: <span className="text-white font-mono font-bold">₹{currentBalance.toFixed(2)}</span>
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Amount (INR)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-2.5 h-5 w-5 text-primary" />
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 text-xl font-mono text-white placeholder:text-zinc-700 h-12"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Payment Method</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="grid grid-cols-2 gap-4"
                                        >
                                            <Label
                                                htmlFor="upi"
                                                className={cn(
                                                    "flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                                                    field.value === "UPI" ? "border-primary bg-primary/10" : "border-white/5 bg-white/5"
                                                )}
                                            >
                                                <RadioGroupItem value="UPI" id="upi" className="sr-only" />
                                                <span className="text-2xl mb-2">📱</span>
                                                <span className="font-bold">UPI</span>
                                            </Label>
                                            <Label
                                                htmlFor="bank"
                                                className={cn(
                                                    "flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                                                    field.value === "BANK" ? "border-primary bg-primary/10" : "border-white/5 bg-white/5"
                                                )}
                                            >
                                                <RadioGroupItem value="BANK" id="bank" className="sr-only" />
                                                <Landmark className="w-8 h-8 mb-2 text-zinc-400" />
                                                <span className="font-bold">Bank Transfer</span>
                                            </Label>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {paymentMethod === "UPI" && (
                            <FormField
                                control={form.control}
                                name="upiId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-zinc-400">UPI ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="username@upi" className="bg-white/5 border-white/10" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />
                        )}

                        {paymentMethod === "BANK" && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <FormField
                                    control={form.control}
                                    name="accountNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-zinc-400">Account Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="XXXXXXXXXXXX" className="bg-white/5 border-white/10" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-red-400" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="ifscCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-zinc-400">IFSC Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ABCD0123456" className="bg-white/5 border-white/10" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-red-400" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all duration-300"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Confirm Withdrawal"
                            )}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
