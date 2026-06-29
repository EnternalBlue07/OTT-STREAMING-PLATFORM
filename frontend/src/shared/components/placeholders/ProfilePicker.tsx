"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

const PROFILES = [
  { name: "Zumaan", color: "from-primary to-secondary" },
  { name: "Guest", color: "from-secondary to-primary" },
  { name: "Kids", color: "from-warning to-primary" },
];

/** "Who's watching?" profile picker placeholder (Family tier preview). */
export function ProfilePicker() {
  return (
    <section className="mb-12">
      <h2 className="mb-6 text-center font-display text-heading font-semibold">Who&apos;s watching?</h2>
      <div className="flex flex-wrap items-start justify-center gap-6">
        {PROFILES.map((p, i) => (
          <motion.button
            key={p.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            whileHover={{ scale: 1.06 }}
            className="group flex flex-col items-center gap-3"
          >
            <span
              className={`flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br ${p.color} text-2xl font-bold text-white shadow-elevation-3 ring-2 ring-transparent transition-all group-hover:ring-white/60`}
            >
              {p.name.charAt(0)}
            </span>
            <span className="text-sm text-foreground/70 group-hover:text-foreground">{p.name}</span>
          </motion.button>
        ))}
        <button className="group flex flex-col items-center gap-3">
          <span className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-border text-muted transition-colors group-hover:border-foreground/40 group-hover:text-foreground">
            <Plus className="h-8 w-8" />
          </span>
          <span className="text-sm text-muted">Add Profile</span>
        </button>
      </div>
    </section>
  );
}
