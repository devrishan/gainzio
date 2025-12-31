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

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

type AuthState = "LOGIN" | "FORGOT_VERIFY" | "RESET_PASSWORD";

export function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectUrl = searchParams?.get("redirect") || "/member/dashboard";

  const [authState, setAuthState] = useState<AuthState>("LOGIN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login Form Data
  const [loginTab, setLoginTab] = useState("username");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Forgot Password Data
  const [verifyIds, setVerifyIds] = useState([
    { type: "username", value: "" },
    { type: "email", value: "" } // Default to most common pair, user can switch type ideally but UI simpler to just ask for 2
  ]);
  // Simplified for UX: Just ask for Any 2.
  // We will dynamic form this: 3 inputs (Username, Email, Phone), user must fill 2.
  const [forgotInput, setForgotInput] = useState({
    username: "",
    email: "",
    phone: ""
  });

  // Reset Password Data
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- HANDLERS ---

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let connectType = "CONNECTUSERNAME";
      if (loginTab === "email") connectType = "CONNECTEMAIL";
      if (loginTab === "phone") connectType = "CONNECTPHONENUMBER";

      const res = await signIn("credentials", {
        redirect: false,
        connectType,
        identifier,
        password
      });

      if (res?.error) {
        setError(res.error === "CredentialsSignin" ? "Invalid login credentials" : res.error);
      } else {
        toast.success("Welcome back!");
        router.push(redirectUrl);
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Filter filled inputs
    const filled = [
      { type: "username", value: forgotInput.username },
      { type: "email", value: forgotInput.email },
      { type: "phone", value: forgotInput.phone }
    ].filter(i => i.value.trim().length > 0);

    if (filled.length !== 2) {
      setError("Please provide exactly two details to verify your identity.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifiers: filled })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Verification failed");

      setResetUserId(data.userId);
      setAuthState("RESET_PASSWORD");
      toast.success("Identity verified. Please reset your password.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: resetUserId, newPassword })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Reset failed");

      toast.success("Password updated successfully. Please log in.");
      setAuthState("LOGIN");
      setIdentifier("");
      setPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- RENDER ---

  return (
    <div className="grid gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {authState === "LOGIN" && "Sign in to Gainzio"}
          {authState === "FORGOT_VERIFY" && "Verify Identity"}
          {authState === "RESET_PASSWORD" && "Reset Password"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {authState === "LOGIN" && "Enter your details to access your account"}
          {authState === "FORGOT_VERIFY" && "Enter ANY TWO details linked to your account"}
          {authState === "RESET_PASSWORD" && "Choose a strong password"}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {authState === "LOGIN" && (
        <div className="grid gap-4">
          <Tabs defaultValue="username" onValueChange={setLoginTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="username">Username</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="identifier">
                {loginTab === "username" ? "Username" : loginTab === "email" ? "Email Address" : "Phone Number"}
              </Label>
              <Input
                id="identifier"
                placeholder={
                  loginTab === "username" ? "Enter username" :
                    loginTab === "email" ? "name@example.com" :
                      "+91 9876543210"
                }
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" onClick={() => setAuthState("FORGOT_VERIFY")} className="text-xs text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </div>
      )}

      {authState === "FORGOT_VERIFY" && (
        <form onSubmit={handleVerify} className="grid gap-4">
          <div className="grid gap-3">
            <div className="grid gap-1">
              <Label htmlFor="v-username">Username</Label>
              <Input
                id="v-username"
                value={forgotInput.username}
                onChange={(e) => setForgotInput({ ...forgotInput, username: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="v-email">Email</Label>
              <Input
                id="v-email"
                value={forgotInput.email}
                onChange={(e) => setForgotInput({ ...forgotInput, email: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="v-phone">Phone</Label>
              <Input
                id="v-phone"
                value={forgotInput.phone}
                onChange={(e) => setForgotInput({ ...forgotInput, phone: e.target.value })}
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground">Fill exactly two fields to verify.</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="w-full" onClick={() => setAuthState("LOGIN")}>
              Back
            </Button>
            <Button disabled={loading} className="w-full" type="submit">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify
            </Button>
          </div>
        </form>
      )}

      {authState === "RESET_PASSWORD" && (
        <form onSubmit={handleReset} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button disabled={loading} className="w-full" type="submit">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset Password
          </Button>
        </form>
      )}


    </div>
  );
}
