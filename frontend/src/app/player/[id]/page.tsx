import type { Metadata } from "next";
import { PlayerExperience } from "@/features/player/PlayerExperience";

export const metadata: Metadata = {
  title: "Player",
};

/** Custom HLS player route. Server shell → client PlayerExperience. */
export default async function PlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string; t?: string }>;
}) {
  const { id } = await params;
  const { ep, t } = await searchParams;
  const startAt = t ? Number(t) : 0;
  return <PlayerExperience id={id} episodeId={ep} startAt={Number.isFinite(startAt) ? startAt : 0} />;
}
