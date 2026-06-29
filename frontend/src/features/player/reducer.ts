import type { AudioOption, Level, SkipMarkers, SubtitleOption } from "./types";

// --- Pure helpers (unit-testable, no React) ---

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function levelLabel(height: number): string {
  if (height >= 2000) return "4K";
  if (height >= 1080) return "1080p";
  if (height >= 720) return "720p";
  if (height >= 480) return "480p";
  return `${height}p`;
}

export function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const s = Math.floor(sec % 60);
  const m = Math.floor((sec / 60) % 60);
  const h = Math.floor(sec / 3600);
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return h ? `${h}:${mm}:${String(s).padStart(2, "0")}` : `${mm}:${String(s).padStart(2, "0")}`;
}

export type SkipKind = "intro" | "recap" | "credits";

/** Returns the active skip action for the current time, or null. */
export function activeSkip(
  markers: SkipMarkers,
  currentTime: number,
  duration: number,
): { kind: SkipKind; seekTo: number } | null {
  if (markers.intro && currentTime >= markers.intro.start && currentTime < markers.intro.end) {
    return { kind: "intro", seekTo: clamp(markers.intro.end, 0, duration || markers.intro.end) };
  }
  if (markers.recap && currentTime >= markers.recap.start && currentTime < markers.recap.end) {
    return { kind: "recap", seekTo: clamp(markers.recap.end, 0, duration || markers.recap.end) };
  }
  if (markers.credits && duration && currentTime >= markers.credits.start) {
    return { kind: "credits", seekTo: duration };
  }
  return null;
}

// --- Reducer ---

export interface PlayerState {
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  bufferedEnd: number;
  levels: Level[];
  activeLevel: number; // -1 = Auto
  audioTracks: AudioOption[];
  activeAudio: number;
  subtitleTracks: SubtitleOption[];
  activeSubtitle: number; // -1 = Off
  showControls: boolean;
  cinematic: boolean;
  pip: boolean;
  error: string | null;
}

export const initialPlayerState: PlayerState = {
  isPlaying: false,
  isBuffering: true,
  currentTime: 0,
  duration: 0,
  bufferedEnd: 0,
  levels: [],
  activeLevel: -1,
  audioTracks: [],
  activeAudio: 0,
  subtitleTracks: [],
  activeSubtitle: -1,
  showControls: true,
  cinematic: false,
  pip: false,
  error: null,
};

export type PlayerAction =
  | { type: "SET_LEVELS"; levels: Level[] }
  | { type: "SET_ACTIVE_LEVEL"; index: number }
  | { type: "SET_AUDIO"; tracks: AudioOption[]; active?: number }
  | { type: "SET_ACTIVE_AUDIO"; index: number }
  | { type: "SET_SUBTITLES"; tracks: SubtitleOption[]; active?: number }
  | { type: "SET_ACTIVE_SUBTITLE"; index: number }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "BUFFERING"; value: boolean }
  | { type: "TIME"; value: number }
  | { type: "DURATION"; value: number }
  | { type: "BUFFERED"; value: number }
  | { type: "TOGGLE_CINEMATIC" }
  | { type: "SET_PIP"; value: boolean }
  | { type: "SHOW_CONTROLS" }
  | { type: "HIDE_CONTROLS" }
  | { type: "SET_ERROR"; value: string | null };

export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "SET_LEVELS":
      return { ...state, levels: action.levels };
    case "SET_ACTIVE_LEVEL":
      return { ...state, activeLevel: action.index };
    case "SET_AUDIO":
      return { ...state, audioTracks: action.tracks, activeAudio: action.active ?? state.activeAudio };
    case "SET_ACTIVE_AUDIO":
      return { ...state, activeAudio: action.index };
    case "SET_SUBTITLES":
      return { ...state, subtitleTracks: action.tracks, activeSubtitle: action.active ?? state.activeSubtitle };
    case "SET_ACTIVE_SUBTITLE":
      return { ...state, activeSubtitle: action.index };
    case "PLAY":
      return { ...state, isPlaying: true };
    case "PAUSE":
      return { ...state, isPlaying: false };
    case "BUFFERING":
      return { ...state, isBuffering: action.value };
    case "TIME":
      return { ...state, currentTime: action.value };
    case "DURATION":
      return { ...state, duration: action.value };
    case "BUFFERED":
      return { ...state, bufferedEnd: action.value };
    case "TOGGLE_CINEMATIC":
      return { ...state, cinematic: !state.cinematic };
    case "SET_PIP":
      return { ...state, pip: action.value };
    case "SHOW_CONTROLS":
      return { ...state, showControls: true };
    case "HIDE_CONTROLS":
      return { ...state, showControls: false };
    case "SET_ERROR":
      return { ...state, error: action.value };
    default:
      return state;
  }
}
