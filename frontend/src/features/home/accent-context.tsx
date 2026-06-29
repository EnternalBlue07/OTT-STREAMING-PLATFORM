"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface AccentState {
  accent: string;
  setAccent: (hex: string) => void;
}

const AccentContext = createContext<AccentState | null>(null);

const DEFAULT_ACCENT = "#564DFF";

export function AccentProvider({ children }: { children: ReactNode }) {
  const [accent, setAccent] = useState(DEFAULT_ACCENT);
  const value = useMemo(() => ({ accent, setAccent }), [accent]);
  return <AccentContext.Provider value={value}>{children}</AccentContext.Provider>;
}

export function useAccent(): AccentState {
  const ctx = useContext(AccentContext);
  if (!ctx) return { accent: DEFAULT_ACCENT, setAccent: () => {} };
  return ctx;
}
