"use client";

import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import type { ReactNode } from "react";
import { formatTime } from "../reducer";
import type { PlayerState } from "../reducer";
import { ScrubBar } from "./ScrubBar";

export interface ControlActions {
  togglePlay: () => void;
  seekTo: (sec: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
}

interface Props {
  state: PlayerState;
  accent: string;
  volume: number;
  muted: boolean;
  actions: ControlActions;
  getPreview: (sec: number) => Promise<{ label: string; frame?: string }>;
  /** Right-side extra controls (settings, PiP, mini, etc.) added in Task 20. */
  rightSlot?: ReactNode;
}

export function ControlBar({ state, accent, volume, muted, actions, getPreview, rightSlot }: Props) {
  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 to-transparent px-4 pb-4 pt-10 transition-opacity duration-300 ${
        state.showControls ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <ScrubBar
        currentTime={state.currentTime}
        duration={state.duration}
        bufferedEnd={state.bufferedEnd}
        accent={accent}
        onSeek={actions.seekTo}
        getPreview={getPreview}
      />

      <div className="mt-3 flex items-center gap-3">
        <button onClick={actions.togglePlay} aria-label={state.isPlaying ? "Pause" : "Play"} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10">
          {state.isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
        </button>

        <div className="group flex items-center gap-2">
          <button onClick={actions.toggleMute} aria-label={muted ? "Unmute" : "Mute"} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10">
            {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => actions.setVolume(Number(e.target.value))}
            aria-label="Volume"
            className="h-1 w-0 cursor-pointer accent-white transition-all group-hover:w-24"
          />
        </div>

        <span className="text-xs tabular-nums text-foreground/80">
          {formatTime(state.currentTime)} <span className="text-foreground/40">/ {formatTime(state.duration)}</span>
        </span>

        <div className="ml-auto flex items-center gap-1">
          {rightSlot}
          <button onClick={actions.toggleFullscreen} aria-label="Fullscreen" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10">
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
