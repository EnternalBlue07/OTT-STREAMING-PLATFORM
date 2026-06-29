"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { TitleCard } from "./types";
import { TitleModal } from "./components/TitleModal";
import { PlayerOverlay } from "./components/PlayerOverlay";

interface TitleActions {
  openDetail: (id: string) => void;
  play: (t: { id: string; title: string; accent: string; gradient: string[] }) => void;
}

const Ctx = createContext<TitleActions | null>(null);

/**
 * Provides the two primary title actions to the whole tree:
 *  - openDetail(id): opens the big expanded detail card (fetches detail + similar)
 *  - play(title): opens the cinematic player overlay
 * Rendering the surfaces here keeps a single instance and a clean z-stack.
 */
export function TitleActionsProvider({ children }: { children: ReactNode }) {
  const [detailId, setDetailId] = useState<string | null>(null);
  const [playing, setPlaying] = useState<TitleActionsPlaying | null>(null);

  const openDetail = useCallback((id: string) => setDetailId(id), []);
  const play = useCallback((t: TitleActionsPlaying) => setPlaying(t), []);

  const value = useMemo(() => ({ openDetail, play }), [openDetail, play]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <TitleModal
        id={detailId}
        onClose={() => setDetailId(null)}
        onPlay={play}
        onOpenDetail={openDetail}
      />
      <PlayerOverlay title={playing} onClose={() => setPlaying(null)} />
    </Ctx.Provider>
  );
}

type TitleActionsPlaying = { id: string; title: string; accent: string; gradient: string[] };

export function useTitleActions(): TitleActions {
  const ctx = useContext(Ctx);
  if (!ctx) return { openDetail: () => {}, play: () => {} };
  return ctx;
}

export type { TitleCard };
