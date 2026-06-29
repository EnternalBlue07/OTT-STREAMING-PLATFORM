"use client";

import { BadgeCheck, EyeOff, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import type { Review } from "../types";

/** A single review: rating, verified badge, spoiler toggle, helpful voting. */
export function ReviewCard({ review, onVote }: { review: Review; onVote: (helpful: boolean) => void }) {
  const [revealed, setRevealed] = useState(false);
  const date = review.created_at ? new Date(review.created_at).toLocaleDateString() : "";
  const hidden = review.has_spoilers && !revealed;

  return (
    <div className="rounded-2xl border border-border bg-white/5 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="font-semibold">{review.author}</span>
        {review.verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
            <BadgeCheck className="h-3 w-3" /> Verified viewer
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-1 text-sm">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-current text-warning" : "text-white/15"}`} />
          ))}
        </span>
      </div>

      {hidden ? (
        <button onClick={() => setRevealed(true)} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-foreground/60 hover:text-foreground">
          <EyeOff className="h-4 w-4" /> Spoiler — tap to reveal
        </button>
      ) : (
        <p className="text-sm text-foreground/80">{review.body}</p>
      )}

      <div className="mt-3 flex items-center gap-3 text-xs text-foreground/50">
        <span>{date}</span>
        <button onClick={() => onVote(true)} className="ml-auto inline-flex items-center gap-1 hover:text-foreground">
          <ThumbsUp className="h-3.5 w-3.5" /> {review.helpful}
        </button>
        <button onClick={() => onVote(false)} className="inline-flex items-center gap-1 hover:text-foreground">
          <ThumbsDown className="h-3.5 w-3.5" /> {review.not_helpful}
        </button>
      </div>
    </div>
  );
}
