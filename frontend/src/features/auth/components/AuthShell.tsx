"use client";

import type { ReactNode } from "react";
import { MeshGradient } from "@/shared/components/effects/MeshGradient";

/** Centered auth card on an animated mesh backdrop. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center py-10">
      <MeshGradient className="rounded-3xl opacity-60" />
      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-3xl p-8 shadow-elevation-4">
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
