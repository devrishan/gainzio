import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
    title: "Create Account - Gainzio",
    description: "Join Gainzio to start earning rewards through tasks and referrals.",
};

export default function RegisterPage() {
    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-black text-white">
            {/* LEFT SIDE – BRAND / VALUE */}
            <div className="hidden lg:flex flex-col justify-center px-16 bg-gradient-to-br from-black via-zinc-900 to-black">
                <h1 className="text-4xl font-bold mb-6">
                    Start your earning journey
                </h1>

                <p className="text-zinc-400 mb-8 max-w-md">
                    Join thousands of members earning real rewards. Complete simple tasks, refer friends, and get paid instantly via UPI.
                </p>

                <ul className="space-y-3 text-sm text-zinc-300">
                    <li>✓ ₹50 Sign-up Bonus</li>
                    <li>✓ 10% Referral Commission</li>
                    <li>✓ 24/7 Withdrawal Support</li>
                </ul>
            </div>

            {/* RIGHT SIDE – FORM */}
            <div className="flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 backdrop-blur">
                    <RegisterForm />
                </div>
            </div>
        </div>
    );
}
