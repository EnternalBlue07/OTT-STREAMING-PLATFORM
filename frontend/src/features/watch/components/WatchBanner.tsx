"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { WatchDetail } from "../types";

const TYPE_LABEL: Record<string, string> = { movie: "Movie", "web-series": "Web Series", "tv-series": "TV Series" };

function durationLabel(t: WatchDetail): string {
  if (t.content_type !== "movie") return "Series";
  const h = Math.floor(t.runtime_min / 60);
  const m = t.runtime_min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

/**
 * Cinematic banner: color-matched blurred backdrop + poster/gradient, title,
 * badges (year, maturity, duration, top quality), and ratings.
 */
export function WatchBanner({ title }: { title: WatchDetail }) {
  const [g0, g1, g2] = title.gradient.length >= 3 ? title.gradient : [title.gradient[0] ?? title.accent, title.accent, "#0A0A0A"];
  const topQuality = title.quality_labels?.includes("4K") ? "4K" : title.quality_labels?.[title.quality_labels.length - 1];

  return (
    <section className="relative -mx-4 -mt-8 mb-8 overflow-hidden md:mx-0 md:rounded-3xl">
      <div className="relative min-h-[60vh] w-full sm:aspect-[21/9]">
        {/* Color-matched blurred backdrop */}
        <div className="absolute inset-0" style={{ background: `radial-gradient(120% 120% at 28% 20%, ${g1} 0%, ${g0} 45%, ${g2} 100%)` }} />
        {title.poster_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={title.poster_url} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />

        <div className="absolute inset-0 flex items-end gap-6 p-6 md:p-12">
          {/* Poster */}
          <div className="hidden h-64 w-44 shrink-0 overflow-hidden rounded-2xl border border-border shadow-elevation-4 sm:block">
            {title.poster_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={title.poster_url} alt={title.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full" style={{ background: `linear-gradient(155deg, ${g1}, ${g0}, #0A0A0A)` }} />
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-medium text-foreground/80">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: title.accent }} />
              {TYPE_LABEL[title.content_type] ?? "Title"}
            </span>

            <h1 className="mt-3 font-display text-display-lg font-bold leading-none" style={{ textShadow: "0 8px 40px rgba(0,0,0,0.6)" }}>
              {title.title}
            </h1>
            <p className="mt-2 text-base font-medium text-foreground/90 md:text-lg">{title.tagline}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-foreground/75">
              <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                <Star className="h-4 w-4 fill-current" style={{ color: title.accent }} /> {title.rating.toFixed(1)}
              </span>
              <Badge>{title.year}</Badge>
              <Badge>{title.maturity}</Badge>
              <Badge>{durationLabel(title)}</Badge>
              {topQuality && <Badge highlight={topQuality === "4K"}>{topQuality}</Badge>}
              <span className="text-foreground/50">{title.genres.join(" · ")}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Badge({ children, highlight = false }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <span
      className="rounded border px-1.5 py-0.5 text-xs"
      style={highlight ? { background: "#FFD24D", color: "#000", borderColor: "transparent", fontWeight: 700 } : { borderColor: "rgba(255,255,255,0.18)" }}
    >
      {children}
    </span>
  );
}
