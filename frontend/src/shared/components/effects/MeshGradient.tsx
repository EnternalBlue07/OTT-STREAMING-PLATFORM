"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/shared/lib/utils";

/**
 * Animated mesh gradient — layered radial gradients that subtly breathe.
 * Honors prefers-reduced-motion by rendering a static gradient.
 */
export function MeshGradient({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  const layers =
    "radial-gradient(40% 50% at 20% 20%, rgba(229,9,20,0.20), transparent 60%)," +
    "radial-gradient(45% 55% at 80% 25%, rgba(86,77,255,0.22), transparent 60%)," +
    "radial-gradient(50% 60% at 50% 90%, rgba(86,77,255,0.12), transparent 60%)";

  return (
    <motion.div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{ backgroundImage: layers, backgroundColor: "#0A0A0A" }}
      animate={reduce ? undefined : { backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
      transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
