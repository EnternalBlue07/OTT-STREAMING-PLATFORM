"use client";

import { useEffect } from "react";

interface Handlers {
  togglePlay: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  toggleCinematic: () => void;
  seekBy: (delta: number) => void;
  adjustVolume: (delta: number) => void;
  onEscape: () => void;
}

function isTyping(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null;
  if (!node) return false;
  const tag = node.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || node.isContentEditable;
}

/** Player keyboard shortcuts: Space, M, F, C, arrows. Ignored while typing. */
export function usePlayerKeyboard(h: Handlers) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      switch (e.key) {
        case " ":
        case "Spacebar":
          e.preventDefault();
          h.togglePlay();
          break;
        case "m":
        case "M":
          h.toggleMute();
          break;
        case "f":
        case "F":
          h.toggleFullscreen();
          break;
        case "c":
        case "C":
          h.toggleCinematic();
          break;
        case "ArrowLeft":
          e.preventDefault();
          h.seekBy(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          h.seekBy(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          h.adjustVolume(0.1);
          break;
        case "ArrowDown":
          e.preventDefault();
          h.adjustVolume(-0.1);
          break;
        case "Escape":
          h.onEscape();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [h]);
}
