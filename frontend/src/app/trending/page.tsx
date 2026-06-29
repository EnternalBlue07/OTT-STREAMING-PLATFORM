"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/shared/lib/api-client";
import { PosterCard, type PosterCardItem } from "@/shared/components/PosterCard";
import { SkeletonRow } from "@/shared/components/ui/Skeleton";

export default function TrendingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["trending-full"],
    queryFn: () => apiFetch<PosterCardItem[]>("/api/v1/content/trending?limit=42"),
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-display font-bold">🔥 Trending Now</h1>
      {isLoading && <SkeletonRow />}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {(data ?? []).map((item, i) => (
          <PosterCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
