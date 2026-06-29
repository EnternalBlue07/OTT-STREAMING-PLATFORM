"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PictureInPicture2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Trailer } from "../types";

/**
 * Inline trailer lightbox. Plays the trailer's HLS source (hls.js, or native on
 * Safari) with native controls (this is a trailer, not the gated main player)
 * plus a Picture-in-Picture button. Closes via button/backdrop/Esc.
 */
export function InlineTrailerPlayer({ trailer, onClose }: { trailer: Trailer | null; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const video = videoRef.current;
    if (!trailer || !video) return;
    let hls: { destroy: () => void } | null = null;
    let cancelled = false;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = trailer.src;
    } else {
      import("hls.js").then(({ default: Hls }) => {
        if (cancelled || !video) return;
        if (Hls.isSupported()) {
          const inst = new Hls();
          inst.loadSource(trailer.src);
          inst.attachMedia(video);
          hls = inst;
        } else {
          video.src = trailer.src;
        }
      });
    }
    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [trailer]);

  async function pip() {
    try {
      await videoRef.current?.requestPictureInPicture();
    } catch {
      /* PiP may be unsupported/blocked */
    }
  }

  return (
    <AnimatePresence>
      {trailer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-black shadow-elevation-4"
          >
            <div className="flex items-center justify-between border-b border-border p-3">
              <h3 className="font-display text-sm font-semibold">{trailer.title}</h3>
              <div className="flex items-center gap-2">
                <button onClick={pip} aria-label="Picture in picture" className="flex h-8 w-8 items-center justify-center rounded-lg glass hover:bg-white/10">
                  <PictureInPicture2 className="h-4 w-4" />
                </button>
                <button onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg glass hover:bg-white/10">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video ref={videoRef} controls autoPlay className="aspect-video w-full bg-black" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
