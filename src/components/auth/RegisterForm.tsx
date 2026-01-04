"use client";

import React from "react";
import Link from "next/link";
import { GainzioLogo } from "@/components/shared/logo";
import { GoogleLoginButton } from "./GoogleLoginButton";

export function RegisterForm() {
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

      {/* Google Login */}
      <div className="w-full space-y-4">
        <GoogleLoginButton />

        <p className="text-center text-sm text-muted-foreground pt-2">
          We use Google Sign-In for secure access. <br className="hidden sm:block" /> No passwords required.
        </p>
      </div>

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
