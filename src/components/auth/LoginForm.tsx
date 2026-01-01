"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "next-view-transitions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { GainzioLogo } from "@/components/shared/logo";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { PasswordInput } from "./PasswordInput";

type AuthState = "LOGIN" | "FORGOT_VERIFY" | "RESET_PASSWORD";

// Zod Schemas
const loginSchema = z.object({
  identifier: z.string().min(1, "This field is required"),
  password: z.string().min(1, "Password is required"),
});

const resetSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectUrl = searchParams?.get("redirect") || "/member/dashboard";

  const [authState, setAuthState] = useState<AuthState>("LOGIN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginTab, setLoginTab] = useState("username");

  // Forgot Password State
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [verifyInputs, setVerifyInputs] = useState({ username: "", email: "", phone: "" });

  // --- LOGIN FORM ---
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  async function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    setError("");
    setLoading(true);

    try {
      let connectType = "CONNECTUSERNAME";
      if (loginTab === "email") connectType = "CONNECTEMAIL";
      if (loginTab === "phone") connectType = "CONNECTPHONENUMBER";

      const res = await signIn("credentials", {
        redirect: false,
        connectType,
        identifier: values.identifier,
        password: values.password,
      });

      if (res?.error) {
        setError(res.error === "CredentialsSignin" ? "Invalid login credentials." : res.error);
        toast.error("Login failed", { description: "Please checks your details." });
      } else {
        toast.success("Welcome back!", { description: "Redirecting to dashboard..." });
        router.push(redirectUrl);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // --- FORGOT PASSWORD VERIFY ---
  const filledCount = Object.values(verifyInputs).filter(v => v.trim().length > 0).length;
  const isVerifyReady = filledCount === 2;

  async function onVerifySubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isVerifyReady) return;

    setLoading(true);
    const identifiers = [
      { type: "username", value: verifyInputs.username },
      { type: "email", value: verifyInputs.email },
      { type: "phone", value: verifyInputs.phone }
    ].filter(i => i.value.trim().length > 0);

    try {
      const res = await fetch("/api/auth/forgot-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifiers }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Verification failed");

      setResetUserId(data.userId);
      setAuthState("RESET_PASSWORD");
      toast.success("Identity verified", { description: "Please create a new password." });
    } catch (err: any) {
      setError(err.message || "Could not verify details. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // --- RESET PASSWORD FORM ---
  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  async function onResetSubmit(values: z.infer<typeof resetSchema>) {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: resetUserId, newPassword: values.newPassword }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Reset failed");

      toast.success("Password reset successful", { description: "You can now log in with your new password." });
      setAuthState("LOGIN");
      loginForm.reset();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 text-center">
        <GainzioLogo href="/" />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {authState === "LOGIN" && "Sign in to Gainzio"}
            {authState === "FORGOT_VERIFY" && "Verify Identity"}
            {authState === "RESET_PASSWORD" && "Reset Password"}
          </h1>
          <p className="text-base text-muted-foreground">
            {authState === "LOGIN" && "Track tasks, referrals, and withdrawals in one place."}
            {authState === "FORGOT_VERIFY" && "Fill exactly two fields to continue."}
            {authState === "RESET_PASSWORD" && "Choose a strong password."}
          </p>
        </div>
      </div>

      {/* LOGIN VIEW */}
      {authState === "LOGIN" && (
        <div className="w-full space-y-4">
          <GoogleLoginButton />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Tabs defaultValue="username" onValueChange={setLoginTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="username">Username</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>
          </Tabs>

          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={loginForm.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {loginTab === "username" ? "Username" : loginTab === "email" ? "Email Address" : "Phone Number"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          loginTab === "username" ? "Enter username" :
                            loginTab === "email" ? "name@example.com" :
                              "+91 9876543210"
                        }
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <button
                        type="button"
                        onClick={() => { setAuthState("FORGOT_VERIFY"); setError(""); }}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <FormControl>
                      <PasswordInput placeholder="••••••••" disabled={loading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground pt-2">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      )}

      {/* FORGOT PASSWORD: VERIFY VIEW */}
      {authState === "FORGOT_VERIFY" && (
        <form onSubmit={onVerifySubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {["username", "email", "phone"].map((type) => {
              const key = type as keyof typeof verifyInputs;
              const isFilled = verifyInputs[key].length > 0;
              // Disable if this field is empty AND we already have 2 filled fields
              const isDisabled = !isFilled && filledCount >= 2;

              return (
                <div key={key} className="space-y-1">
                  <Label htmlFor={`v-${key}`} className="capitalize">{type}</Label>
                  <Input
                    id={`v-${key}`}
                    value={verifyInputs[key]}
                    onChange={(e) => setVerifyInputs(prev => ({ ...prev, [key]: e.target.value }))}
                    disabled={loading || isDisabled}
                    placeholder={isDisabled ? "Only 2 details needed" : `Enter your ${type}`}
                    className={isDisabled ? "opacity-50 cursor-not-allowed bg-muted" : ""}
                  />
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-muted-foreground text-center px-4">
            For your safety, we don&apos;t confirm which details are correct.
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setAuthState("LOGIN")}>
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || !isVerifyReady}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify
            </Button>
          </div>
        </form>
      )}

      {/* RESET PASSWORD VIEW */}
      {authState === "RESET_PASSWORD" && (
        <Form {...resetForm}>
          <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={resetForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="New password" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={resetForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Confirm new password" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
