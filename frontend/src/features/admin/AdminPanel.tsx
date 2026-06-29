"use client";

import { useQuery } from "@tanstack/react-query";
import { Film, ImagePlus, Loader2, Plus, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { adminApi, type CreatePayload } from "./api";

const TYPES = [
  { id: "movie", label: "Movie" },
  { id: "web-series", label: "Web Series" },
  { id: "tv-series", label: "TV Series" },
];
const MOODS = ["late-night", "adrenaline", "comfort", "mind-bending", "heartfelt", "epic"];
const QUALITY_LABELS = ["480p", "720p", "1080p", "4K"] as const;
const MATURITIES = ["U", "PG", "PG-13", "TV-14", "TV-MA", "R"];

const csv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

interface QualityRow {
  enabled: boolean;
  size_mb: number;
  audio: string;
}

const emptyForm = {
  title: "",
  content_type: "movie",
  tagline: "",
  synopsis: "",
  year: new Date().getFullYear(),
  runtime_min: 0,
  maturity: "PG-13",
  rating: 7.5,
  trending_score: 75,
  accent: "#564DFF",
  genres: "",
  languages: "Hindi, English",
  ott: "",
  vibe_tags: "",
  badges: "",
};

const field = "w-full rounded-xl border border-border bg-white/5 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-secondary";
const label = "mb-1.5 block text-xs font-medium text-foreground/70";

export function AdminPanel() {
  const [form, setForm] = useState(emptyForm);
  const [moods, setMoods] = useState<string[]>([]);
  const [quals, setQuals] = useState<Record<string, QualityRow>>({
    "480p": { enabled: true, size_mb: 350, audio: "Hindi-English" },
    "720p": { enabled: true, size_mb: 950, audio: "Hindi-English" },
    "1080p": { enabled: true, size_mb: 2300, audio: "Hindi-English" },
    "4K": { enabled: false, size_mb: 8200, audio: "Hindi-English" },
  });
  const [poster, setPoster] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const list = useQuery({ queryKey: ["admin-content"], queryFn: adminApi.list });

  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  function onPoster(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setPoster(f);
    setPosterPreview(f ? URL.createObjectURL(f) : null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!form.title.trim()) {
      setMsg({ kind: "err", text: "Title is required." });
      return;
    }
    setBusy(true);
    try {
      const qualities = QUALITY_LABELS.filter((l) => quals[l].enabled).map((l) => ({
        label: l,
        size_mb: Number(quals[l].size_mb) || 0,
        source_url: "",
        audio: quals[l].audio || "Original",
      }));

      const payload: CreatePayload = {
        title: form.title.trim(),
        content_type: form.content_type,
        tagline: form.tagline,
        synopsis: form.synopsis,
        year: Number(form.year),
        runtime_min: Number(form.runtime_min),
        maturity: form.maturity,
        rating: Number(form.rating),
        trending_score: Number(form.trending_score),
        accent: form.accent,
        genres: csv(form.genres),
        languages: csv(form.languages),
        ott: csv(form.ott),
        vibe_tags: csv(form.vibe_tags),
        badges: csv(form.badges),
        moods,
        qualities,
      };

      const created = await adminApi.create(payload);
      if (poster) await adminApi.uploadPoster(created.id, poster);

      setMsg({ kind: "ok", text: `"${created.title}" published — it's live in the catalog now.` });
      setForm(emptyForm);
      setMoods([]);
      setPoster(null);
      setPosterPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      list.refetch();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    await adminApi.remove(id);
    list.refetch();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl glass">
          <Film className="h-6 w-6 text-secondary" />
        </div>
        <div>
          <h1 className="font-display text-heading font-bold">Content Studio</h1>
          <p className="text-sm text-foreground/60">Upload movies & series — posters, quality ladders, the works.</p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Form */}
        <form onSubmit={submit} className="space-y-6 rounded-3xl border border-border glass p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={label}>Title *</label>
              <input className={field} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. The Signal Horizon" />
            </div>

            <div>
              <label className={label}>Type</label>
              <select className={field} value={form.content_type} onChange={(e) => set("content_type", e.target.value)}>
                {TYPES.map((t) => <option key={t.id} value={t.id} className="bg-surface">{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Maturity</label>
              <select className={field} value={form.maturity} onChange={(e) => set("maturity", e.target.value)}>
                {MATURITIES.map((m) => <option key={m} value={m} className="bg-surface">{m}</option>)}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className={label}>Tagline</label>
              <input className={field} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="One punchy line" />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Synopsis</label>
              <textarea className={`${field} min-h-[88px] resize-y`} value={form.synopsis} onChange={(e) => set("synopsis", e.target.value)} placeholder="What's it about?" />
            </div>

            <div>
              <label className={label}>Year</label>
              <input type="number" className={field} value={form.year} onChange={(e) => set("year", e.target.value)} />
            </div>
            <div>
              <label className={label}>Runtime (min)</label>
              <input type="number" className={field} value={form.runtime_min} onChange={(e) => set("runtime_min", e.target.value)} />
            </div>
            <div>
              <label className={label}>Rating (0–10)</label>
              <input type="number" step="0.1" min="0" max="10" className={field} value={form.rating} onChange={(e) => set("rating", e.target.value)} />
            </div>
            <div>
              <label className={label}>Trending score</label>
              <input type="number" className={field} value={form.trending_score} onChange={(e) => set("trending_score", e.target.value)} />
            </div>

            <div>
              <label className={label}>Genres (comma-separated)</label>
              <input className={field} value={form.genres} onChange={(e) => set("genres", e.target.value)} placeholder="Sci-Fi, Thriller" />
            </div>
            <div>
              <label className={label}>Languages</label>
              <input className={field} value={form.languages} onChange={(e) => set("languages", e.target.value)} placeholder="Hindi, English" />
            </div>
            <div>
              <label className={label}>OTT / labels</label>
              <input className={field} value={form.ott} onChange={(e) => set("ott", e.target.value)} placeholder="Dual Audio, 4K MOVIES" />
            </div>
            <div>
              <label className={label}>Badges</label>
              <input className={field} value={form.badges} onChange={(e) => set("badges", e.target.value)} placeholder="New, Top 10" />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Vibe tags</label>
              <input className={field} value={form.vibe_tags} onChange={(e) => set("vibe_tags", e.target.value)} placeholder="space, slow-burn, cerebral" />
            </div>

            <div>
              <label className={label}>Accent color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.accent} onChange={(e) => set("accent", e.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-transparent" />
                <input className={field} value={form.accent} onChange={(e) => set("accent", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Moods */}
          <div>
            <label className={label}>Moods</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => {
                const on = moods.includes(m);
                return (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setMoods((cur) => (on ? cur.filter((x) => x !== m) : [...cur, m]))}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${on ? "border-transparent bg-secondary text-secondary-foreground" : "border-border glass text-foreground/70"}`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quality ladder */}
          <div>
            <label className={label}>Quality variants</label>
            <div className="space-y-2">
              {QUALITY_LABELS.map((q) => {
                const row = quals[q];
                return (
                  <div key={q} className="flex items-center gap-3 rounded-xl border border-border bg-white/5 px-3 py-2">
                    <label className="flex w-16 items-center gap-2 text-sm font-semibold">
                      <input
                        type="checkbox"
                        checked={row.enabled}
                        onChange={(e) => setQuals((c) => ({ ...c, [q]: { ...c[q], enabled: e.target.checked } }))}
                        className="h-4 w-4 accent-[#564DFF]"
                      />
                      {q}
                    </label>
                    <input
                      type="number"
                      disabled={!row.enabled}
                      value={row.size_mb}
                      onChange={(e) => setQuals((c) => ({ ...c, [q]: { ...c[q], size_mb: Number(e.target.value) } }))}
                      className="w-28 rounded-lg border border-border bg-white/5 px-2 py-1.5 text-sm outline-none disabled:opacity-40"
                      placeholder="MB"
                    />
                    <span className="text-xs text-foreground/40">MB</span>
                    <input
                      disabled={!row.enabled}
                      value={row.audio}
                      onChange={(e) => setQuals((c) => ({ ...c, [q]: { ...c[q], audio: e.target.value } }))}
                      className="flex-1 rounded-lg border border-border bg-white/5 px-2 py-1.5 text-sm outline-none disabled:opacity-40"
                      placeholder="Audio (e.g. Hindi-English)"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Poster */}
          <div>
            <label className={label}>Poster image</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-28 w-20 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-white/5 hover:border-secondary"
              >
                {posterPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={posterPreview} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus className="h-6 w-6 text-foreground/50" />
                )}
              </button>
              <div className="text-xs text-foreground/50">
                <p>JPEG / PNG / WebP / AVIF, up to 8 MB.</p>
                <p className="mt-1">{poster ? poster.name : "No file chosen — a gradient poster is used if empty."}</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={onPoster} className="hidden" />
            </div>
          </div>

          {msg && (
            <div className={`rounded-xl border px-4 py-3 text-sm ${msg.kind === "ok" ? "border-success/40 bg-success/10 text-success" : "border-danger/40 bg-danger/10 text-danger"}`}>
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground transition-all hover:bg-primary-hover hover:shadow-glow-primary disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
            {busy ? "Publishing…" : "Publish to catalog"}
          </button>
        </form>

        {/* Library */}
        <div className="rounded-3xl border border-border glass p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Library</h2>
            <span className="text-xs text-foreground/50">{list.data?.length ?? 0} titles</span>
          </div>
          <div className="max-h-[640px] space-y-2 overflow-y-auto pr-1">
            {list.isLoading && <p className="text-sm text-foreground/50">Loading…</p>}
            {list.data?.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-xl border border-border bg-white/5 p-2">
                <div className="h-14 w-10 shrink-0 overflow-hidden rounded-md" style={{ background: `linear-gradient(155deg, ${t.gradient[1] ?? t.accent}, ${t.gradient[0]}, #0A0A0A)` }}>
                  {t.poster_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.poster_url} alt={t.title} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="truncate text-[11px] text-foreground/50">
                    {t.content_type} · {t.year} · {t.quality_labels.join("/") || "no qualities"}
                  </p>
                </div>
                <button onClick={() => remove(t.id)} aria-label="Delete" className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/50 hover:bg-danger/15 hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
