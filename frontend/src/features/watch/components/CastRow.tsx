"use client";

import type { CastMember } from "../types";

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

/** Horizontal cast & crew row; clicking a member opens the filmography panel. */
export function CastRow({ cast, accent, onSelect }: { cast: CastMember[]; accent: string; onSelect: (m: CastMember) => void }) {
  if (!cast || cast.length === 0) return null;
  return (
    <section className="mb-10">
      <h2 className="mb-3 font-display text-heading font-semibold">Cast & Crew</h2>
      <div className="scrollbar-none flex gap-3 overflow-x-auto py-1">
        {cast.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m)}
            className="group flex w-28 shrink-0 flex-col items-center gap-2 rounded-xl border border-border bg-white/5 p-3 text-center transition-colors hover:bg-white/10"
          >
            <span
              className="flex h-16 w-16 items-center justify-center rounded-full font-display text-lg font-bold text-black transition-transform group-hover:scale-105"
              style={{ background: accent }}
            >
              {m.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.photo_url} alt={m.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                initials(m.name)
              )}
            </span>
            <span className="line-clamp-1 text-xs font-semibold">{m.name}</span>
            <span className="line-clamp-1 text-[11px] text-foreground/55">
              {m.role === "director" ? "Director" : m.character || "Cast"}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
