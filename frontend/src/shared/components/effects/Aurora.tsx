"use client";

import { cn } from "@/shared/lib/utils";

/**
 * Aurora background — soft, slowly drifting color clouds behind content.
 * Pure CSS (blur + keyframes); GPU-friendly (transform/opacity only).
 */
export function Aurora({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="absolute -top-1/3 left-1/4 h-[60vh] w-[60vh] animate-aurora rounded-full bg-primary/25 blur-[120px]" />
      <div
        className="absolute top-1/4 -right-1/4 h-[55vh] w-[55vh] animate-aurora rounded-full bg-secondary/25 blur-[130px]"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[50vh] w-[50vh] animate-aurora rounded-full bg-secondary/15 blur-[140px]"
        style={{ animationDelay: "-12s" }}
      />
    </div>
  );
}
