"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { Check, Play, Plus, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMyList } from "@/shared/store/mylist-store";
import { useAccent } from "../accent-context";
import { useTitleActions } from "../title-actions";
import type { TitleCard as TitleCardT } from "../types";

const TYPE_LABEL: Record<string, string> = {
  movie: "Movie",
  "web-series": "Series",
  "tv-series": "TV",
};

/**
 * Big cinematic poster card:
 *  - real poster image when uploaded, else a signature gradient
 *  - cursor-following spotlight + accent glow ring
 *  - quality badges (480p → 4K) and type tag
 *  - expands on hover with quick actions; click opens the big detail card
 */
export function TitleCard({ item, index }: { item: TitleCardT; index: number }) {
  const { setAccent } = useAccent();
  const { play } = useTitleActions();
  const router = useRouter();
  const { has, toggle } = useMyList();
  const [hovered, setHovered] = useState(false);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const spotlight = useMotionTemplate`radial-gradient(220px circle at ${mx}% ${my}%, ${item.accent}55, transparent 60%)`;

  const saved = has(item.id);
  const [g0, g1] = item.gradient.length >= 2 ? item.gradient : [item.accent, "#0A0A0A"];
  const topQuality = item.quality_labels?.includes("4K")
    ? "4K"
    : item.quality_labels?.[item.quality_labels.length - 1];

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 100);
    my.set(((e.clientY - r.top) / r.height) * 100);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3), ease: [0.25, 1, 0.5, 1] }}
      onMouseMove={onMove}
      onMouseEnter={() => {
        setHovered(true);
        setAccent(item.accent);
      }}
      onMouseLeave={() => setHovered(false)}
      onClick={() => router.push(`/watch/${item.id}`)}
      whileHover={{ scale: 1.06, zIndex: 20 }}
      className="group relative aspect-[2/3] w-[200px] shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-border sm:w-[230px]"
      style={{ boxShadow: hovered ? `0 22px 60px ${item.accent}45` : undefined }}
    >
      {/* Poster: real image when available, else cinematic gradient */}
      {item.poster_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.poster_url} alt={item.title} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(155deg, ${g1} 0%, ${g0} 55%, #0A0A0A 100%)` }} />
      )}

      {/* Cursor spotlight */}
      <motion.div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: spotlight }} />

      {/* Top meta */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <div className="flex flex-col gap-1">
          <span className="rounded-md glass px-1.5 py-0.5 text-[10px] font-semibold" style={{ color: item.accent }}>
            {item.match}% match
          </span>
          <span className="w-fit rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-foreground/80">
            {TYPE_LABEL[item.content_type] ?? "Title"}
          </span>
        </div>
        {topQuality && (
          <span
            className="rounded-md px-1.5 py-0.5 text-[10px] font-bold text-black"
            style={{ backgroundColor: topQuality === "4K" ? "#FFD24D" : "rgba(255,255,255,0.85)" }}
          >
            {topQuality}
          </span>
        )}
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent p-3">
        <div className="mb-1 flex items-center gap-1.5">
          <Star className="h-3 w-3 fill-current" style={{ color: item.accent }} />
          <span className="text-[11px] font-semibold text-foreground/90">{item.rating.toFixed(1)}</span>
          <span className="text-[10px] text-foreground/50">· {item.year}</span>
        </div>
        <h3 className="font-display text-base font-semibold leading-tight">{item.title}</h3>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-foreground/60">{item.genres.join(" · ")}</p>

        <motion.div initial={false} animate={{ height: hovered ? "auto" : 0, opacity: hovered ? 1 : 0 }} className="overflow-hidden">
          <p className="mt-2 line-clamp-2 text-[11px] text-foreground/70">{item.tagline}</p>

          {/* Quality chips */}
          {item.quality_labels?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.quality_labels.map((q) => (
                <span key={q} className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-[9px] font-medium text-foreground/70">
                  {q}
                </span>
              ))}
            </div>
          )}

          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                play({ id: item.id, title: item.title, accent: item.accent, gradient: item.gradient });
              }}
              className="inline-flex h-8 items-center gap-1 rounded-lg px-3 text-[11px] font-semibold text-black"
              style={{ backgroundColor: item.accent }}
            >
              <Play className="h-3.5 w-3.5 fill-current" /> Play
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggle(item);
              }}
              aria-label={saved ? "Remove from My List" : "Add to My List"}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg glass text-foreground/80 hover:text-foreground"
            >
              {saved ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
