"use client";

import { AlertTriangle, RotateCw } from "lucide-react";

export function PlayerError({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  if (!error) return null;
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/80 text-center">
      <AlertTriangle className="h-10 w-10 text-danger" />
      <p className="max-w-sm text-sm text-foreground/80">{error}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
      >
        <RotateCw className="h-4 w-4" /> Retry
      </button>
    </div>
  );
}
