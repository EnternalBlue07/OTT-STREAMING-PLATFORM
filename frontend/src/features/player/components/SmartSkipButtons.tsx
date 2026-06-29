"use client";

import { motion } from "framer-motion";
import { SkipForward } from "lucide-react";
import { activeSkip } from "../reducer";
import type { SkipMarkers } from "../types";

interface Props {
  markers: SkipMarkers;
  currentTime: number;
  duration: number;
  nextEpisodeId: string | null;
  onSkip: (toSec: number) => void;
  onNext: () => void;
}

const LABEL: Record<string, string> = { intro: "Skip Intro", recap: "Skip Recap", credits: "Next Episode" };

/** Shows the context-appropriate skip button only within its marker interval. */
export function SmartSkipButtons({ markers, currentTime, duration, nextEpisodeId, onSkip, onNext }: Props) {
  const action = activeSkip(markers, currentTime, duration);
  if (!action) return null;
  if (action.kind === "credits" && !nextEpisodeId) return null;

  const isNext = action.kind === "credits";

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      onClick={() => (isNext ? onNext() : onSkip(action.seekTo))}
      className="absolute bottom-28 right-6 z-30 inline-flex items-center gap-2 rounded-xl border border-border bg-black/70 px-5 py-3 text-sm font-semibold backdrop-blur-md hover:bg-black/90"
    >
      <SkipForward className="h-4 w-4" />
      {LABEL[action.kind]}
    </motion.button>
  );
}
