"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Minimize2, PictureInPicture2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { playerApi } from "./api";
import { useHlsPlayer } from "./hooks/useHlsPlayer";
import { useThumbnailPreview } from "./hooks/useThumbnailPreview";
import { useControlsVisibility } from "./hooks/useControlsVisibility";
import { usePlayerKeyboard } from "./hooks/usePlayerKeyboard";
import { clamp, initialPlayerState, playerReducer } from "./reducer";
import { usePlayerPrefs } from "./store/player-prefs";
import { ControlBar } from "./components/ControlBar";
import { PlayerError } from "./components/PlayerError";
import { SettingsMenu } from "./components/SettingsMenu";
import { SmartSkipButtons } from "./components/SmartSkipButtons";
import { TopBar } from "./components/TopBar";
import { VideoSurface } from "./components/VideoSurface";

export interface PlayerExperienceProps {
  id: string;
  episodeId?: string;
  startAt?: number;
}

export function PlayerExperience({ id, episodeId, startAt = 0 }: PlayerExperienceProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(playerReducer, initialPlayerState);
  const prefs = usePlayerPrefs();

  const playback = useQuery({
    queryKey: ["playback", id, episodeId ?? null],
    queryFn: () => playerApi.playback(id, episodeId),
  });

  const data = playback.data;
  const getPreview = useThumbnailPreview(data?.hls_url ?? null);

  const { setQuality, setSubtitle, setAudio, retry } = useHlsPlayer({
    videoRef,
    src: data?.hls_url ?? null,
    dispatch,
    fallbackAudio: data?.audio_tracks ?? [],
    fallbackSubtitles: data?.subtitle_tracks ?? [],
  });

  // --- Media element event wiring ---
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !data) return;

    const onPlay = () => dispatch({ type: "PLAY" });
    const onPause = () => dispatch({ type: "PAUSE" });

    // Throttle timeupdate to ~4 dispatches/sec max (avoids render cascade)
    let lastTimeDispatch = 0;
    const onTime = () => {
      const now = performance.now();
      if (now - lastTimeDispatch > 250) {
        lastTimeDispatch = now;
        dispatch({ type: "TIME", value: v.currentTime });
      }
    };

    const onDur = () => dispatch({ type: "DURATION", value: v.duration || 0 });
    const onWaiting = () => dispatch({ type: "BUFFERING", value: true });
    const onPlaying = () => {
      dispatch({ type: "BUFFERING", value: false });
      dispatch({ type: "PLAY" });
    };
    const onProgress = () => {
      try {
        if (v.buffered.length) dispatch({ type: "BUFFERED", value: v.buffered.end(v.buffered.length - 1) });
      } catch {
        /* ignore */
      }
    };
    const onEnterPip = () => dispatch({ type: "SET_PIP", value: true });
    const onLeavePip = () => dispatch({ type: "SET_PIP", value: false });
    const onMeta = () => {
      v.volume = prefs.volume;
      v.muted = prefs.muted;
      v.playbackRate = prefs.playbackRate;
      if (startAt > 0) v.currentTime = startAt;
      v.play().catch(() => dispatch({ type: "PAUSE" }));
    };

    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("durationchange", onDur);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("progress", onProgress);
    v.addEventListener("enterpictureinpicture", onEnterPip);
    v.addEventListener("leavepictureinpicture", onLeavePip);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("durationchange", onDur);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("progress", onProgress);
      v.removeEventListener("enterpictureinpicture", onEnterPip);
      v.removeEventListener("leavepictureinpicture", onLeavePip);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // --- Imperative actions (shared with control components in later tasks) ---
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);

  const seekTo = useCallback((sec: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = clamp(sec, 0, v.duration || sec);
  }, []);

  const seekBy = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = clamp(v.currentTime + delta, 0, v.duration || v.currentTime + delta);
  }, []);

  const setVolume = useCallback((v: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.volume = v;
    vid.muted = v === 0;
    prefs.set({ volume: v, muted: v === 0 });
  }, [prefs]);

  const toggleMute = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    prefs.set({ muted: vid.muted });
  }, [prefs]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen?.().catch(() => {});
  }, []);

  const [mini, setMini] = useState(false);

  const setRate = useCallback((r: number) => {
    const vid = videoRef.current;
    if (vid) vid.playbackRate = r;
    prefs.set({ playbackRate: r });
  }, [prefs]);

  const togglePip = useCallback(async () => {
    const vid = videoRef.current;
    if (!vid) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await vid.requestPictureInPicture();
    } catch {
      /* PiP unsupported/blocked */
    }
  }, []);

  const goToNextEpisode = useCallback(() => {
    if (data?.next_episode_id) router.push(`/player/${id}?ep=${data.next_episode_id}`);
  }, [data?.next_episode_id, id, router]);

  const toggleCinematic = useCallback(() => dispatch({ type: "TOGGLE_CINEMATIC" }), []);

  const adjustVolume = useCallback((delta: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    const next = clamp((vid.muted ? 0 : vid.volume) + delta, 0, 1);
    vid.volume = next;
    vid.muted = next === 0;
    prefs.set({ volume: next, muted: next === 0 });
  }, [prefs]);

  // Controls auto-hide + activity tracking.
  const markActivity = useControlsVisibility({
    onShow: () => dispatch({ type: "SHOW_CONTROLS" }),
    onHide: () => dispatch({ type: "HIDE_CONTROLS" }),
    isPlaying: state.isPlaying,
  });

  // Keyboard shortcuts.
  usePlayerKeyboard({
    togglePlay,
    toggleMute,
    toggleFullscreen,
    toggleCinematic,
    seekBy,
    adjustVolume,
    onEscape: () => {
      if (state.cinematic) dispatch({ type: "TOGGLE_CINEMATIC" });
    },
  });

  if (playback.isLoading) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-surface via-background to-surface" />
        <Loader2 className="relative h-10 w-10 animate-spin text-white/50" />
        <p className="relative mt-3 animate-pulse text-sm text-foreground/50">Loading...</p>
      </div>
    );
  }

  if (playback.isError || !data) {
    return (
      <div className="fixed inset-0 z-[60] bg-black">
        <PlayerError error="We couldn't load this video." onRetry={() => playback.refetch()} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={
        mini
          ? "fixed bottom-4 right-4 z-[60] aspect-video w-80 overflow-hidden rounded-xl border border-border bg-black shadow-elevation-4"
          : "fixed inset-0 z-[60] overflow-hidden bg-black"
      }
    >
      <VideoSurface
        ref={videoRef}
        isBuffering={state.isBuffering}
        externalSubtitles={data.subtitle_tracks}
        gradient={data.gradient ?? []}
        accent={data.accent ?? "#564DFF"}
        onActivity={markActivity}
        onSeekBy={seekBy}
        onTogglePlay={togglePlay}
      />

      {/* Top bar (hidden in cinematic mode and mini mode) */}
      {!mini && (
        <TopBar
          title={data.title}
          cinematic={state.cinematic}
          visible={state.showControls && !state.cinematic}
          onBack={() => router.back()}
          onToggleCinematic={toggleCinematic}
        />
      )}

      {!mini && (
        <SmartSkipButtons
          markers={data.skip_markers}
          currentTime={state.currentTime}
          duration={state.duration}
          nextEpisodeId={data.next_episode_id}
          onSkip={seekTo}
          onNext={goToNextEpisode}
        />
      )}

      <ControlBar
        state={state}
        accent="#E50914"
        volume={prefs.volume}
        muted={prefs.muted}
        getPreview={getPreview}
        actions={{ togglePlay, seekTo, setVolume, toggleMute, toggleFullscreen }}
        rightSlot={
          <>
            <SettingsMenu
              levels={state.levels}
              activeLevel={state.activeLevel}
              onQuality={setQuality}
              rate={prefs.playbackRate}
              onRate={setRate}
              subtitleTracks={state.subtitleTracks}
              activeSubtitle={state.activeSubtitle}
              onSubtitle={setSubtitle}
              audioTracks={state.audioTracks}
              activeAudio={state.activeAudio}
              onAudio={setAudio}
            />
            <button onClick={togglePip} aria-label="Picture in picture" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10">
              <PictureInPicture2 className="h-5 w-5" />
            </button>
            <button onClick={() => setMini((m) => !m)} aria-label="Mini player" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10">
              <Minimize2 className="h-5 w-5" />
            </button>
          </>
        }
      />

      <PlayerError error={state.error} onRetry={retry} />
    </div>
  );
}
