"use client";

import { Check, Download, Play, Plus, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TitleCard } from "@/shared/types/content";
import { Button } from "@/shared/components/ui/Button";
import { useMyList } from "@/shared/store/mylist-store";
import type { WatchDetail } from "../types";

/**
 * Primary actions: large red Play (→ /player/[id]), Watchlist toggle (persisted),
 * Share (copies URL), and a premium-gated Download.
 */
export function WatchActions({ title }: { title: WatchDetail }) {
  const router = useRouter();
  const { has, toggle } = useMyList();
  const saved = has(title.id);
  const [copied, setCopied] = useState(false);

  async function share() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/watch/${title.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard may be blocked; ignore */
    }
  }

  return (
    <div className="mb-8 flex flex-wrap items-center gap-3">
      <Button
        size="lg"
        className="gap-2"
        style={{ backgroundColor: "#E50914", boxShadow: "0 0 40px rgba(229,9,20,0.45)" }}
        onClick={() => router.push(`/player/${title.id}`)}
      >
        <Play className="h-5 w-5 fill-current" /> Play
      </Button>

      <Button size="lg" variant="glass" className="gap-2" onClick={() => toggle(title as unknown as TitleCard)}>
        {saved ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        {saved ? "In Watchlist" : "Watchlist"}
      </Button>

      <Button size="lg" variant="ghost" className="gap-2" onClick={share}>
        <Share2 className="h-5 w-5" /> {copied ? "Link copied" : "Share"}
      </Button>

      <Button size="lg" variant="ghost" className="gap-2" title="Premium feature">
        <Download className="h-5 w-5" /> Download
      </Button>
    </div>
  );
}
