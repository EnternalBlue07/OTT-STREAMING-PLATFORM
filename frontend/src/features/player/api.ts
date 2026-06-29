import { apiFetch } from "@/shared/lib/api-client";
import type { Playback } from "./types";

export const playerApi = {
  playback: (id: string, episodeId?: string) =>
    apiFetch<Playback>(`/api/v1/content/${id}/playback${episodeId ? `?ep=${episodeId}` : ""}`),
};
