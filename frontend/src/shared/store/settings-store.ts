"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Global user settings — persisted to localStorage, applied immediately across
 * the app. The player reads preferredQuality/subtitleLang/autoplay from here.
 */
export interface SettingsState {
  defaultQuality: string; // "Auto" | "4K" | "1080p" | "720p" | "480p"
  autoplay: boolean;
  subtitleLanguage: string; // "Off" | "English" | "Hindi" | etc.
  audioLanguage: string;
  theme: string; // "dark" | "oled" | "midnight"
  dataServerMode: boolean; // reduce quality on mobile data
  notifications: boolean;
  downloadQuality: string;
  playbackSpeed: number;
  skipIntro: boolean;
  skipRecap: boolean;
  autoNextEpisode: boolean;
  set: (patch: Partial<Omit<SettingsState, "set">>) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      defaultQuality: "Auto",
      autoplay: true,
      subtitleLanguage: "English",
      audioLanguage: "Hindi",
      theme: "dark",
      dataServerMode: false,
      notifications: true,
      downloadQuality: "1080p",
      playbackSpeed: 1,
      skipIntro: true,
      skipRecap: true,
      autoNextEpisode: true,
      set: (patch) => set(patch),
    }),
    { name: "ott-settings" },
  ),
);
