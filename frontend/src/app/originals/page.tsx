"use client";

import { Clapperboard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/shared/lib/api-client";
import { PosterCard, type PosterCardItem } from "@/shared/components/PosterCard";
import { SkeletonRow } from "@/shared/components/ui/Skeleton";

export default function OriginalsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["originals"],
    queryFn: async () => {
      const items = await apiFetch<PosterCardItem[]>("/api/v1/content/trending?limit=42");
      // All seeded titles are "OTT Original" — filter by that badge
      return items.filter((t) => (t as unknown as { badges: string[] }).badges?.some((b: string) => b.toLowerCase().includes("original") || b.toLowerCase().includes("new")));
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Clapperboard className="h-7 w-7 text-primary" />
        <h1 className="font-display text-display font-bold">Originals</h1>
      </div>
      {isLoading && <SkeletonRow />}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {(data ?? []).map((item, i) => (
          <PosterCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
