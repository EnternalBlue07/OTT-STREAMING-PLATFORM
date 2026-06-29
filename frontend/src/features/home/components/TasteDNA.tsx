"use client";

import { motion } from "framer-motion";
import { Dna } from "lucide-react";
import type { TasteDNA as TasteDNAT } from "../types";

/**
 * "Taste DNA" — an animated radar of genre affinity. Phase 1 derives this from
 * the catalog; later phases personalize it from DynamoDB watch events.
 */
export function TasteDNA({ data }: { data: TasteDNAT }) {
  const axes = data.profile.slice(0, 8);
  const n = axes.length;
  if (n < 3) return null;

  const size = 280;
  const c = size / 2;
  const r = c - 46;

  const point = (i: number, radius: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [c + Math.cos(angle) * radius, c + Math.sin(angle) * radius] as const;
  };

  const polygon = axes
    .map((a, i) => point(i, r * Math.max(0.08, a.affinity)).join(","))
    .join(" ");

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <section className="mb-12">
      <div className="mb-3 flex items-center gap-2">
        <Dna className="h-5 w-5 text-secondary" />
        <h2 className="font-display text-heading font-semibold">Your Taste DNA</h2>
      </div>

      <div className="flex flex-col items-center gap-6 rounded-3xl border border-border glass p-6 md:flex-row md:items-center md:gap-10">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
          <defs>
            <radialGradient id="dnaFill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#564DFF" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#E50914" stopOpacity="0.25" />
            </radialGradient>
          </defs>

          {/* grid rings */}
          {rings.map((ring) => (
            <polygon
              key={ring}
              points={axes.map((_, i) => point(i, r * ring).join(",")).join(" ")}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
          ))}
          {/* spokes */}
          {axes.map((_, i) => {
            const [x, y] = point(i, r);
            return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />;
          })}

          {/* affinity polygon */}
          <motion.polygon
            points={polygon}
            fill="url(#dnaFill)"
            stroke="#564DFF"
            strokeWidth={2}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            style={{ transformOrigin: "center" }}
          />

          {/* labels */}
          {axes.map((a, i) => {
            const [x, y] = point(i, r + 22);
            return (
              <text
                key={a.genre}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground/70"
                style={{ fontSize: 10 }}
              >
                {a.genre}
              </text>
            );
          })}
        </svg>

        <div className="min-w-0 flex-1">
          <p className="text-sm text-foreground/70">
            Based on {data.sample_size} titles, your strongest pull is toward{" "}
            <span className="font-semibold text-foreground">{data.top_genre}</span>.
          </p>
          <div className="mt-4 space-y-2">
            {axes.slice(0, 5).map((a, i) => (
              <div key={a.genre} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs text-foreground/60">{a.genre}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-secondary to-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(a.affinity * 100)}%` }}
                    transition={{ duration: 0.7, delay: 0.1 + i * 0.08 }}
                  />
                </div>
                <span className="w-9 text-right text-xs tabular-nums text-foreground/50">
                  {Math.round(a.affinity * 100)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
