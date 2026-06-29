"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Cross-session player preferences (volume, mute, speed, preferred quality &
 * subtitle language). Persisted so the player remembers the user's setup.
 */
interface PlayerPrefs {
  volume: number; // 0..1
  muted: boolean;
  playbackRate: number;
  preferredQuality: string; // "auto" | "4K" | "1080p" | ...
  preferredSubtitleLang: string | null;
  set: (patch: Partial<Omit<PlayerPrefs, "set">>) => void;
}

export const usePlayerPrefs = create<PlayerPrefs>()(
  persist(
    (set) => ({
      volume: 1,
      muted: true, // start muted to satisfy autoplay policies
      playbackRate: 1,
      preferredQuality: "auto",
      preferredSubtitleLang: null,
      set: (patch) => set(patch),
    }),
    { name: "ott-player-prefs" },
  ),
);
