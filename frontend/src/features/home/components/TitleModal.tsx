"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Play, Plus, Star, ThumbsUp, X } from "lucide-react";
import { useEffect } from "react";
import { useMyList } from "@/shared/store/mylist-store";
import { homeApi } from "../api";
import type { TitleCard, TitleDetail } from "../types";

type Playing = { id: string; title: string; accent: string; gradient: string[] };

/**
 * The "big card" — an expanded detail modal (Netflix-style). Fetches full
 * detail + "More Like This", with working Play and My List actions.
 */
export function TitleModal({
  id,
  onClose,
  onPlay,
  onOpenDetail,
}: {
  id: string | null;
  onClose: () => void;
  onPlay: (t: Playing) => void;
  onOpenDetail: (id: string) => void;
}) {
  const detail = useQuery({
    queryKey: ["detail", id],
    queryFn: () => homeApi.detail(id as string),
    enabled: !!id,
  });
  const similar = useQuery({
    queryKey: ["similar", id],
    queryFn: () => homeApi.similar(id as string),
    enabled: !!id,
  });

  const { has, toggle } = useMyList();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const d = detail.data;
  const saved = d ? has(d.id) : false;
  const [g0, g1, g2] = d?.gradient?.length
    ? [d.gradient[0], d.gradient[1] ?? d.accent, d.gradient[2] ?? "#0A0A0A"]
    : ["#1a1a1a", "#564DFF", "#0A0A0A"];

  return (
    <AnimatePresence>
      {id && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm md:p-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-border bg-surface shadow-elevation-4"
          >
            {/* Backdrop hero */}
            <div className="relative aspect-[16/9] w-full">
              <div className="absolute inset-0" style={{ background: `radial-gradient(120% 120% at 30% 20%, ${g1} 0%, ${g0} 45%, ${g2} 100%)` }} />
              {d?.poster_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={d.poster_url} alt={d.title} className="absolute inset-0 h-full w-full object-cover opacity-60" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-foreground hover:bg-black/70"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                {detail.isLoading || !d ? (
                  <div className="h-10 w-2/3 animate-pulse rounded-lg bg-white/10" />
                ) : (
                  <>
                    <h2 className="font-display text-3xl font-bold leading-none md:text-4xl" style={{ textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}>
                      {d.title}
                    </h2>
                    <p className="mt-2 text-sm font-medium text-foreground/85">{d.tagline}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => onPlay({ id: d.id, title: d.title, accent: d.accent, gradient: d.gradient })}
                        className="inline-flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
                        style={{ backgroundColor: d.accent, boxShadow: `0 0 32px ${d.accent}66` }}
                      >
                        <Play className="h-5 w-5 fill-current" /> Play
                      </button>
                      <button
                        onClick={() => toggle(d as TitleCard)}
                        className="inline-flex h-11 items-center gap-2 rounded-xl glass px-5 text-sm font-semibold hover:bg-white/10"
                      >
                        {saved ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                        {saved ? "In My List" : "My List"}
                      </button>
                      <button className="flex h-11 w-11 items-center justify-center rounded-full glass hover:bg-white/10" aria-label="Rate">
                        <ThumbsUp className="h-5 w-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8">
              {d && (
                <>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/70">
                    <span className="inline-flex items-center gap-1 font-semibold" style={{ color: d.accent }}>
                      {d.match}% match
                    </span>
                    <span className="inline-flex items-center gap-1 text-foreground">
                      <Star className="h-4 w-4 fill-current" /> {d.rating.toFixed(1)}
                    </span>
                    <span>{d.year}</span>
                    <span className="rounded border border-border px-1.5 py-0.5 text-xs">{d.maturity}</span>
                    <span>{Math.floor(d.runtime_min / 60)}h {d.runtime_min % 60}m</span>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-foreground/85">{d.synopsis}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {d.vibe_tags.map((v) => (
                      <span key={v} className="rounded-full border border-border px-2.5 py-1 text-xs text-foreground/70">
                        {v}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-foreground/50">
                    <span className="text-foreground/70">Genres:</span> {d.genres.join(", ")}
                  </p>
                  {d.languages.length > 0 && (
                    <p className="mt-1 text-xs text-foreground/50">
                      <span className="text-foreground/70">Languages:</span> {d.languages.join(", ")}
                    </p>
                  )}

                  {/* Quality / download variants */}
                  {d.qualities.length > 0 && (
                    <div className="mt-5">
                      <h3 className="mb-2 font-display text-sm font-semibold text-foreground/90">Available in</h3>
                      <div className="flex flex-wrap gap-2">
                        {d.qualities.map((q) => (
                          <div
                            key={q.label}
                            className="flex items-center gap-2 rounded-xl border border-border bg-white/5 px-3 py-2"
                          >
                            <span
                              className="rounded px-1.5 py-0.5 text-[10px] font-bold text-black"
                              style={{ backgroundColor: q.label === "4K" ? "#FFD24D" : "rgba(255,255,255,0.85)" }}
                            >
                              {q.label}
                            </span>
                            <div className="leading-tight">
                              <p className="text-xs font-medium text-foreground/90">
                                {q.size_mb >= 1024 ? `${(q.size_mb / 1024).toFixed(1)} GB` : `${q.size_mb} MB`}
                              </p>
                              {q.audio && <p className="text-[10px] text-foreground/50">{q.audio}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* More like this */}
              <h3 className="mt-8 font-display text-lg font-semibold">More Like This</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {(similar.data ?? []).slice(0, 6).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onOpenDetail(s.id)}
                    className="group relative aspect-video overflow-hidden rounded-xl border border-border text-left"
                  >
                    <div className="absolute inset-0" style={{ background: `linear-gradient(155deg, ${s.gradient[1] ?? s.accent}, ${s.gradient[0]}, #0A0A0A)` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-2.5">
                      <p className="text-xs font-semibold leading-tight">{s.title}</p>
                      <p className="text-[10px] text-foreground/60">{s.match}% match · {s.year}</p>
                    </div>
                    <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Play className="h-3.5 w-3.5 fill-current" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
