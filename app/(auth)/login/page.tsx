"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email) return;
    setLoading(true);
    await signIn("email", {
      email,
      callbackUrl: "/dashboard",
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-black text-white">

      {/* LEFT SIDE – BRAND / VALUE */}
      <div className="hidden lg:flex flex-col justify-center px-16 bg-gradient-to-br from-black via-zinc-900 to-black">
        <h1 className="text-4xl font-bold mb-6">
          Join thousands earning with Gainzio
        </h1>

        <p className="text-zinc-400 mb-8 max-w-md">
          Track tasks, referrals, and withdrawals in one transparent dashboard
          with instant UPI cash-outs.
        </p>

        <ul className="space-y-3 text-sm text-zinc-300">
          <li>✓ Instant UPI payouts</li>
          <li>✓ Live wallet tracking</li>
          <li>✓ Secure, passwordless access</li>
        </ul>
      </div>

      {/* RIGHT SIDE – AUTH CARD */}
      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 backdrop-blur">

          <h2 className="text-2xl font-semibold mb-2">
            Sign in to Gainzio
          </h2>

          <p className="text-sm text-zinc-400 mb-6">
            Free login · No OTP · No SMS charges
          </p>

          {/* GOOGLE LOGIN */}
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full mb-4 flex items-center justify-center gap-3 rounded-lg bg-white text-black py-3 font-medium hover:bg-zinc-200 transition"
          >
            Continue with Google
          </button>

          {/* DIVIDER */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-zinc-700" />
            <span className="px-3 text-xs text-zinc-500">OR</span>
            <div className="flex-1 h-px bg-zinc-700" />
          </div>

          {/* EMAIL MAGIC LINK */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEmailLogin();
            }}
            className="space-y-3"
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-black border border-zinc-700 px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors"
              required
            />

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full rounded-lg bg-zinc-800 py-3 text-sm font-medium hover:bg-zinc-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending link..." : "Send secure login link"}
            </button>
          </form>

          {/* FOOTER TRUST */}
          <p className="text-xs text-zinc-500 mt-6 text-center">
            We never send OTPs or SMS. Your account is protected with
            industry-standard security.
          </p>
        </div>
      </div>
    </div>
  );
}
