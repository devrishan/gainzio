"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PasswordStrength } from "./PasswordStrength";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { GainzioLogo } from "@/components/shared/logo";
import { PasswordInput } from "./PasswordInput";

const registerSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required.")
    .min(3, "Choose a username with at least 3 characters.")
    .trim()
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  email: z.string().min(1, "Email is required.").email("Please enter a valid email."),
  password: z.string().min(1, "Password is required.").min(8, "Use at least 8 characters."),
  referral_code: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val && val.length > 0 ? val.toUpperCase() : undefined)),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [passwordStrength, setPasswordStrength] = React.useState<PasswordStrength>("none");
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      referral_code: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          referral_code: values.referral_code || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unable to register." }));
        throw new Error(error.error || "Unable to register.");
      }

      return (await response.json()) as { user: { role: "member" | "admin" } };
    },
    onSuccess: ({ user }) => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      setIsRedirecting(true);
      toast.success("Account created", { description: "Welcome to Gainzio!" });

      // Small delay to show the loading state, then redirect to dashboard
      setTimeout(() => {
        router.push("/member/dashboard");
      }, 500);
    },
    onError: (error: Error) => {
      toast.error("Registration failed", { description: error.message });
      form.setError("root", { message: error.message });
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    mutation.mutate(values);
  };

  const isSubmitting = mutation.isPending || isRedirecting;
  const passwordValue = form.watch("password");

  // Show loading state during redirect
  if (isRedirecting) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <GainzioLogo href="/" />
          <div className="space-y-4">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" aria-hidden="true" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Creating your dashboard...
              </h2>
              <p className="text-sm text-muted-foreground">
                We're setting everything up for you.
              </p>
            </div>
          </div>
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
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Create your Gainzio account</h1>
          <p className="text-base text-muted-foreground">
            Track tasks, referrals, and withdrawals in one place.
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
            name="username"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor="register-username">Username</FormLabel>
                <FormControl>
                  <Input
                    id="register-username"
                    placeholder="john_doe"
                    autoComplete="username"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.error ? "register-username-error" : undefined}
                    disabled={isSubmitting}
                    className={cn(
                      fieldState.invalid && "border-destructive focus-visible:ring-destructive"
                    )}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage id="register-username-error" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor="register-email">Email</FormLabel>
                <FormControl>
                  <Input
                    id="register-email"
                    placeholder="john@example.com"
                    type="email"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.error ? "register-email-error" : undefined}
                    disabled={isSubmitting}
                    className={cn(
                      fieldState.invalid && "border-destructive focus-visible:ring-destructive"
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage id="register-email-error" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor="register-password">Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    id="register-password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.error
                        ? "register-password-error"
                        : passwordValue
                          ? "register-password-hint"
                          : undefined
                    }
                    disabled={isSubmitting}
                    showStrengthIndicator={true}
                    onStrengthChange={setPasswordStrength}
                    className={cn(
                      fieldState.invalid && "border-destructive focus-visible:ring-destructive"
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage id="register-password-error" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="referral_code"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor="register-referral-code">
                  Referral Code <span className="font-normal text-muted-foreground">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="register-referral-code"
                    placeholder="SPARK123"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.error ? "register-referral-error" : "register-referral-hint"}
                    disabled={isSubmitting}
                    className={cn(
                      fieldState.invalid && "border-destructive focus-visible:ring-destructive"
                    )}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().trim();
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <p id="register-referral-hint" className="text-xs text-muted-foreground">
                  If someone invited you, add their code so they earn too.
                </p>
                <FormMessage id="register-referral-error" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            disabled={isSubmitting}
            aria-label={isSubmitting ? "Creating account..." : "Create your account"}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>

          {/* Terms and Privacy */}
          <p className="text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link
              href="/terms"
              className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      </Form>

      {/* Footer link */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
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
