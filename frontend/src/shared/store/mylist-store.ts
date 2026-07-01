"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TitleCard } from "@/shared/types/content";

interface MyListState {
  items: Record<string, TitleCard>;
  toggle: (t: TitleCard) => void;
  has: (id: string) => boolean;
  list: () => TitleCard[];
}

/**
 * "My List" — persisted to localStorage so a user's saved titles survive
 * reloads. Stores the full card so we can render a My List rail without an
 * extra fetch. (Server-side persistence arrives with the user-profile API.)
 */
export const useMyList = create<MyListState>()(
  persist(
    (set, get) => ({
      items: {},
      toggle: (t) =>
        set((state) => {
          const next = { ...state.items };
          if (next[t.id]) delete next[t.id];
          else next[t.id] = t;
          return { items: next };
        }),
      has: (id) => !!get().items[id],
      list: () => Object.values(get().items),
    }),
    { name: "ott-mylist" },
  ),
);
