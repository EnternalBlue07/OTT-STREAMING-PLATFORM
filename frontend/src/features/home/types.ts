// Re-export shared types so home feature internals keep working
export type { TitleCard, TitleDetail, QualityVariant } from "@/shared/types/content";

export interface Mood {
  id: string;
  label: string;
  emoji: string;
}

export interface Rail {
  key: string;
  title: string;
  items: import("@/shared/types/content").TitleCard[];
}

export interface HomePayload {
  spotlight: import("@/shared/types/content").TitleDetail;
  rails: Rail[];
  moods: Mood[];
}

export interface TasteDNA {
  profile: { genre: string; affinity: number }[];
  top_genre: string | null;
  sample_size: number;
}
