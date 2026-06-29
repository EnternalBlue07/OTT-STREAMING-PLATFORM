"use client";

import { Loader2 } from "lucide-react";
import { forwardRef, useEffect, useRef, useState } from "react";
import type { SubtitleTrack } from "../types";

interface Props {
  isBuffering: boolean;
  externalSubtitles: SubtitleTrack[];
  gradient: string[]; // title gradient for the backdrop
  accent: string;
  onActivity: () => void;
  onSeekBy: (delta: number) => void;
  onTogglePlay: () => void;
  onFirstPlay?: () => void;
}

/**
 * Netflix-level video surface:
 * - Gradient backdrop always visible underneath (no blank frame ever)
 * - Video starts at opacity:0, fades in on first `playing` event (400ms ease)
 * - Stall spinner only shows after 800ms delay (not immediately)
 * - Double-click zones for ±10s seek
 */
export const VideoSurface = forwardRef<HTMLVideoElement, Props>(function VideoSurface(
  { isBuffering, externalSubtitles, gradient, accent, onActivity, onSeekBy, onTogglePlay, onFirstPlay },
  ref,
) {
  const [videoVisible, setVideoVisible] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const stallTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const internalRef = useRef<HTMLVideoElement | null>(null);

  // Merge forwarded ref with internal ref
  const setRefs = (el: HTMLVideoElement | null) => {
    internalRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) (ref as React.MutableRefObject<HTMLVideoElement | null>).current = el;
  };

  // Listen for playing event to fade in video
  useEffect(() => {
    const video = internalRef.current;
    if (!video) return;

    const onPlaying = () => {
      setVideoVisible(true);
      // Clear any pending stall spinner
      if (stallTimer.current) { clearTimeout(stallTimer.current); stallTimer.current = null; }
      setShowSpinner(false);
      onFirstPlay?.();
    };

    const onWaiting = () => {
      // Problem 4: Only show spinner after 800ms of stalling
      if (!stallTimer.current) {
        stallTimer.current = setTimeout(() => {
          setShowSpinner(true);
          stallTimer.current = null;
        }, 800);
      }
    };

    const onCanPlay = () => {
      if (stallTimer.current) { clearTimeout(stallTimer.current); stallTimer.current = null; }
      setShowSpinner(false);
    };

    video.addEventListener("playing", onPlaying);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);

    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      if (stallTimer.current) clearTimeout(stallTimer.current);
    };
  }, [onFirstPlay]);

  const [g0, g1, g2] = gradient.length >= 3 ? gradient : [gradient[0] ?? accent, accent, "#0A0A0A"];

  return (
    <div className="absolute inset-0" onMouseMove={onActivity} onTouchStart={onActivity}>
      {/* Gradient backdrop — always visible, prevents any blank/black frame */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(120% 120% at 50% 30%, ${g1} 0%, ${g0} 45%, ${g2} 100%)` }}
      />

      {/* Video element — starts invisible, fades in on first play */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={setRefs}
        className="absolute inset-0 h-full w-full bg-transparent"
        style={{
          opacity: videoVisible ? 1 : 0,
          transition: "opacity 400ms ease-in",
        }}
        playsInline
        preload="auto"
        crossOrigin="anonymous"
      >
        {externalSubtitles
          .filter((t) => t.src)
          .map((t) => (
            <track key={t.id} kind="subtitles" src={t.src} srcLang={t.lang} label={t.label} />
          ))}
      </video>

      {/* Double-click seek zones */}
      <button
        aria-label="Rewind 10 seconds"
        className="absolute inset-y-0 left-0 w-1/3"
        onClick={onTogglePlay}
        onDoubleClick={() => onSeekBy(-10)}
      />
      <button
        aria-label="Forward 10 seconds"
        className="absolute inset-y-0 right-0 w-1/3"
        onClick={onTogglePlay}
        onDoubleClick={() => onSeekBy(10)}
      />

      {/* Stall spinner — only shows after 800ms delay, subtle and centered */}
      {showSpinner && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-white/60" />
        </div>
      )}

      {/* Initial loading state (before video fades in) */}
      {!videoVisible && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-white/50" />
          <p className="animate-pulse text-sm text-foreground/50">Loading...</p>
        </div>
      )}
    </div>
  );
});
