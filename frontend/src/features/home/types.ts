export interface QualityVariant {
  label: string; // 480p | 720p | 1080p | 4K
  size_mb: number;
  source_url: string;
  audio: string;
}

export interface TitleCard {
  id: string;
  title: string;
  tagline: string;
  year: number;
  runtime_min: number;
  maturity: string;
  content_type: string; // movie | web-series | tv-series
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

export interface TitleDetail extends TitleCard {
  synopsis: string;
  vibe_tags: string[];
  ott: string[];
  qualities: QualityVariant[];
  trending_score: number;
}

export interface Mood {
  id: string;
  label: string;
  emoji: string;
}

export interface Rail {
  key: string;
  title: string;
  items: TitleCard[];
}

export interface HomePayload {
  spotlight: TitleDetail;
  rails: Rail[];
  moods: Mood[];
}

export interface TasteDNA {
  profile: { genre: string; affinity: number }[];
  top_genre: string | null;
  sample_size: number;
}
