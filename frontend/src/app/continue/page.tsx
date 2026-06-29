"use client";

import { Clock, Play } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useMyList } from "@/shared/store/mylist-store";
import { EmptyState } from "@/shared/components/ui/EmptyState";

/**
 * Continue Watching. Shows titles from My List with a simulated progress bar
 * and time remaining. (Real watch-history persistence arrives with the DynamoDB
 * phase — this uses the existing Zustand watchlist as a stand-in.)
 */
export default function ContinuePage() {
  const itemsMap = useMyList((s) => s.items);
  const items = useMemo(() => Object.values(itemsMap), [itemsMap]);

  if (items.length === 0) {
    return (
      <div>
        <h1 className="mb-6 font-display text-display font-bold">Continue Watching</h1>
        <EmptyState icon={Clock} title="Nothing in progress" description="Start watching something and it'll appear here." />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-display font-bold">Continue Watching</h1>
      <div className="space-y-3">
        {items.map((item) => {
          const progress = Math.floor(30 + ((item.id.charCodeAt(0) * 7) % 60)); // simulated 30–90%
          const remaining = Math.floor(item.runtime_min * (1 - progress / 100));
          return (
            <Link key={item.id} href={`/watch/${item.id}`} className="group flex items-center gap-4 rounded-2xl border border-border bg-white/5 p-3 transition-colors hover:bg-white/10">
              <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-xl" style={{ background: `linear-gradient(135deg, ${item.accent}55, #0A0A0A)` }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full glass transition-transform group-hover:scale-110">
                    <Play className="h-4 w-4 fill-current" />
                  </span>
                </div>
                {/* Progress bar */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
                  <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: item.accent }} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-foreground/50">{item.genres.join(" · ")}</p>
                <p className="mt-1 text-xs text-foreground/60">{remaining}m remaining</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
