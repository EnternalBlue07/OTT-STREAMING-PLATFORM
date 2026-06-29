"use client";

import { Clapperboard, Compass, CreditCard, Heart, History, Home, LayoutDashboard, Settings, Sparkles, TrendingUp, Upload } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";

const NAV = [
  { section: "Discover", items: [
    { label: "Home", icon: Home, href: "/" },
    { label: "Browse", icon: Compass, href: "/browse" },
    { label: "Trending", icon: TrendingUp, href: "/trending" },
    { label: "For You", icon: Sparkles, href: "/for-you" },
  ]},
  { section: "Library", items: [
    { label: "Continue Watching", icon: History, href: "/continue" },
    { label: "My List", icon: Heart, href: "/my-list" },
    { label: "Originals", icon: Clapperboard, href: "/originals" },
  ]},
  { section: "Manage", items: [
    { label: "Content Studio", icon: Upload, href: "/admin" },
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Pricing", icon: CreditCard, href: "/pricing" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ]},
];

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto scrollbar-none p-3">
      {NAV.map((group) => (
        <div key={group.section}>
          {!collapsed && (
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              {group.section}
            </p>
          )}
          <ul className="flex flex-col gap-1">
            {group.items.map((item) => {
              const active = pathname === item.href && item.href !== "/";
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150",
                      active
                        ? "bg-white/10 text-foreground"
                        : "text-foreground/70 hover:bg-white/5 hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0 transition-transform duration-150 group-hover:scale-110" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
