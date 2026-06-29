"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground/80">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={cn(
            "h-11 w-full rounded-xl border border-border bg-surface/60 px-4 text-sm text-foreground",
            "placeholder:text-muted transition-colors duration-150",
            "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
            error && "border-danger focus-visible:ring-danger/40",
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    );
  },
);
Input.displayName = "Input";
