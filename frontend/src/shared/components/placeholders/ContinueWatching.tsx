"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Spotlight } from "@/shared/components/effects/Spotlight";

interface Tile {
  title: string;
  progress: number; // 0..1
  meta: string;
}

const TILES: Tile[] = [
  { title: "Nebula Drift", progress: 0.62, meta: "S1:E4 · 24m left" },
  { title: "Quiet Streets", progress: 0.18, meta: "1h 12m left" },
  { title: "Atlas Rising", progress: 0.85, meta: "8m left" },
  { title: "Paper Lanterns", progress: 0.4, meta: "42m left" },
  { title: "Deep Field", progress: 0.05, meta: "1h 38m left" },
];

/** Continue-watching row placeholder (no real playback state yet). */
export function ContinueWatching() {
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="font-display text-heading font-semibold">Continue Watching</h2>
        <button className="text-sm text-muted-foreground hover:text-foreground">See all</button>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
        {TILES.map((tile, i) => (
          <motion.div
            key={tile.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: [0.25, 1, 0.5, 1] }}
            whileHover={{ scale: 1.04 }}
            className="shrink-0"
          >
            <Spotlight className="w-56 rounded-xl">
              <div className="group relative aspect-video w-56 overflow-hidden rounded-xl border border-border bg-gradient-to-br from-surface-raised to-surface">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-glow-primary">
                    <Play className="h-5 w-5 fill-current text-primary-foreground" />
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
                  <div className="h-full bg-primary" style={{ width: `${tile.progress * 100}%` }} />
                </div>
              </div>
            </Spotlight>
            <div className="mt-2 px-1">
              <p className="truncate text-sm font-medium">{tile.title}</p>
              <p className="text-xs text-muted">{tile.meta}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
