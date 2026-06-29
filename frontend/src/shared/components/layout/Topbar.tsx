"use client";

import { Bell, Command as CommandIcon, Menu, Search } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/shared/components/ui/Button";
import { useAuthStore } from "@/shared/store/auth-store";

export function Topbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { user, status } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/70 px-4 backdrop-blur-xl md:px-6">
      <button
        onClick={onToggleSidebar}
        className="rounded-lg p-2 text-foreground/70 hover:bg-white/5 hover:text-foreground md:hidden"
        aria-label="Toggle navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground shadow-glow-primary">
          O
        </span>
        <span className="hidden font-display text-lg font-semibold tracking-tight sm:inline">
          OTT<span className="text-primary">.</span>
        </span>
      </Link>

      <div className="ml-2 hidden max-w-md flex-1 items-center gap-2 rounded-xl border border-border bg-surface/50 px-3 py-2 text-sm text-muted md:flex">
        <Search className="h-4 w-4" />
        <span className="flex-1">Search titles, people, genres…</span>
        <kbd className="flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px]">
          <CommandIcon className="h-3 w-3" />K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="rounded-lg p-2 text-foreground/70 hover:bg-white/5 hover:text-foreground" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </button>

        {status === "authenticated" && user ? (
          <Link href="/profile" className="flex items-center gap-2 rounded-full border border-border bg-surface/60 py-1 pl-1 pr-3 hover:bg-white/5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </span>
            <span className="hidden text-sm sm:inline">{user.name || user.email}</span>
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Log in
            </Link>
            <Link href="/signup" className={buttonVariants({ variant: "primary", size: "sm" })}>
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
