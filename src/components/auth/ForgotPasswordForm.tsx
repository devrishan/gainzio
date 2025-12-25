"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { GainzioLogo } from "@/components/shared/logo";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Please enter a valid email."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isSuccess, setIsSuccess] = React.useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: ForgotPasswordFormValues) => {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unable to process request." }));
        throw new Error(error.error || "Unable to process request.");
      }

      return await response.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast.success("Email sent!", {
        description: "If an account exists with this email, you'll receive password reset instructions.",
      });
    },
    onError: (error: Error) => {
      toast.error("Request failed", { description: error.message });
      form.setError("root", { message: error.message });
    },
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    mutation.mutate(values);
  };

  const isSubmitting = mutation.isPending;

  // Success state
  if (isSuccess) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <GainzioLogo href="/" />
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Check your email</h1>
            <p className="text-base text-muted-foreground">
              We&apos;ve sent password reset instructions to your email address.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            If an account exists with the email you provided, you&apos;ll receive password reset instructions shortly.
          </p>
          <p className="text-xs text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder or try again.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => {
              setIsSuccess(false);
              form.reset();
            }}
            variant="outline"
            className="w-full"
          >
            Send another email
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Logo and Header */}
      <div className="flex flex-col items-center gap-4 text-center">
        <GainzioLogo href="/" />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Reset your password</h1>
          <p className="text-base text-muted-foreground">
            Enter your email address and we&apos;ll send you instructions to reset your password.
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Server error message */}
          {form.formState.errors.root && (
            <div
              className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
              aria-live="polite"
            >
              {form.formState.errors.root.message}
            </div>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor="forgot-email">Email</FormLabel>
                <FormControl>
                  <Input
                    id="forgot-email"
                    placeholder="john@example.com"
                    type="email"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.error ? "forgot-email-error" : undefined}
                    disabled={isSubmitting}
                    className={cn(
                      fieldState.invalid && "border-destructive focus-visible:ring-destructive"
                    )}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isSubmitting) {
                        e.preventDefault();
                        form.handleSubmit(onSubmit)();
                      }
                    }}
                    {...field}
                  />
                </FormControl>
                <FormMessage id="forgot-email-error" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            disabled={isSubmitting}
            aria-label={isSubmitting ? "Sending reset email..." : "Send reset instructions"}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Sending...
              </>
            ) : (
              "Send reset instructions"
            )}
          </Button>
        </form>
      </Form>

      {/* Footer link */}
      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

