import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-12 sm:px-6 lg:px-8 font-mono selection:bg-primary/30">
      {/* Scanning Grid Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-transparent to-black" />

        {/* Scanning Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/50 shadow-[0_0_20px_#3b82f6] animate-[scan_4s_ease-in-out_infinite]" />

        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[150px] mix-blend-screen opacity-30 animate-pulse" />
        <div className="absolute bottom-0 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[150px] mix-blend-screen opacity-30" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* "Terminal" Container */}
        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-black/60 backdrop-blur-xl shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)]">
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary/50 rounded-tl-sm" />
          <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-primary/50 rounded-tr-sm" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-primary/50 rounded-bl-sm" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary/50 rounded-br-sm" />

          <div className="p-8 sm:p-12">
            <Suspense fallback={<div className="text-primary/50 animate-pulse">Initializing Security Protocols...</div>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-zinc-600 uppercase tracking-[0.3em]">Secure Connection Established</p>
          <p className="text-[10px] text-zinc-700 font-mono mt-1">ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}
