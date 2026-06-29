"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

/**
 * Glassmorphism surface with an entrance animation and hover lift.
 */
export function GlassCard({
  children,
  className,
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      whileHover={hover && !reduce ? { y: -4 } : undefined}
      className={cn("glass rounded-2xl p-6 shadow-elevation-2", className)}
    >
      {children}
    </motion.div>
  );
}
