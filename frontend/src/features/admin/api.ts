import { apiFetch } from "@/shared/lib/api-client";
import type { TitleDetail } from "@/features/home/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";

export interface CreatePayload {
  title: string;
  content_type: string;
  tagline?: string;
  synopsis?: string;
  year?: number;
  runtime_min?: number;
  maturity?: string;
  rating?: number;
  trending_score?: number;
  accent?: string;
  genres?: string[];
  moods?: string[];
  vibe_tags?: string[];
  languages?: string[];
  ott?: string[];
  badges?: string[];
  qualities?: { label: string; size_mb: number; source_url: string; audio: string }[];
}

export const adminApi = {
  list: () => apiFetch<TitleDetail[]>("/api/v1/admin/content"),

  create: (payload: CreatePayload) =>
    apiFetch<TitleDetail>("/api/v1/admin/content", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  remove: (id: string) =>
    apiFetch<{ deleted: string }>(`/api/v1/admin/content/${id}`, { method: "DELETE" }),

  // Multipart upload — must NOT set Content-Type (browser sets the boundary).
  uploadPoster: async (id: string, file: File): Promise<TitleDetail> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/api/v1/admin/content/${id}/poster`, {
      method: "POST",
      credentials: "include",
      body: form,
    });
    const body = await res.json().catch(() => null);
    if (!res.ok || body?.error) {
      throw new Error(body?.error?.message ?? `Poster upload failed (${res.status})`);
    }
    return body.data as TitleDetail;
  },
};
