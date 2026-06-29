"use client";

import Link from "next/link";
import type { ContentInfo } from "../types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-foreground/45">{label}</dt>
      <dd className="mt-1 text-sm text-foreground/85">{children}</dd>
    </div>
  );
}

/** Audio/subtitle/accessibility/warning/studio + clickable genre tags. */
export function ContentInfoPanel({ info, genres }: { info: ContentInfo; genres: string[] }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 font-display text-heading font-semibold">Details</h2>
      <div className="rounded-2xl border border-border glass p-5">
        <dl className="grid grid-cols-2 gap-5 md:grid-cols-3">
          <Field label="Audio">{info.audio_languages?.join(", ")}</Field>
          <Field label="Subtitles">{info.subtitle_languages?.join(", ")}</Field>
          <Field label="Accessibility">{info.accessibility?.join(", ")}</Field>
          <Field label="Studio">{info.studio}</Field>
          <Field label="Release date">{info.release_date}</Field>
          <Field label="Content warning">{info.content_warning}</Field>
        </dl>

        {genres.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs uppercase tracking-wide text-foreground/45">Genres</p>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <Link
                  key={g}
                  href={`/?genre=${encodeURIComponent(g)}`}
                  className="rounded-full border border-border px-3 py-1 text-xs text-foreground/75 transition-colors hover:border-secondary hover:text-foreground"
                >
                  {g}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
