import { cn } from "@/shared/lib/utils";

/**
 * Noise overlay — subtle film grain to remove banding and add texture.
 * Uses an inline SVG fractal-noise data URI (no network request).
 */
const NOISE_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>
       <filter id='n'>
         <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
       </filter>
       <rect width='100%' height='100%' filter='url(#n)' opacity='0.6'/>
     </svg>`,
  );

export function NoiseOverlay({ className, opacity = 0.04 }: { className?: string; opacity?: number }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 z-[1] mix-blend-overlay", className)}
      style={{ backgroundImage: `url("${NOISE_SVG}")`, opacity }}
    />
  );
}
