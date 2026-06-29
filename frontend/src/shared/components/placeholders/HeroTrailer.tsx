"use client";

import { motion } from "framer-motion";
import { Info, Play, Plus } from "lucide-react";
import { Aurora } from "@/shared/components/effects/Aurora";
import { Button } from "@/shared/components/ui/Button";

/**
 * Hero trailer placeholder — cinematic banner with gradient overlay and CTAs.
 * No real video; establishes layout, motion, and visual rhythm.
 */
export function HeroTrailer() {
  return (
    <section className="relative -mx-4 -mt-8 mb-12 overflow-hidden rounded-none md:mx-0 md:mt-0 md:rounded-3xl">
      <div className="relative aspect-[16/10] w-full sm:aspect-[21/9]">
        <Aurora />
        {/* Simulated trailer surface */}
        <div className="absolute inset-0 bg-gradient-to-tr from-surface via-background to-surface" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="max-w-xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-medium text-foreground/80">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Featured Original
            </span>
            <h1 className="mt-4 font-display text-display font-bold leading-none text-gradient">
              The Signal Horizon
            </h1>
            <p className="mt-3 max-w-md text-sm text-foreground/70 md:text-base">
              A placeholder hero. In later phases this surface autoplays an adaptive-bitrate
              trailer with a cinematic gradient and muted-until-hover audio.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button size="lg" className="gap-2">
                <Play className="h-5 w-5 fill-current" /> Play
              </Button>
              <Button size="lg" variant="glass" className="gap-2">
                <Plus className="h-5 w-5" /> My List
              </Button>
              <Button size="lg" variant="ghost" className="gap-2">
                <Info className="h-5 w-5" /> More Info
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
