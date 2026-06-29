"use client";

import { motion } from "framer-motion";
import type { Mood } from "../types";

/**
 * Mood-based discovery dock. Picking a mood re-curates a live rail — the
 * Phase-1, rule-based seed of the "AI discovery" experience.
 */
export function MoodDock({
  moods,
  active,
  onPick,
}: {
  moods: Mood[];
  active: string | null;
  onPick: (id: string | null) => void;
}) {
  return (
    <section className="mb-10">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-display text-heading font-semibold">What&apos;s the vibe?</h2>
        <span className="text-xs text-foreground/40">tap a mood</span>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {moods.map((m) => {
          const on = active === m.id;
          return (
            <motion.button
              key={m.id}
              onClick={() => onPick(on ? null : m.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                on
                  ? "border-transparent bg-secondary text-secondary-foreground shadow-glow-secondary"
                  : "border-border glass text-foreground/80 hover:text-foreground"
              }`}
            >
              <span className="text-base">{m.emoji}</span>
              {m.label}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
