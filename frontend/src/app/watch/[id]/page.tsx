import type { Metadata } from "next";
import { WatchExperience } from "@/features/watch/WatchExperience";

export const metadata: Metadata = {
  title: "Watch",
  description: "Title details — trailers, cast, reviews, and more.",
};

/** Movie/Show detail page. Server shell → client WatchExperience. */
export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WatchExperience id={id} />;
}
