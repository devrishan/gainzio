"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getPasswordStrength, PasswordStrengthIndicator, type PasswordStrength } from "./PasswordStrength";

export interface PasswordInputProps extends Omit<React.ComponentProps<typeof Input>, "type"> {
  showPasswordToggle?: boolean;
  showStrengthIndicator?: boolean;
  onStrengthChange?: (strength: PasswordStrength) => void;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showPasswordToggle = true, showStrengthIndicator = false, onStrengthChange, value, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const passwordValue = typeof value === "string" ? value : "";
    const strength = React.useMemo(() => getPasswordStrength(passwordValue), [passwordValue]);

    React.useEffect(() => {
      if (onStrengthChange) {
        onStrengthChange(strength);
      }
    }, [strength, onStrengthChange]);

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            className={cn("pr-10", className)}
            ref={ref}
            value={value}
            {...props}
          />
          {showPasswordToggle && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full rounded-l-none border-l-0 hover:bg-transparent focus:z-10"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
              disabled={props.disabled}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              )}
            </Button>
          )}
        </div>
        {showStrengthIndicator && <PasswordStrengthIndicator strength={strength} password={passwordValue} />}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
