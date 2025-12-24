"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { EarniqLogo } from "./EarniqLogo";
import { PasswordInput } from "./PasswordInput";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Please enter a valid email."),
  password: z.string().min(1, "Password is required.").min(8, "Use at least 8 characters."),
  keep_me_signed_in: z.boolean().optional().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("redirect") ?? "/member/dashboard";

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      keep_me_signed_in: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          keep_me_signed_in: values.keep_me_signed_in,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unable to login." }));
        throw new Error(error.error || "Unable to login.");
      }

      return (await response.json()) as { user: { role: "member" | "admin" } };
    },
    onSuccess: ({ user }) => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success("Welcome back!", { description: "You are now signed in." });
      const destination = user.role === "admin" ? "/admin/dashboard" : redirectPath;
      router.replace(destination);
    },
    onError: (error: Error) => {
      toast.error("Login failed", { description: error.message });
      form.setError("root", { message: error.message });
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    mutation.mutate(values);
  };

  const isSubmitting = mutation.isPending;

  return (
    <div className="space-y-8">
      {/* Logo and Header */}
      <div className="flex flex-col items-center gap-4 text-center">
        <EarniqLogo href="/" />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Welcome back to Earniq</h1>
          <p className="text-base text-muted-foreground">
            Sign in to see your dashboard, wallet, and tasks.
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
                <FormLabel htmlFor="login-email">Email</FormLabel>
                <FormControl>
                  <Input
                    id="login-email"
                    placeholder="john@example.com"
                    type="email"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.error ? "login-email-error" : undefined}
                    disabled={isSubmitting}
                    className={cn(
                      fieldState.invalid && "border-destructive focus-visible:ring-destructive"
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage id="login-email-error" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel htmlFor="login-password">Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                    tabIndex={isSubmitting ? -1 : 0}
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput
                    id="login-password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.error ? "login-password-error" : undefined}
                    disabled={isSubmitting}
                    className={cn(
                      fieldState.invalid && "border-destructive focus-visible:ring-destructive"
                    )}
                    {...field}
                    onKeyDown={(e) => {
                      // Allow form submission on Enter key (works on both desktop and mobile)
                      if (e.key === "Enter" && !isSubmitting) {
                        e.preventDefault();
                        form.handleSubmit(onSubmit)();
                      }
                    }}
                  />
                </FormControl>
                <FormMessage id="login-password-error" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="keep_me_signed_in"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                    id="keep_me_signed_in"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel
                    htmlFor="keep_me_signed_in"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Keep me signed in
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Stay logged in for 30 days
                  </p>
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            disabled={isSubmitting}
            aria-label={isSubmitting ? "Signing in..." : "Sign in to your account"}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </Form>

      {/* Footer link */}
      <p className="text-center text-sm text-muted-foreground">
        New to Earniq?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
