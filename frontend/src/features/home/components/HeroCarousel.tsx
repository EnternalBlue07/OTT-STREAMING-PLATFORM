"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Info, Play, Plus, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/Button";
import { useMyList } from "@/shared/store/mylist-store";
import { useAccent } from "../accent-context";
import { useTitleActions } from "../title-actions";
import type { TitleCard } from "../types";

const INTERVAL = 7000;

/**
 * Featured hero as an auto-rotating carousel (replaces the pointer-tilt hero).
 * Smooth cross-fade + slow ken-burns drift, auto-advance with pause-on-hover,
 * arrows, and progress dots. Every CTA is wired.
 */
export function HeroCarousel({ items }: { items: TitleCard[] }) {
  const slides = items.slice(0, 6);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const { setAccent } = useAccent();
  const { play } = useTitleActions();
  const router = useRouter();
  const { has, toggle } = useMyList();

  const go = useCallback((n: number) => setI((c) => (n + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (slides[i]) setAccent(slides[i].accent);
  }, [i, slides, setAccent]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setInterval(() => setI((c) => (c + 1) % slides.length), INTERVAL);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  if (!slides.length) return null;
  const s = slides[i];
  const saved = has(s.id);
  const [g0, g1, g2] = s.gradient.length >= 3 ? s.gradient : [s.gradient[0] ?? s.accent, s.accent, "#0A0A0A"];

  return (
    <section
      className="relative -mx-4 -mt-8 mb-16 overflow-hidden md:mx-0 md:rounded-3xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[16/12] w-full sm:aspect-[21/9]">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={s.id}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
            className="absolute inset-0"
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1 }}
              animate={{ scale: 1.08 }}
              transition={{ duration: INTERVAL / 1000 + 1, ease: "linear" }}
              style={{ background: `radial-gradient(120% 120% at 28% 22%, ${g1} 0%, ${g0} 45%, ${g2} 100%)` }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Scrims */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/75 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
              className="max-w-2xl"
            >
              <div className="flex flex-wrap items-center gap-2">
                {s.badges.map((b) => (
                  <span key={b} className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs font-medium text-foreground/85">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.accent }} /> {b}
                  </span>
                ))}
              </div>

              <h1 className="mt-4 font-display text-display-lg font-bold leading-none" style={{ textShadow: "0 8px 40px rgba(0,0,0,0.6)" }}>
                {s.title}
              </h1>
              <p className="mt-3 text-base font-medium text-foreground/90 md:text-lg">{s.tagline}</p>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-foreground/70">
                <span className="inline-flex items-center gap-1 font-semibold" style={{ color: s.accent }}>{s.match}% match</span>
                <span className="inline-flex items-center gap-1 text-foreground">
                  <Star className="h-4 w-4 fill-current" /> {s.rating.toFixed(1)}
                </span>
                <span>{s.year}</span>
                <span className="rounded border border-border px-1.5 py-0.5 text-xs">{s.maturity}</span>
                <span className="text-foreground/50">{s.genres.join(" · ")}</span>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  className="gap-2"
                  style={{ backgroundColor: s.accent, boxShadow: `0 0 40px ${s.accent}66` }}
                  onClick={() => play({ id: s.id, title: s.title, accent: s.accent, gradient: s.gradient })}
                >
                  <Play className="h-5 w-5 fill-current" /> Play
                </Button>
                <Button size="lg" variant="glass" className="gap-2" onClick={() => toggle(s)}>
                  {saved ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  {saved ? "In My List" : "My List"}
                </Button>
                <Button size="lg" variant="ghost" className="gap-2" onClick={() => router.push(`/watch/${s.id}`)}>
                  <Info className="h-5 w-5" /> More Info
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Arrows */}
        {slides.length > 1 && (
          <>
            <button onClick={() => go(i - 1)} aria-label="Previous" className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full glass hover:bg-white/10 md:flex">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button onClick={() => go(i + 1)} aria-label="Next" className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full glass hover:bg-white/10 md:flex">
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Dots */}
        <div className="absolute bottom-5 right-6 flex items-center gap-2">
          {slides.map((sl, idx) => (
            <button
              key={sl.id}
              onClick={() => setI(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: idx === i ? 28 : 8,
                backgroundColor: idx === i ? s.accent : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
