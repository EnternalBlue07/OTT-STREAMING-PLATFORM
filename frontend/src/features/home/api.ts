import { apiFetch } from "@/shared/lib/api-client";
import type { HomePayload, TasteDNA, TitleCard, TitleDetail } from "./types";

export const homeApi = {
  home: () => apiFetch<HomePayload>("/api/v1/content/home"),
  detail: (id: string) => apiFetch<TitleDetail>(`/api/v1/content/${id}`),
  byMood: (mood: string) => apiFetch<TitleCard[]>(`/api/v1/content/mood/${mood}?limit=12`),
  tasteDna: () => apiFetch<TasteDNA>("/api/v1/content/taste-dna"),
  similar: (id: string) => apiFetch<TitleCard[]>(`/api/v1/content/${id}/similar`),
  search: (q: string) => apiFetch<TitleCard[]>(`/api/v1/content/search?q=${encodeURIComponent(q)}`),
};
