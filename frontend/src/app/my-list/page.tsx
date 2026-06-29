"use client";

import { Heart } from "lucide-react";
import { useMemo } from "react";
import { useMyList } from "@/shared/store/mylist-store";
import { PosterCard } from "@/shared/components/PosterCard";
import { EmptyState } from "@/shared/components/ui/EmptyState";

export default function MyListPage() {
  const itemsMap = useMyList((s) => s.items);
  const items = useMemo(() => Object.values(itemsMap), [itemsMap]);

  return (
    <div>
      <h1 className="mb-6 font-display text-display font-bold">My List</h1>
      {items.length === 0 ? (
        <EmptyState icon={Heart} title="Your watchlist is empty" description="Tap the + button on any title to save it here." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item, i) => (
            <PosterCard key={item.id} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
