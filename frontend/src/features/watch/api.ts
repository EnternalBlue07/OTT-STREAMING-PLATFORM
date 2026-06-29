import { apiFetch } from "@/shared/lib/api-client";
import type {
  EpisodesResponse,
  Review,
  ReviewSort,
  ReviewsResponse,
  SimilarItem,
  WatchDetail,
} from "./types";

export const watchApi = {
  detail: (id: string) => apiFetch<WatchDetail>(`/api/v1/content/${id}`),

  similar: (id: string) => apiFetch<SimilarItem[]>(`/api/v1/content/${id}/similar`),

  reviews: (id: string, sort: ReviewSort = "recent") =>
    apiFetch<ReviewsResponse>(`/api/v1/content/${id}/reviews?sort=${sort}`),

  voteReview: (id: string, reviewId: string, helpful: boolean) =>
    apiFetch<Review>(`/api/v1/content/${id}/reviews/${reviewId}/vote`, {
      method: "POST",
      body: JSON.stringify({ helpful }),
    }),

  episodes: (id: string) => apiFetch<EpisodesResponse>(`/api/v1/content/${id}/episodes`),
};
