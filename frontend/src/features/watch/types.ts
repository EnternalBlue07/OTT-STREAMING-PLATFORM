import type { PosterCardItem } from "@/shared/components/PosterCard";

export interface Trailer {
  id: string;
  title: string;
  kind: string; // trailer | teaser | bts | interview
  thumbnail_url: string | null;
  src: string;
}

export interface CastMember {
  id: string;
  name: string;
  character: string;
  photo_url: string | null;
  role: string; // actor | director
}

export interface ContentInfo {
  audio_languages: string[];
  subtitle_languages: string[];
  accessibility: string[];
  content_warning: string;
  studio: string;
  release_date: string;
}

export interface RatingBreakdown {
  average: number;
  total: number;
  counts: Record<string, number>; // "1".."5"
}

export interface WatchDetail {
  id: string;
  title: string;
  tagline: string;
  synopsis: string;
  year: number;
  runtime_min: number;
  maturity: string;
  content_type: string;
  genres: string[];
  moods: string[];
  languages: string[];
  rating: number;
  accent: string;
  gradient: string[];
  badges: string[];
  poster_url: string | null;
  quality_labels: string[];
  match: number;
  // Phase-2 detail
  trailers: Trailer[];
  cast: CastMember[];
  content_info: ContentInfo;
  rating_breakdown: RatingBreakdown;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  body: string;
  has_spoilers: boolean;
  verified: boolean;
  helpful: number;
  not_helpful: number;
  created_at: string | null;
}

export interface ReviewsResponse {
  breakdown: RatingBreakdown;
  items: Review[];
}

export interface Episode {
  id: string;
  season: number;
  episode: number;
  title: string;
  synopsis: string;
  runtime_min: number;
  thumbnail_url: string | null;
  watched: boolean;
}

export interface Season {
  season: number;
  episodes: Episode[];
}

export interface EpisodesResponse {
  content_type: string;
  seasons: Season[];
}

export type SimilarItem = PosterCardItem;
export type ReviewSort = "recent" | "helpful" | "critical" | "positive";
