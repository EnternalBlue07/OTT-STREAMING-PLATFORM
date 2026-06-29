"use client";

import { Activity, DollarSign, Film, Users } from "lucide-react";
import { GlassCard } from "@/shared/components/effects/GlassCard";

const STATS = [
  { label: "Active Viewers", value: "—", icon: Users, hint: "wired in Phase 4" },
  { label: "Titles", value: "—", icon: Film, hint: "content service pending" },
  { label: "MRR", value: "—", icon: DollarSign, hint: "billing in Phase 5" },
  { label: "p95 Video Start", value: "—", icon: Activity, hint: "player in Phase 3" },
];

/** Admin/analytics dashboard placeholder cards. */
export function DashboardCards() {
  return (
    <section className="mb-12">
      <h2 className="mb-4 font-display text-heading font-semibold">Overview</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <GlassCard key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-secondary" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold">{s.value}</p>
            <p className="mt-1 text-xs text-muted">{s.hint}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
