"use client";

import { PosterRow } from "@/shared/components/PosterRow";
import { useSimilar } from "../hooks";

/** "More Like This" — related titles that navigate to their own watch page. */
export function RelatedRows({ id }: { id: string }) {
  const { data } = useSimilar(id);
  if (!data || data.length === 0) return null;
  return <PosterRow title="More Like This" items={data} />;
}
