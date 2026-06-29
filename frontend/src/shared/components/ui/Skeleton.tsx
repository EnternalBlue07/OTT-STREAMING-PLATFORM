import { cn } from "@/shared/lib/utils";

/**
 * Premium skeleton loader — an animated gradient sweep (not an opacity fade).
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-white/5",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer",
        "after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent",
        className,
      )}
    />
  );
}

export function SkeletonRow() {
  return (
    <div className="flex gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-40 w-28 shrink-0 md:h-56 md:w-40" />
      ))}
    </div>
  );
}
