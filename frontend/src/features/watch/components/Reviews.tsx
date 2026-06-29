"use client";

import { useState } from "react";
import { watchApi } from "../api";
import { useReviews } from "../hooks";
import type { ReviewSort } from "../types";
import { RatingBreakdown } from "./RatingBreakdown";
import { ReviewCard } from "./ReviewCard";

const SORTS: { id: ReviewSort; label: string }[] = [
  { id: "recent", label: "Most Recent" },
  { id: "helpful", label: "Most Helpful" },
  { id: "critical", label: "Critical" },
  { id: "positive", label: "Positive" },
];

export function Reviews({ contentId, accent }: { contentId: string; accent: string }) {
  const [sort, setSort] = useState<ReviewSort>("recent");
  const reviews = useReviews(contentId, sort);

  async function vote(reviewId: string, helpful: boolean) {
    await watchApi.voteReview(contentId, reviewId, helpful);
    reviews.refetch();
  }

  if (reviews.isLoading || !reviews.data) {
    return (
      <section className="mb-10">
        <h2 className="mb-3 font-display text-heading font-semibold">Reviews</h2>
        <div className="h-32 animate-pulse rounded-2xl bg-surface/60" />
      </section>
    );
  }

  return (
    <section className="mb-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-heading font-semibold">Reviews</h2>
        <div className="flex flex-wrap gap-1.5">
          {SORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                sort === s.id ? "border-transparent bg-secondary text-secondary-foreground" : "border-border glass text-foreground/70"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <RatingBreakdown breakdown={reviews.data.breakdown} accent={accent} />

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {reviews.data.items.map((r) => (
          <ReviewCard key={r.id} review={r} onVote={(helpful) => vote(r.id, helpful)} />
        ))}
      </div>
    </section>
  );
}
