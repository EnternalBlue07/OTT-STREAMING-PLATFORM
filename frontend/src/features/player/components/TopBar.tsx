"use client";

import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";

interface Props {
  title: string;
  cinematic: boolean;
  visible: boolean;
  onBack: () => void;
  onToggleCinematic: () => void;
}

/** Player top bar: back, title, and cinematic-mode toggle. */
export function TopBar({ title, cinematic, visible, onBack, onToggleCinematic }: Props) {
  return (
    <div
      className={`absolute inset-x-0 top-0 z-20 flex items-center gap-3 bg-gradient-to-b from-black/70 to-transparent p-4 transition-opacity duration-300 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <button onClick={onBack} aria-label="Back" className="flex h-10 w-10 items-center justify-center rounded-full glass hover:bg-white/10">
        <ArrowLeft className="h-5 w-5" />
      </button>
      <h1 className="font-display text-lg font-semibold drop-shadow">{title}</h1>
      <button
        onClick={onToggleCinematic}
        aria-label="Cinematic mode"
        title="Cinematic mode (C)"
        className="ml-auto flex h-10 w-10 items-center justify-center rounded-full glass hover:bg-white/10"
      >
        {cinematic ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
      </button>
    </div>
  );
}
