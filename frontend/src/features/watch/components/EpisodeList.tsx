"use client";

import { Check, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEpisodes } from "../hooks";

/** Season tabs + episode cards. Renders nothing for movies. */
export function EpisodeList({ contentId, contentType, accent }: { contentId: string; contentType: string; accent: string }) {
  const router = useRouter();
  const enabled = contentType !== "movie";
  const { data } = useEpisodes(contentId, enabled);
  const [activeSeason, setActiveSeason] = useState(1);

  if (!enabled || !data || data.seasons.length === 0) return null;

  const season = data.seasons.find((s) => s.season === activeSeason) ?? data.seasons[0];

  return (
    <section className="mb-10">
      <h2 className="mb-3 font-display text-heading font-semibold">Episodes</h2>

      {data.seasons.length > 1 && (
        <div className="mb-4 flex gap-2">
          {data.seasons.map((s) => (
            <button
              key={s.season}
              onClick={() => setActiveSeason(s.season)}
              className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                s.season === activeSeason ? "border-transparent bg-secondary text-secondary-foreground" : "border-border glass text-foreground/70"
              }`}
            >
              Season {s.season}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {season.episodes.map((ep) => (
          <button
            key={ep.id}
            onClick={() => router.push(`/player/${contentId}?ep=${ep.id}`)}
            className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-white/5 p-3 text-left transition-colors hover:bg-white/10"
          >
            <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg" style={{ background: `linear-gradient(135deg, ${accent}55, #0A0A0A)` }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full glass transition-transform group-hover:scale-110">
                  <Play className="h-4 w-4 fill-current" />
                </span>
              </div>
              {ep.watched && (
                <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-success text-black">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-sm font-semibold">{ep.title}</p>
                <span className="shrink-0 text-xs text-foreground/50">{ep.runtime_min}m</span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-foreground/60">{ep.synopsis}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
