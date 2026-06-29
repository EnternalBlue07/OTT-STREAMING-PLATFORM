"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/shared/lib/api-client";
import { PosterCard, type PosterCardItem } from "@/shared/components/PosterCard";
import { SkeletonRow } from "@/shared/components/ui/Skeleton";

export default function BrowsePage() {
  const [genre, setGenre] = useState<string | null>(null);

  const home = useQuery({ queryKey: ["home"], queryFn: () => apiFetch<{ rails: { items: PosterCardItem[] }[] }>("/api/v1/content/home") });
  const genreQ = useQuery({
    queryKey: ["genre", genre],
    queryFn: () => apiFetch<PosterCardItem[]>(`/api/v1/content/genre/${genre}`),
    enabled: !!genre,
  });

  const allTitles: PosterCardItem[] = home.data?.rails?.flatMap((r) => r.items) ?? [];
  const uniqueTitles = Array.from(new Map(allTitles.map((t) => [t.id, t])).values());
  const genres = Array.from(new Set(uniqueTitles.flatMap((t) => t.genres)));
  const display = genre ? (genreQ.data ?? []) : uniqueTitles;

  return (
    <div>
      <h1 className="mb-6 font-display text-display font-bold">Browse</h1>
      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={() => setGenre(null)} className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${!genre ? "border-transparent bg-primary text-primary-foreground" : "border-border glass text-foreground/70 hover:text-foreground"}`}>All</button>
        {genres.map((g) => (
          <button key={g} onClick={() => setGenre(g)} className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${genre === g ? "border-transparent bg-primary text-primary-foreground" : "border-border glass text-foreground/70 hover:text-foreground"}`}>{g}</button>
        ))}
      </div>
      {(home.isLoading || genreQ.isLoading) && <SkeletonRow />}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {display.map((item, i) => (
          <PosterCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
