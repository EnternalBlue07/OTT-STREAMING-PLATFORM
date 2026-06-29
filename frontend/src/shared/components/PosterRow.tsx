"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { PosterCard, type PosterCardItem } from "./PosterCard";

/**
 * Shared momentum row of PosterCards (snap scroll, edge fades, hover controls).
 * Mirrors the Phase-1 home row interaction without importing home internals.
 */
export function PosterRow({ title, items }: { title: string; items: PosterCardItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function nudge(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: "smooth" });
  }

  if (!items.length) return null;

  return (
    <section className="group/row relative mb-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-heading font-semibold">{title}</h2>
        <span className="text-xs text-foreground/40">{items.length} titles</span>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent" />

        <button
          aria-label="Scroll left"
          onClick={() => nudge(-1)}
          className="absolute left-1 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full glass text-foreground opacity-0 transition-opacity group-hover/row:opacity-100 md:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          aria-label="Scroll right"
          onClick={() => nudge(1)}
          className="absolute right-1 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full glass text-foreground opacity-0 transition-opacity group-hover/row:opacity-100 md:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div ref={trackRef} className="scrollbar-none flex gap-3 overflow-x-auto scroll-smooth py-2" style={{ scrollSnapType: "x proximity" }}>
          {items.map((item, i) => (
            <div key={item.id} style={{ scrollSnapAlign: "start" }}>
              <PosterCard item={item} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
