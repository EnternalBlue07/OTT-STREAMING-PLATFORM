"use client";

import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { apiFetch } from "@/shared/lib/api-client";
import { PosterCard, type PosterCardItem } from "@/shared/components/PosterCard";
import { SkeletonRow } from "@/shared/components/ui/Skeleton";

export default function ForYouPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["for-you"],
    queryFn: async () => {
      const items = await apiFetch<PosterCardItem[]>("/api/v1/content/trending?limit=42");
      // Sort by match % descending (personalized feeling)
      return items.sort((a, b) => (b.match ?? 0) - (a.match ?? 0));
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Sparkles className="h-7 w-7 text-secondary" />
        <h1 className="font-display text-display font-bold">For You</h1>
      </div>
      <p className="mb-6 text-foreground/60">Personalized picks based on your taste profile.</p>
      {isLoading && <SkeletonRow />}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {(data ?? []).map((item, i) => (
          <PosterCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
