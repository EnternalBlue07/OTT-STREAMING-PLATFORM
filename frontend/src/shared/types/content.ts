/**
 * Shared content types used across features (home, watch, admin, player).
 * Lives in @/shared so no feature imports another feature's internals.
 */

export interface TitleCard {
  id: string;
  title: string;
  tagline: string;
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
}

export interface QualityVariant {
  label: string;
  size_mb: number;
  source_url: string;
  audio: string;
}

export interface TitleDetail extends TitleCard {
  synopsis: string;
  vibe_tags: string[];
  ott: string[];
  qualities: QualityVariant[];
  trending_score: number;
}
