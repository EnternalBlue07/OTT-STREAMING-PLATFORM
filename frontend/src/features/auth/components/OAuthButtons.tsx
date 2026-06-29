"use client";

import { signIn } from "@/shared/lib/auth-client";
import { Button } from "@/shared/components/ui/Button";

/** Social sign-in buttons. Providers that lack credentials simply fail
 *  gracefully server-side; they are shown as "ready" affordances. */
export function OAuthButtons({ callbackURL = "/" }: { callbackURL?: string }) {
  const social = (provider: "google" | "facebook" | "apple") => () =>
    signIn.social({ provider, callbackURL });

  return (
    <div className="grid grid-cols-3 gap-2">
      <Button variant="outline" size="md" type="button" onClick={social("google")}>
        Google
      </Button>
      <Button variant="outline" size="md" type="button" onClick={social("facebook")}>
        Facebook
      </Button>
      <Button variant="outline" size="md" type="button" onClick={social("apple")}>
        Apple
      </Button>
    </div>
  );
}
