"use client";

import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

/**
 * Spotlight — a radial highlight that follows the pointer across a surface.
 * Wrap any container to give it depth on hover.
 */
export function Spotlight({
  children,
  className,
  color = "rgba(86,77,255,0.18)",
}: {
  children?: ReactNode;
  className?: string;
  color?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={cn("relative overflow-hidden", className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: active ? 1 : 0,
          background: `radial-gradient(420px circle at ${pos.x}px ${pos.y}px, ${color}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}
