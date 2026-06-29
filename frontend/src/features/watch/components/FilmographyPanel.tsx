"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useSimilar } from "../hooks";
import type { CastMember } from "../types";

/**
 * Slide-in filmography panel. Shows the person's role on this title plus a grid
 * of related titles on the platform they can jump to.
 *
 * Note: a true per-person filmography needs a shared cast index (future phase);
 * Phase 2 surfaces platform-related titles as the "Known for / Explore" set.
 */
export function FilmographyPanel({ person, contentId, onClose }: { person: CastMember | null; contentId: string; onClose: () => void }) {
  const { data: related } = useSimilar(contentId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {person && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110]" onClick={onClose}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-border bg-surface p-6"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">{person.name}</h2>
                <p className="text-sm text-foreground/60">
                  {person.role === "director" ? "Director" : `as ${person.character || "Cast"}`}
                </p>
              </div>
              <button onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full glass hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <h3 className="mb-3 font-display text-sm font-semibold text-foreground/80">Explore on the platform</h3>
            <div className="grid grid-cols-2 gap-3">
              {(related ?? []).slice(0, 6).map((t) => {
                const [g0, g1] = t.gradient.length >= 2 ? t.gradient : [t.accent, "#0A0A0A"];
                return (
                  <Link key={t.id} href={`/watch/${t.id}`} onClick={onClose} className="group relative aspect-[2/3] overflow-hidden rounded-xl border border-border">
                    {t.poster_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.poster_url} alt={t.title} className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <div className="absolute inset-0" style={{ background: `linear-gradient(155deg, ${g1}, ${g0}, #0A0A0A)` }} />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-2">
                      <p className="line-clamp-1 text-[11px] font-semibold">{t.title}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
