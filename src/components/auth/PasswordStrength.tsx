"use client";

import { cn } from "@/lib/utils";

export type PasswordStrength = "weak" | "okay" | "strong" | "none";

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return "none";
  
  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const varietyScore = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  
  if (length < 8) return "weak";
  if (length >= 12 && varietyScore >= 3) return "strong";
  if (length >= 8 && varietyScore >= 2) return "okay";
  return "weak";
}

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  password: string;
}

export function PasswordStrengthIndicator({ strength, password }: PasswordStrengthIndicatorProps) {
  if (!password || strength === "none") return null;

  const strengthConfig = {
    weak: { label: "Weak", color: "text-destructive", bgColor: "bg-destructive" },
    okay: { label: "Okay", color: "text-yellow-500", bgColor: "bg-yellow-500" },
    strong: { label: "Strong", color: "text-emerald-500", bgColor: "bg-emerald-500" },
  };

  const config = strengthConfig[strength];
  const widthPercentage = strength === "weak" ? "33%" : strength === "okay" ? "66%" : "100%";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className={cn("font-medium", config.color)}>{config.label}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full transition-all duration-300", config.bgColor)}
          style={{ width: widthPercentage }}
          role="progressbar"
          aria-valuenow={strength === "weak" ? 33 : strength === "okay" ? 66 : 100}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Password strength: ${config.label}`}
        />
      </div>
    </div>
  );
}

