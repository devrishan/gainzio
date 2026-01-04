"use client";

import { GainzioLogo } from "@/components/shared/logo";
import { GoogleLoginButton } from "./GoogleLoginButton";

export function LoginForm() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 text-center">
        <GainzioLogo href="/" />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Sign in to Gainzio
          </h1>
          <p className="text-base text-muted-foreground">
            Track tasks, referrals, and withdrawals in one place.
          </p>
        </div>
      </div>

      {/* LOGIN VIEW */}
      <div className="w-full space-y-4">
        <GoogleLoginButton />

        <p className="text-center text-sm text-muted-foreground pt-2">
          We use Google Sign-In for secure access. <br className="hidden sm:block" /> No passwords required.
        </p>
      </div>
    </div>
  );
}
