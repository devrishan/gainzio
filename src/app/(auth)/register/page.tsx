import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
    title: "Create Account - Gainzio",
    description: "Join Gainzio to start earning rewards through tasks and referrals.",
};

export default function RegisterPage() {
    return (
        <div className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-black text-white overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[140px] mix-blend-screen opacity-40 animate-pulse" />
                <div className="absolute -bottom-24 -right-24 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[140px] mix-blend-screen opacity-40" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
            </div>

            {/* LEFT SIDE – BRAND / VALUE */}
            <div className="hidden lg:flex flex-col justify-center px-16 relative z-10 border-r border-white/5">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                    Start your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                        earning journey
                    </span>
                </h1>

                <p className="text-zinc-400 text-lg mb-8 max-w-md leading-relaxed">
                    Join thousands of members earning real rewards. Complete simple tasks, refer friends, and get paid instantly via UPI.
                </p>

                <ul className="space-y-4 text-zinc-300">
                    <li className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                            <span className="text-xs font-bold">✓</span>
                        </div>
                        ₹50 Sign-up Bonus
                    </li>
                    <li className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                            <span className="text-xs font-bold">✓</span>
                        </div>
                        10% Referral Commission
                    </li>
                    <li className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                            <span className="text-xs font-bold">✓</span>
                        </div>
                        24/7 Withdrawal Support
                    </li>
                </ul>
            </div>

            {/* RIGHT SIDE – FORM */}
            <div className="flex items-center justify-center px-6 py-12 relative z-10">
                <div className="w-full max-w-md bg-zinc-950/40 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl ring-1 ring-white/5">
                    <RegisterForm />
                </div>
            </div>
        </div>
    );
}

