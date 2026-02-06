import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense } from "react";
import { ShieldAlert, Terminal } from "lucide-react";

export default function AdminLoginPage() {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-12 sm:px-6 lg:px-8 font-mono selection:bg-emerald-500/30">

            {/* Admin Specific Background - Green/Matrix Theme */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98112_1px,transparent_1px),linear-gradient(to_bottom,#10b98112_1px,transparent_1px)] bg-[size:32px_32px]" />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-transparent to-black" />

                {/* Scanning Line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500/50 shadow-[0_0_20px_#10b981] animate-[scan_5s_ease-in-out_infinite]" />

                {/* Glow Effects */}
                <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-900/20 blur-[150px] mix-blend-screen opacity-30 animate-pulse" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="mb-6 text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-950/30">
                        <ShieldAlert className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Admin Access Only</span>
                    </div>
                </div>

                {/* "Terminal" Container */}
                <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-black/80 backdrop-blur-xl shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]">
                    {/* Corner Accents */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-emerald-500/50 rounded-tl-sm" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-emerald-500/50 rounded-tr-sm" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-emerald-500/50 rounded-bl-sm" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-emerald-500/50 rounded-br-sm" />

                    <div className="p-8 sm:p-12">
                        <div className="flex items-center justify-center gap-3 mb-8 pb-6 border-b border-white/5">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Terminal className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-lg font-bold text-white leading-none">Gainzio</h2>
                                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Command Center</p>
                            </div>
                        </div>

                        <Suspense fallback={<div className="text-emerald-500/50 animate-pulse text-xs text-center">Initializing Admin Protocols...</div>}>
                            <LoginForm />
                        </Suspense>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-[0.3em]">Authorized Personnel Only</p>
                    <p className="text-[10px] text-zinc-700 font-mono mt-1">IP: {Math.random().toString(16).substring(2, 6).toUpperCase()}:... :: SECURE_V3</p>
                </div>
            </div>
        </div>
    );
}
