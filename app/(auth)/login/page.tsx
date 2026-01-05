import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] mix-blend-screen opacity-50 animate-pulse" />
        <div className="absolute bottom-0 left-1/4 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[120px] mix-blend-screen opacity-50" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02]" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
