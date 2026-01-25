"use client";

import { GainzioLogo } from "@/components/shared/logo";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock } from "lucide-react";

import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  return (
    <div className="space-y-8">
      {error && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-4 duration-500 bg-red-500/10 border-red-500/20 text-red-500">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            {error === "OAuthAccountNotLinked"
              ? "This email is already associated with another account. Please sign in with your original method."
              : "An error occurred during authentication. Please try again."}
          </AlertDescription>
        </Alert>
      )}
      {/* Header */}
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <GainzioLogo href="/" size="lg" className="relative z-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Restricted Area</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white uppercase font-sans">
            Authentication Required
          </h1>
          <p className="text-xs text-zinc-400 font-mono tracking-wide">
            Biometric verification active. Credentials required for access.
          </p>
        </div>
      </div>

      {/* LOGIN VIEW */}
      <div className="w-full space-y-6">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-purple-600/50 rounded-lg blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
          <div className="relative">
            <GoogleLoginButton />
          </div>
        </div>

        <div className="flex items-center gap-3 opacity-50">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Secure Handshake</p>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        <p className="text-center text-[10px] text-zinc-600 font-mono">
          System Access Level: RESTRICTED <br />
          By authenticating, you agree to surveillance monitoring.
        </p>
      </div>
    </div>
  );
}
