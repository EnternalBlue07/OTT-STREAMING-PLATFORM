import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

/**
 * Beautiful empty state — icon halo, title, description, optional action.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/30 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 -z-10 rounded-full bg-secondary/30 blur-2xl" />
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl glass">
          <Icon className="h-7 w-7 text-foreground/80" />
        </div>
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
