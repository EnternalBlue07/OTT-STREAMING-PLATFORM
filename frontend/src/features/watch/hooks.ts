"use client";

import { useQuery } from "@tanstack/react-query";
import { watchApi } from "./api";
import type { ReviewSort } from "./types";

export function useTitleDetail(id: string) {
  return useQuery({ queryKey: ["detail", id], queryFn: () => watchApi.detail(id), staleTime: 60_000 });
}

export function useSimilar(id: string) {
  return useQuery({ queryKey: ["similar", id], queryFn: () => watchApi.similar(id), staleTime: 60_000 });
}

export function useReviews(id: string, sort: ReviewSort) {
  return useQuery({ queryKey: ["reviews", id, sort], queryFn: () => watchApi.reviews(id, sort) });
}

export function useEpisodes(id: string, enabled: boolean) {
  return useQuery({ queryKey: ["episodes", id], queryFn: () => watchApi.episodes(id), enabled });
}
