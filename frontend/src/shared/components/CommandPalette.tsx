"use client";

import { Command } from "cmdk";
import { Compass, Film, Home, LayoutDashboard, LogIn, Search, Settings, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Action {
  group: string;
  label: string;
  icon: typeof Home;
  href?: string;
  shortcut?: string;
}

const ACTIONS: Action[] = [
  { group: "Navigation", label: "Home", icon: Home, href: "/" },
  { group: "Navigation", label: "Browse", icon: Compass, href: "/" },
  { group: "Navigation", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { group: "Navigation", label: "Search", icon: Search, href: "/" },
  { group: "Library", label: "Movies", icon: Film, href: "/" },
  { group: "Account", label: "Log in", icon: LogIn, href: "/login" },
  { group: "Account", label: "Sign up", icon: UserPlus, href: "/signup" },
  { group: "Account", label: "Settings", icon: Settings, href: "/profile" },
];

/** ⌘K / Ctrl-K command palette. */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function run(action: Action) {
    setOpen(false);
    if (action.href) router.push(action.href);
  }

  const groups = Array.from(new Set(ACTIONS.map((a) => a.group)));

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 p-4 pt-[18vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <Command
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border glass shadow-elevation-4"
        onClick={(e) => e.stopPropagation()}
        loop
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="h-4 w-4 text-muted" />
          <Command.Input
            autoFocus
            placeholder="Search or jump to…"
            className="h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
          />
          <kbd className="rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted">ESC</kbd>
        </div>
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="py-8 text-center text-sm text-muted">No results found.</Command.Empty>
          {groups.map((group) => (
            <Command.Group
              key={group}
              heading={group}
              className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted [&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:py-1.5"
            >
              {ACTIONS.filter((a) => a.group === group).map((a) => (
                <Command.Item
                  key={a.label}
                  onSelect={() => run(a)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground/90 transition-colors data-[selected=true]:bg-white/10 data-[selected=true]:text-foreground"
                >
                  <a.icon className="h-4 w-4" />
                  {a.label}
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
      </Command>
    </div>
  );
}
