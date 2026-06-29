"use client";

import { motion } from "framer-motion";
import { useAccent } from "../accent-context";

/**
 * Full-bleed ambient lighting that smoothly adopts the accent color of whatever
 * the user is focusing/hovering — an "ambilight" wash behind the whole page.
 * Fixed + non-interactive so it never blocks input.
 */
export function AmbientBackdrop() {
  const { accent } = useAccent();
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -top-1/3 left-1/2 h-[80vh] w-[80vh] -translate-x-1/2 rounded-full blur-[120px]"
        animate={{ backgroundColor: accent, opacity: 0.18 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 h-[60vh] w-[60vh] rounded-full blur-[140px]"
        animate={{ backgroundColor: accent, opacity: 0.1 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
      {/* Subtle vignette to keep text legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/30 to-background/80" />
    </div>
  );
}
