"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Playing = { id: string; title: string; accent: string; gradient: string[] };

/**
 * Cinematic player overlay. There's no encoded video yet (that's the media
 * pipeline phase), so this simulates adaptive playback: a ticking timeline,
 * working play/pause + mute + scrub, and the title's signature gradient as the
 * "frame". It establishes the real player UX ahead of HLS.js integration.
 */
export function PlayerOverlay({ title, onClose }: { title: Playing | null; onClose: () => void }) {
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [t, setT] = useState(0); // 0..1
  const raf = useRef<number | null>(null);
  const last = useRef<number>(0);
  const DURATION = 90; // simulated seconds

  useEffect(() => {
    if (!title) return;
    setPlaying(true);
    setT(0);
  }, [title]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " " && title) {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, title]);

  useEffect(() => {
    if (!title || !playing) return;
    last.current = performance.now();
    const tick = (now: number) => {
      const dt = (now - last.current) / 1000;
      last.current = now;
      setT((prev) => {
        const next = prev + dt / DURATION;
        return next >= 1 ? 1 : next;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [title, playing]);

  const fmt = (frac: number) => {
    const secs = Math.floor(frac * DURATION);
    return `${String(Math.floor(secs / 60)).padStart(1, "0")}:${String(secs % 60).padStart(2, "0")}`;
  };

  const [g0, g1, g2] = title?.gradient?.length
    ? [title.gradient[0], title.gradient[1] ?? title.accent, title.gradient[2] ?? "#0A0A0A"]
    : ["#1a1a1a", "#564DFF", "#0A0A0A"];

  return (
    <AnimatePresence>
      {title && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black"
        >
          {/* Simulated frame */}
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: playing ? 1 : 0.75 }}
            style={{ background: `radial-gradient(120% 120% at 50% 30%, ${g1} 0%, ${g0} 45%, ${g2} 100%)` }}
          />
          {/* moving light to feel alive */}
          <motion.div
            className="absolute h-[60vh] w-[60vh] rounded-full blur-[120px]"
            animate={{ x: ["-10%", "60%", "10%"], y: ["10%", "40%", "20%"], opacity: playing ? 0.4 : 0.15 }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            style={{ backgroundColor: title.accent }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/40" />

          {/* Top bar */}
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-5">
            <h2 className="font-display text-xl font-semibold drop-shadow">{title.title}</h2>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full glass text-foreground hover:bg-white/10"
              aria-label="Close player"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Center play state */}
          <button
            onClick={() => setPlaying((p) => !p)}
            className="absolute inset-0 z-10 flex items-center justify-center"
            aria-label={playing ? "Pause" : "Play"}
          >
            <AnimatePresence>
              {!playing && (
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  className="flex h-20 w-20 items-center justify-center rounded-full glass"
                >
                  <Play className="h-9 w-9 fill-current" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Controls */}
          <div className="absolute inset-x-0 bottom-0 z-20 p-5">
            <div className="mb-3 flex items-center gap-3 text-xs tabular-nums text-foreground/80">
              <span>{fmt(t)}</span>
              <button
                className="group relative h-1.5 flex-1 overflow-visible rounded-full bg-white/15"
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setT(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
                }}
                aria-label="Scrub"
              >
                <span
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${t * 100}%`, backgroundColor: title.accent }}
                />
                <span
                  className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ left: `calc(${t * 100}% - 6px)` }}
                />
              </button>
              <span>-{fmt(1 - t)}</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setPlaying((p) => !p)} className="flex h-11 w-11 items-center justify-center rounded-full glass">
                {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
              </button>
              <button onClick={() => setMuted((m) => !m)} className="flex h-11 w-11 items-center justify-center rounded-full glass">
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <span className="ml-1 rounded-md glass px-2 py-1 text-[11px] text-foreground/70">
                Auto · simulated stream
              </span>
              <button className="ml-auto flex h-11 w-11 items-center justify-center rounded-full glass" aria-label="Fullscreen">
                <Maximize2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
