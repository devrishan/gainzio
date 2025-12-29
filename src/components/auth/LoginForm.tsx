"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { GoogleLoginButton } from "./GoogleLoginButton";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const redirectUrl = searchParams?.get("redirect") || "/member/dashboard";

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsEmailLoading(true);
    try {
      const result = await signIn("email", {
        email,
        callbackUrl: redirectUrl,
        redirect: false
      });

      if (result?.error) {
        toast.error("Failed to send login link. Please try again.");
      } else {
        toast.success("Login link sent! Check your email.");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsEmailLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to Continue</h1>
        <p className="text-sm text-muted-foreground">Welcome back to Gainzio</p>
      </div>

      <div className="grid gap-4">
        {/* Primary CTA: Google */}
        <GoogleLoginButton />

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/80">
          <span className="flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
          No OTP required • Secure, passwordless login
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              or
            </span>
          </div>
        </div>

        {/* Secondary: Email Magic Link */}
        <form onSubmit={handleEmailLogin} className="grid gap-3">
          <div className="grid gap-2">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isEmailLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
            />
          </div>

          <Button disabled={isEmailLoading} className="h-11">
            {isEmailLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Continue with Email
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            We’ll send you a secure login link
          </p>
        </form>
      </div>

      <Separator />

      <div className="space-y-4 text-center">
        <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground leading-relaxed">
          <p className="font-medium text-foreground mb-1">We never send OTPs or charge you for login.</p>
          Your account is protected using industry-standard security.
        </div>

        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
          Phone number login will be available later
        </p>
      </div>
    </div>
  );
}
