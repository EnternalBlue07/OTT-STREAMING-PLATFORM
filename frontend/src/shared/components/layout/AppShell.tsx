"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useSession } from "@/shared/lib/auth-client";
import { useAuthStore } from "@/shared/store/auth-store";
import { cn } from "@/shared/lib/utils";
import { CommandPalette } from "@/shared/components/CommandPalette";
import { Footer } from "@/shared/components/layout/Footer";
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { Topbar } from "@/shared/components/layout/Topbar";

const MIN_WIDTH = 76;
const MAX_WIDTH = 360;
const DEFAULT_WIDTH = 256;

/**
 * AppShell: topbar + resizable sidebar + content + footer.
 * - Sidebar is drag-resizable on desktop and collapses below a threshold.
 * - Mobile uses an overlay drawer.
 * - Syncs the Better Auth session into the Zustand store.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dragging = useRef(false);

  const { data: session } = useSession();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? null,
        role: (session.user as { role?: string }).role ?? "user:free",
        emailVerified: !!session.user.emailVerified,
      });
    } else {
      setUser(null);
    }
  }, [session, setUser]);

  const onPointerDown = useCallback(() => {
    dragging.current = true;
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
      setWidth(next);
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const collapsed = width < 140;

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar onToggleSidebar={() => setMobileOpen((o) => !o)} />
      <CommandPalette />

      <div className="flex flex-1">
        {/* Desktop resizable sidebar */}
        <aside
          className="relative hidden shrink-0 border-r border-border bg-surface/30 md:block"
          style={{ width }}
        >
          <div className="sticky top-16 h-[calc(100vh-4rem)]">
            <Sidebar collapsed={collapsed} />
          </div>
          {/* Drag handle */}
          <div
            role="separator"
            aria-orientation="vertical"
            onPointerDown={onPointerDown}
            className="group absolute right-0 top-0 h-full w-1.5 cursor-col-resize"
          >
            <div className="mx-auto h-full w-px bg-border transition-colors group-hover:bg-secondary" />
          </div>
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMobileOpen(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <aside
              className="absolute left-0 top-0 h-full w-72 border-r border-border bg-background"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-16" />
              <Sidebar />
            </aside>
          </div>
        )}

        <main className={cn("min-w-0 flex-1")}>
          <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">{children}</div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
