"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, Film, TrendingUp, Users } from "lucide-react";
import { apiFetch } from "@/shared/lib/api-client";
import type { PosterCardItem } from "@/shared/components/PosterCard";

function StatCard({ icon: Icon, label, value, accent }: { icon: typeof Film; label: string; value: string | number; accent: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border glass p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}22` }}>
        <Icon className="h-6 w-6" style={{ color: accent }} />
      </div>
      <div>
        <p className="text-2xl font-display font-bold">{value}</p>
        <p className="text-sm text-foreground/60">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const all = await apiFetch<PosterCardItem[]>("/api/v1/content/trending?limit=50");
      const types = { movie: 0, series: 0 };
      all.forEach((t) => {
        if (t.content_type === "movie") types.movie++;
        else types.series++;
      });
      return { total: all.length, ...types, avgRating: (all.reduce((s, t) => s + t.rating, 0) / all.length).toFixed(1) };
    },
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-display font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Film} label="Total Titles" value={data?.total ?? "..."} accent="#E50914" />
        <StatCard icon={BarChart3} label="Movies" value={data?.movie ?? "..."} accent="#564DFF" />
        <StatCard icon={TrendingUp} label="Series" value={data?.series ?? "..."} accent="#2EE6A6" />
        <StatCard icon={Users} label="Avg Rating" value={data?.avgRating ?? "..."} accent="#FFD24D" />
      </div>
      <div className="mt-8 rounded-2xl border border-border glass p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Platform Overview</h2>
        <p className="text-sm text-foreground/60">Real-time analytics arrive in Phase 4. Currently showing catalog statistics from the content API.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-foreground/40">Content Types</p>
            <p className="mt-2 text-sm">{data?.movie ?? 0} movies, {data?.series ?? 0} series</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-foreground/40">Quality Available</p>
            <p className="mt-2 text-sm">480p, 720p, 1080p, 4K across catalog</p>
          </div>
        </div>
      </div>
    </div>
  );
}
