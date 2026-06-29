"use client";

import { useRef, useState } from "react";
import { formatTime } from "../reducer";

interface Props {
  currentTime: number;
  duration: number;
  bufferedEnd: number;
  accent: string;
  onSeek: (sec: number) => void;
  getPreview: (sec: number) => Promise<{ label: string; frame?: string }>;
}

/** Seek timeline with played/buffered fill and a hover time+thumbnail preview. */
export function ScrubBar({ currentTime, duration, bufferedEnd, accent, onSeek, getPreview }: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [preview, setPreview] = useState<{ label: string; frame?: string } | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pct = duration ? (currentTime / duration) * 100 : 0;
  const buffPct = duration ? (bufferedEnd / duration) * 100 : 0;

  function timeAt(clientX: number): { sec: number; x: number } {
    const r = barRef.current!.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    return { sec: ratio * duration, x: ratio * r.width };
  }

  function onMove(e: React.MouseEvent) {
    if (!duration) return;
    const { sec, x } = timeAt(e.clientX);
    setHoverX(x);
    setPreview((p) => ({ label: formatTime(sec), frame: p?.frame }));
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      const result = await getPreview(sec);
      setPreview(result);
    }, 120);
  }

  return (
    <div className="relative">
      {hoverX !== null && preview && (
        <div className="pointer-events-none absolute bottom-5 -translate-x-1/2" style={{ left: hoverX }}>
          <div className="overflow-hidden rounded-lg border border-border bg-black/90 shadow-elevation-3">
            {preview.frame && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.frame} alt="" className="h-[88px] w-[156px] object-cover" />
            )}
            <div className="px-2 py-1 text-center text-[11px] tabular-nums text-foreground/80">{preview.label}</div>
          </div>
        </div>
      )}

      <div
        ref={barRef}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={Math.floor(duration)}
        aria-valuenow={Math.floor(currentTime)}
        tabIndex={0}
        onMouseMove={onMove}
        onMouseLeave={() => {
          setHoverX(null);
          setPreview(null);
        }}
        onClick={(e) => onSeek(timeAt(e.clientX).sec)}
        className="group relative h-1.5 w-full cursor-pointer rounded-full bg-white/20"
      >
        <div className="absolute inset-y-0 left-0 rounded-full bg-white/30" style={{ width: `${buffPct}%` }} />
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, backgroundColor: accent }} />
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover:opacity-100"
          style={{ left: `calc(${pct}% - 7px)` }}
        />
      </div>
    </div>
  );
}
