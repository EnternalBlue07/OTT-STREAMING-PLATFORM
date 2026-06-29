"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { SkeletonRow } from "@/shared/components/ui/Skeleton";
import { useMyList } from "@/shared/store/mylist-store";
import { homeApi } from "./api";
import { AccentProvider } from "./accent-context";
import { TitleActionsProvider } from "./title-actions";
import { AmbientBackdrop } from "./components/AmbientBackdrop";
import { HeroCarousel } from "./components/HeroCarousel";
import { MomentumRow } from "./components/MomentumRow";
import { MoodDock } from "./components/MoodDock";
import { TasteDNA } from "./components/TasteDNA";

export function HomeExperience() {
  const [mood, setMood] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const myListItems = useMyList((s) => s.items);
  const myList = useMemo(() => Object.values(myListItems), [myListItems]);

  useEffect(() => setMounted(true), []);

  const home = useQuery({ queryKey: ["home"], queryFn: homeApi.home, staleTime: 60_000 });
  const dna = useQuery({ queryKey: ["taste-dna"], queryFn: homeApi.tasteDna, staleTime: 60_000 });
  const moodRow = useQuery({
    queryKey: ["mood", mood],
    queryFn: () => homeApi.byMood(mood as string),
    enabled: !!mood,
  });

  if (home.isLoading) {
    return (
      <div className="space-y-8">
        <div className="-mx-4 -mt-8 aspect-[16/12] w-full animate-pulse rounded-3xl bg-surface/60 sm:aspect-[21/9] md:mx-0" />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  }

  if (home.isError || !home.data) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Couldn't reach the catalog"
        description="The content API isn't responding. Make sure the backend is running on port 8001, then retry."
      />
    );
  }

  const { rails, moods } = home.data;
  const trending = rails.find((r) => r.key === "trending")?.items ?? [];
  const otherRails = rails.filter((r) => r.key !== "trending");
  const activeMood = moods.find((m) => m.id === mood);

  return (
    <AccentProvider>
      <TitleActionsProvider>
        <AmbientBackdrop />
        <HeroCarousel items={trending} />

        <MoodDock moods={moods} active={mood} onPick={setMood} />

        <AnimatePresence mode="wait">
          {mood && (
            <motion.div
              key={mood}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              {moodRow.isLoading ? (
                <SkeletonRow />
              ) : (
                <MomentumRow
                  title={`${activeMood?.emoji ?? ""} ${activeMood?.label ?? "Mood"}`}
                  items={moodRow.data ?? []}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {mounted && myList.length > 0 && <MomentumRow title="My List" items={myList} />}

        <MomentumRow title="🔥 Trending Now" items={trending} />
        {otherRails.map((rail) => (
          <MomentumRow key={rail.key} title={rail.title} items={rail.items} />
        ))}

        {dna.data && <TasteDNA data={dna.data} />}
      </TitleActionsProvider>
    </AccentProvider>
  );
}
