"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/shared/lib/auth-client";

/**
 * Guards login-gated routes (/watch, /player). Redirects unauthenticated users
 * to /login. Lenient in local dev (does not redirect) so the pages stay
 * testable without an account; enforced in production.
 *
 * Returns `ready` (safe to render protected content) and `authed`.
 */
export function useAuthGuard(): { ready: boolean; authed: boolean } {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const bypass = process.env.NODE_ENV !== "production";
  const authed = !!session?.user;

  useEffect(() => {
    if (!isPending && !authed && !bypass) {
      router.replace("/login");
    }
  }, [isPending, authed, bypass, router]);

  // In production, never expose protected content until authed.
  const ready = bypass ? !isPending : !isPending && authed;
  return { ready, authed };
}
