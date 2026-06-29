"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Auto-hides controls after inactivity (when playing) and reveals them on
 * activity. Uses refs to avoid re-creating the callback on every state change
 * (which was causing infinite render loops).
 *
 * Returns markActivity() — call on pointer/key events.
 */
export function useControlsVisibility({
  onShow,
  onHide,
  isPlaying,
  delay = 3000,
}: {
  onShow: () => void;
  onHide: () => void;
  isPlaying: boolean;
  delay?: number;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const onShowRef = useRef(onShow);
  const onHideRef = useRef(onHide);

  // Keep refs current without triggering re-renders
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { onShowRef.current = onShow; }, [onShow]);
  useEffect(() => { onHideRef.current = onHide; }, [onHide]);

  const markActivity = useCallback(() => {
    onShowRef.current();
    if (timer.current) clearTimeout(timer.current);
    if (isPlayingRef.current) {
      timer.current = setTimeout(() => {
        onHideRef.current();
      }, delay);
    }
  }, [delay]); // only depends on delay (constant)

  // Start the auto-hide timer when playback starts, clear when paused
  useEffect(() => {
    if (isPlaying) {
      // Re-arm: hide after delay
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        onHideRef.current();
      }, delay);
    } else {
      // Paused: show controls, stop timer
      if (timer.current) { clearTimeout(timer.current); timer.current = null; }
      onShowRef.current();
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [isPlaying, delay]);

  return markActivity;
}
