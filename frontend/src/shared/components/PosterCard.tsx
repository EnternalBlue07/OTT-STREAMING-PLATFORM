"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Link from "next/link";

/**
 * Shared poster card — visually matches the Phase-1 home card, but navigates to
 * /watch/[id] (instead of opening the home modal). Lives in `shared/` so the
 * watch page can use it without importing `features/home` internals and without
 * touching the frozen homepage.
 */
export interface PosterCardItem {
  id: string;
  title: string;
  year: number;
  genres: string[];
  rating: number;
  accent: string;
  gradient: string[];
  poster_url?: string | null;
  quality_labels?: string[];
  content_type?: string;
  match?: number;
}

const TYPE_LABEL: Record<string, string> = {
  movie: "Movie",
  "web-series": "Series",
  "tv-series": "TV",
};

export function PosterCard({ item, index = 0 }: { item: PosterCardItem; index?: number }) {
  const [g0, g1] = item.gradient.length >= 2 ? item.gradient : [item.accent, "#0A0A0A"];
  const topQuality = item.quality_labels?.includes("4K")
    ? "4K"
    : item.quality_labels?.[item.quality_labels.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3), ease: [0.25, 1, 0.5, 1] }}
      whileHover={{ scale: 1.06, zIndex: 20 }}
      className="group relative aspect-[2/3] w-[200px] shrink-0 overflow-hidden rounded-2xl border border-border sm:w-[230px]"
      style={{ boxShadow: `0 0 0 transparent` }}
    >
      <Link href={`/watch/${item.id}`} className="absolute inset-0 block focus-visible:ring-2 focus-visible:ring-ring">
        {item.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.poster_url} alt={item.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(155deg, ${g1} 0%, ${g0} 55%, #0A0A0A 100%)` }} />
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          {typeof item.match === "number" && (
            <span className="rounded-md glass px-1.5 py-0.5 text-[10px] font-semibold" style={{ color: item.accent }}>
              {item.match}% match
            </span>
          )}
          {topQuality && (
            <span
              className="ml-auto rounded-md px-1.5 py-0.5 text-[10px] font-bold text-black"
              style={{ backgroundColor: topQuality === "4K" ? "#FFD24D" : "rgba(255,255,255,0.85)" }}
            >
              {topQuality}
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent p-3">
          <div className="mb-1 flex items-center gap-1.5">
            <Star className="h-3 w-3 fill-current" style={{ color: item.accent }} />
            <span className="text-[11px] font-semibold text-foreground/90">{item.rating.toFixed(1)}</span>
            <span className="text-[10px] text-foreground/50">· {item.year}</span>
            {item.content_type && (
              <span className="ml-auto rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-foreground/80">
                {TYPE_LABEL[item.content_type] ?? "Title"}
              </span>
            )}
          </div>
          <h3 className="font-display text-base font-semibold leading-tight">{item.title}</h3>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-foreground/60">{item.genres.join(" · ")}</p>
        </div>
      </Link>
    </motion.div>
  );
}
