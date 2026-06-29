export interface Rendition {
  label: string; // 4K | 1080p | 720p | 480p
  height: number;
  bitrate: number;
}

export interface AudioTrack {
  id: string;
  label: string;
  lang: string;
}

export interface SubtitleTrack {
  id: string;
  label: string;
  lang: string;
  src: string;
}

export interface SkipInterval {
  start: number;
  end: number;
}

export interface SkipMarkers {
  intro?: SkipInterval | null;
  recap?: SkipInterval | null;
  credits?: { start: number } | null;
}

export interface Playback {
  title: string;
  hls_url: string;
  native_hls: boolean;
  renditions: Rendition[];
  audio_tracks: AudioTrack[];
  subtitle_tracks: SubtitleTrack[];
  skip_markers: SkipMarkers;
  next_episode_id: string | null;
  start_at: number;
  accent: string;
  gradient: string[];
}

/** A selectable quality level (from the parsed manifest). */
export interface Level {
  index: number; // hls.js level index; -1 = Auto
  height: number;
  bitrate: number;
  label: string;
}

/** A subtitle option in the UI (merges manifest + external tracks). */
export interface SubtitleOption {
  id: string;
  label: string;
  lang: string;
}

/** An audio option in the UI. */
export interface AudioOption {
  id: string;
  label: string;
  lang: string;
}
