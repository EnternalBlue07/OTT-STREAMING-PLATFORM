"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { SkeletonRow } from "@/shared/components/ui/Skeleton";
import { useTitleDetail } from "./hooks";
import type { CastMember } from "./types";
import { WatchBanner } from "./components/WatchBanner";
import { WatchActions } from "./components/WatchActions";
import { SynopsisBlock } from "./components/SynopsisBlock";
import { TrailersRow } from "./components/TrailersRow";
import { CastRow } from "./components/CastRow";
import { FilmographyPanel } from "./components/FilmographyPanel";
import { EpisodeList } from "./components/EpisodeList";
import { Reviews } from "./components/Reviews";
import { ContentInfoPanel } from "./components/ContentInfoPanel";
import { RelatedRows } from "./components/RelatedRows";

export function WatchExperience({ id }: { id: string }) {
  const detail = useTitleDetail(id);
  const [person, setPerson] = useState<CastMember | null>(null);

  if (detail.isLoading) {
    return (
      <div className="space-y-8">
        <div className="-mx-4 -mt-8 min-h-[60vh] w-full animate-pulse rounded-3xl bg-surface/60 sm:aspect-[21/9] md:mx-0" />
        <SkeletonRow />
      </div>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="We couldn't find that title"
        description="It may have been removed or the link is wrong."
        action={
          <Link href="/">
            <Button variant="glass">Back to Home</Button>
          </Link>
        }
      />
    );
  }

  const title = detail.data;

  return (
    <div>
      <WatchBanner title={title} />
      <WatchActions title={title} />
      <SynopsisBlock text={title.synopsis} />
      <TrailersRow trailers={title.trailers} accent={title.accent} />
      <CastRow cast={title.cast} accent={title.accent} onSelect={setPerson} />
      <EpisodeList contentId={id} contentType={title.content_type} accent={title.accent} />
      <RelatedRows id={id} />
      <Reviews contentId={id} accent={title.accent} />
      <ContentInfoPanel info={title.content_info} genres={title.genres} />
      <FilmographyPanel person={person} contentId={id} onClose={() => setPerson(null)} />
    </div>
  );
}
