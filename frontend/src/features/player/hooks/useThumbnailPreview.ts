"use client";

import { useCallback, useEffect, useRef } from "react";
import { formatTime } from "../reducer";

/**
 * Lazily builds a detached <video> + <canvas> on the same HLS source to capture
 * a frame at a hovered time. Returns getPreview(sec) → { label, frame? }.
 * Frame capture is best-effort: on CORS taint / failure it returns just the
 * time label (graceful fallback, never throws into render).
 */
export function useThumbnailPreview(src: string | null) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const readyRef = useRef(false);

  useEffect(() => {
    if (!src || typeof document === "undefined") return;
    const video = document.createElement("video");
    video.muted = true;
    video.crossOrigin = "anonymous";
    video.preload = "auto";
    videoRef.current = video;
    canvasRef.current = document.createElement("canvas");
    canvasRef.current.width = 240;
    canvasRef.current.height = 135;

    let cancelled = false;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      readyRef.current = true;
    } else {
      import("hls.js").then(({ default: Hls }) => {
        if (cancelled) return;
        if (Hls.isSupported()) {
          const hls = new Hls({ capLevelToPlayerSize: true, maxBufferLength: 4 });
          hls.loadSource(src);
          hls.attachMedia(video);
          hlsRef.current = hls;
        } else {
          video.src = src;
        }
        readyRef.current = true;
      });
    }

    return () => {
      cancelled = true;
      hlsRef.current?.destroy();
      hlsRef.current = null;
      videoRef.current = null;
    };
  }, [src]);

  const getPreview = useCallback(async (sec: number): Promise<{ label: string; frame?: string }> => {
    const label = formatTime(sec);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !readyRef.current) return { label };

    try {
      await new Promise<void>((resolve, reject) => {
        const to = setTimeout(reject, 600);
        const onSeeked = () => {
          clearTimeout(to);
          video.removeEventListener("seeked", onSeeked);
          resolve();
        };
        video.addEventListener("seeked", onSeeked);
        video.currentTime = sec;
      });
      const ctx = canvas.getContext("2d");
      if (!ctx) return { label };
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return { label, frame: canvas.toDataURL("image/jpeg", 0.6) };
    } catch {
      return { label }; // timeout or tainted canvas → time-only
    }
  }, []);

  return getPreview;
}
