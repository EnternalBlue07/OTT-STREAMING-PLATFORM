"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { RatingBreakdown as RB } from "../types";

/** Average rating + 1–5 star distribution bar chart. */
export function RatingBreakdown({ breakdown, accent }: { breakdown: RB; accent: string }) {
  const total = breakdown.total || 0;
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border glass p-5 sm:flex-row sm:items-center">
      <div className="flex flex-col items-center sm:w-40">
        <span className="font-display text-5xl font-bold">{breakdown.average.toFixed(1)}</span>
        <span className="mt-1 inline-flex items-center gap-1 text-sm text-foreground/60">
          <Star className="h-4 w-4 fill-current" style={{ color: accent }} /> {total} reviews
        </span>
      </div>
      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = breakdown.counts[String(star)] ?? 0;
          const pct = total ? Math.round((count / total) * 100) : 0;
          return (
            <div key={star} className="flex items-center gap-3">
              <span className="w-6 text-right text-xs text-foreground/60">{star}★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: accent }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              <span className="w-10 text-right text-xs tabular-nums text-foreground/50">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
