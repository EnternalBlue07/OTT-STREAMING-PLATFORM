"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import type { Trailer } from "../types";
import { InlineTrailerPlayer } from "./InlineTrailerPlayer";

const KIND_LABEL: Record<string, string> = {
  trailer: "Trailer",
  teaser: "Teaser",
  bts: "Behind the Scenes",
  interview: "Interview",
};

/** Horizontal trailers row; selecting a card plays it inline (lightbox). */
export function TrailersRow({ trailers, accent }: { trailers: Trailer[]; accent: string }) {
  const [active, setActive] = useState<Trailer | null>(null);
  if (!trailers || trailers.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-3 font-display text-heading font-semibold">Trailers & More</h2>
      <div className="scrollbar-none flex gap-3 overflow-x-auto py-1">
        {trailers.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t)}
            className="group relative aspect-video w-64 shrink-0 overflow-hidden rounded-xl border border-border text-left"
            style={{ background: `linear-gradient(135deg, ${accent}33, #0A0A0A)` }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full glass transition-transform group-hover:scale-110">
                <Play className="h-5 w-5 fill-current" />
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <p className="text-sm font-semibold">{t.title}</p>
              <p className="text-[11px] text-foreground/60">{KIND_LABEL[t.kind] ?? "Clip"}</p>
            </div>
          </button>
        ))}
      </div>
      <InlineTrailerPlayer trailer={active} onClose={() => setActive(null)} />
    </section>
  );
}
