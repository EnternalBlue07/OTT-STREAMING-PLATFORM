"use client";

import { useCallback, useEffect, useRef } from "react";
import { levelLabel, type PlayerAction } from "../reducer";
import type { AudioOption, AudioTrack, Level, SubtitleOption, SubtitleTrack } from "../types";

/**
 * Netflix-level HLS config:
 * - Aggressive pre-buffering (30s ahead, 60s max)
 * - High initial bandwidth estimate (5Mbps → starts at 720p+)
 * - Conservative upswitch (no jarring quality jumps)
 * - Web Worker offloads parsing from main thread
 * - Progressive mode starts playback on first segment
 * - Generous seek hole tolerance (smooth scrubbing)
 */
const HLS_CONFIG = {
  enableWorker: true,
  lowLatencyMode: false,
  progressive: true,
  startLevel: -1,
  abrEwmaDefaultEstimate: 5_000_000, // assume 5Mbps on first load
  abrEwmaFastLive: 3,
  abrEwmaSlowLive: 9,
  abrBandWidthFactor: 0.95,
  abrBandWidthUpFactor: 0.7,
  abrMaxWithRealBitrate: true,
  maxBufferLength: 30,
  maxMaxBufferLength: 60,
  maxBufferHole: 0.5,
  maxSeekHole: 2,
  nudgeMaxRetry: 5,
  capLevelToPlayerSize: true,
};

interface Args {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  src: string | null;
  dispatch: React.Dispatch<PlayerAction>;
  fallbackAudio: AudioTrack[];
  fallbackSubtitles: SubtitleTrack[];
  onFirstPlay?: () => void; // called when video actually starts playing
}

/**
 * Core HLS integration hook — Netflix-level performance.
 *
 * - Dynamic import (never in SSR bundle)
 * - Calls play() inside MANIFEST_PARSED (no waiting for canplaythrough)
 * - Clean destroy on unmount (no memory leak / background audio)
 * - Exposes quality/subtitle/audio selectors + error retry
 */
export function useHlsPlayer({ videoRef, src, dispatch, fallbackAudio, fallbackSubtitles, onFirstPlay }: Args) {
  const hlsRef = useRef<any>(null);
  const nativeRef = useRef(false);
  const destroyedRef = useRef(false);

  const init = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !src) return;
    destroyedRef.current = false;
    dispatch({ type: "SET_ERROR", value: null });
    dispatch({ type: "BUFFERING", value: true });

    // Native HLS (Safari / iOS)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      nativeRef.current = true;
      video.src = src;
      video.play().catch(() => {});
      dispatch({ type: "SET_LEVELS", levels: [] });
      seedFallbackTracks();
      return;
    }

    const { default: Hls } = await import("hls.js");
    if (destroyedRef.current) return; // unmounted during import

    if (!Hls.isSupported()) {
      video.src = src;
      video.play().catch(() => {});
      seedFallbackTracks();
      return;
    }

    const hls = new Hls(HLS_CONFIG);
    hlsRef.current = hls;
    hls.loadSource(src);
    hls.attachMedia(video);

    // Start playback immediately on manifest parse — Netflix approach
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (destroyedRef.current) return;
      const levels: Level[] = hls.levels.map((l: any, i: number) => ({
        index: i,
        height: l.height,
        bitrate: l.bitrate,
        label: levelLabel(l.height),
      }));
      dispatch({ type: "SET_LEVELS", levels });
      // Play immediately — don't wait for canplaythrough
      video.play().catch(() => dispatch({ type: "PAUSE" }));
    });

    hls.on(Hls.Events.LEVEL_SWITCHED, (_e: unknown, data: { level: number }) => {
      if (destroyedRef.current) return;
      dispatch({ type: "SET_ACTIVE_LEVEL", index: hls.currentLevel === -1 ? -1 : data.level });
    });

    hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, () => {
      if (destroyedRef.current) return;
      const tracks: SubtitleOption[] = hls.subtitleTracks.map((t: any, i: number) => ({
        id: String(t.id ?? i),
        label: t.name || t.lang || `Track ${i + 1}`,
        lang: t.lang || "",
      }));
      dispatch({ type: "SET_SUBTITLES", tracks: tracks.length ? tracks : toSubOptions(fallbackSubtitles), active: -1 });
    });

    hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, () => {
      if (destroyedRef.current) return;
      const tracks: AudioOption[] = hls.audioTracks.map((t: any, i: number) => ({
        id: String(t.id ?? i),
        label: t.name || t.lang || `Audio ${i + 1}`,
        lang: t.lang || "",
      }));
      dispatch({ type: "SET_AUDIO", tracks: tracks.length ? tracks : toAudioOptions(fallbackAudio), active: 0 });
    });

    hls.on(Hls.Events.ERROR, (_e: unknown, data: { fatal: boolean; type: string }) => {
      if (destroyedRef.current) return;
      if (!data.fatal) return;
      if (data.type === "networkError") {
        hls.startLoad();
      } else if (data.type === "mediaError") {
        hls.recoverMediaError();
      } else {
        dispatch({ type: "SET_ERROR", value: "Playback failed. Please retry." });
      }
    });

    seedFallbackTracks();

    function seedFallbackTracks() {
      dispatch({ type: "SET_SUBTITLES", tracks: toSubOptions(fallbackSubtitles), active: -1 });
      dispatch({ type: "SET_AUDIO", tracks: toAudioOptions(fallbackAudio), active: 0 });
    }
  }, [videoRef, src, dispatch, fallbackAudio, fallbackSubtitles]);

  // --- Clean destroy on unmount (Problem 6 fix) ---
  useEffect(() => {
    const video = videoRef.current; // capture ref value for cleanup
    init();
    return () => {
      destroyedRef.current = true;
      const hls = hlsRef.current;
      if (hls) {
        hls.destroy();
        hlsRef.current = null;
      }
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [init]);

  const setQuality = useCallback((index: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index;
      dispatch({ type: "SET_ACTIVE_LEVEL", index });
    }
  }, [dispatch]);

  const setSubtitle = useCallback((index: number) => {
    const video = videoRef.current;
    if (hlsRef.current) {
      hlsRef.current.subtitleTrack = index;
      hlsRef.current.subtitleDisplay = index >= 0;
    } else if (video) {
      Array.from(video.textTracks).forEach((t, i) => {
        t.mode = i === index ? "showing" : "disabled";
      });
    }
    dispatch({ type: "SET_ACTIVE_SUBTITLE", index });
  }, [videoRef, dispatch]);

  const setAudio = useCallback((index: number) => {
    if (hlsRef.current) hlsRef.current.audioTrack = index;
    dispatch({ type: "SET_ACTIVE_AUDIO", index });
  }, [dispatch]);

  const retry = useCallback(() => {
    const hls = hlsRef.current;
    const video = videoRef.current;
    if (hls) { hls.destroy(); hlsRef.current = null; }
    if (video) { video.pause(); video.removeAttribute("src"); video.load(); }
    init();
  }, [init, videoRef]);

  return { setQuality, setSubtitle, setAudio, retry };
}

function toSubOptions(tracks: SubtitleTrack[]): SubtitleOption[] {
  return tracks.map((t) => ({ id: t.id, label: t.label, lang: t.lang }));
}
function toAudioOptions(tracks: AudioTrack[]): AudioOption[] {
  return tracks.map((t) => ({ id: t.id, label: t.label, lang: t.lang }));
}
