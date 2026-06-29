"use client";

import { Check, Monitor, Settings, Volume2 } from "lucide-react";
import { useSettings } from "@/shared/store/settings-store";

const QUALITIES = ["Auto", "4K", "1080p", "720p", "480p"];
const SUBTITLE_LANGS = ["Off", "English", "Hindi", "Spanish", "French", "Japanese", "Korean", "Tamil", "Telugu"];
const AUDIO_LANGS = ["Hindi", "English", "Tamil", "Telugu", "Japanese", "Korean"];
const THEMES = [
  { id: "dark", label: "Dark (default)" },
  { id: "oled", label: "OLED Black" },
  { id: "midnight", label: "Midnight Blue" },
];
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const field = "w-full rounded-xl border border-border bg-white/5 px-3 py-2.5 text-sm text-foreground outline-none focus:border-secondary";
const sectionTitle = "mb-4 flex items-center gap-2 font-display text-lg font-semibold";

function Toggle({ value, onChange, label, description }: { value: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-foreground/50">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${value ? "bg-primary" : "bg-white/20"}`}
        aria-label={label}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}

function SavedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
      <Check className="h-3 w-3" /> Saved
    </span>
  );
}

export default function SettingsPage() {
  const s = useSettings();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-7 w-7 text-foreground/70" />
          <h1 className="font-display text-display font-bold">Settings</h1>
        </div>
        <SavedBadge />
      </div>

      <p className="mb-8 text-sm text-foreground/50">Changes apply immediately and persist across sessions.</p>

      <div className="space-y-8">
        {/* Playback */}
        <section className="rounded-3xl border border-border glass p-6">
          <h2 className={sectionTitle}><Volume2 className="h-5 w-5 text-primary" /> Playback</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/70">Default Quality</label>
              <select value={s.defaultQuality} onChange={(e) => s.set({ defaultQuality: e.target.value })} className={field}>
                {QUALITIES.map((q) => <option key={q} value={q} className="bg-surface">{q}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/70">Default Playback Speed</label>
              <select value={s.playbackSpeed} onChange={(e) => s.set({ playbackSpeed: Number(e.target.value) })} className={field}>
                {SPEEDS.map((sp) => <option key={sp} value={sp} className="bg-surface">{sp === 1 ? "Normal (1x)" : `${sp}x`}</option>)}
              </select>
            </div>
            <Toggle value={s.autoplay} onChange={(v) => s.set({ autoplay: v })} label="Autoplay Trailers" description="Auto-play trailers on hover and on the watch page." />
            <Toggle value={s.autoNextEpisode} onChange={(v) => s.set({ autoNextEpisode: v })} label="Auto-play Next Episode" description="Automatically start the next episode when one ends." />
            <Toggle value={s.skipIntro} onChange={(v) => s.set({ skipIntro: v })} label="Auto-skip Intros" description="Automatically skip intros when available." />
            <Toggle value={s.skipRecap} onChange={(v) => s.set({ skipRecap: v })} label="Auto-skip Recaps" description="Automatically skip recaps when available." />
          </div>
        </section>

        {/* Language */}
        <section className="rounded-3xl border border-border glass p-6">
          <h2 className={sectionTitle}>🌐 Language</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/70">Default Audio Language</label>
              <select value={s.audioLanguage} onChange={(e) => s.set({ audioLanguage: e.target.value })} className={field}>
                {AUDIO_LANGS.map((l) => <option key={l} value={l} className="bg-surface">{l}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/70">Default Subtitle Language</label>
              <select value={s.subtitleLanguage} onChange={(e) => s.set({ subtitleLanguage: e.target.value })} className={field}>
                {SUBTITLE_LANGS.map((l) => <option key={l} value={l} className="bg-surface">{l}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Display */}
        <section className="rounded-3xl border border-border glass p-6">
          <h2 className={sectionTitle}><Monitor className="h-5 w-5 text-secondary" /> Display</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/70">Theme</label>
              <div className="flex gap-3">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => s.set({ theme: t.id })}
                    className={`flex-1 rounded-xl border p-3 text-center text-sm font-medium transition-colors ${
                      s.theme === t.id ? "border-primary bg-primary/10 text-primary" : "border-border glass text-foreground/70"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Downloads */}
        <section className="rounded-3xl border border-border glass p-6">
          <h2 className={sectionTitle}>📥 Downloads</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/70">Download Quality</label>
              <select value={s.downloadQuality} onChange={(e) => s.set({ downloadQuality: e.target.value })} className={field}>
                {QUALITIES.filter((q) => q !== "Auto").map((q) => <option key={q} value={q} className="bg-surface">{q}</option>)}
              </select>
              <p className="mt-1 text-xs text-foreground/40">Higher quality = larger file size.</p>
            </div>
            <Toggle value={s.dataServerMode} onChange={(v) => s.set({ dataServerMode: v })} label="Data Saver Mode" description="Automatically reduce quality when on mobile data." />
          </div>
        </section>

        {/* Notifications */}
        <section className="rounded-3xl border border-border glass p-6">
          <h2 className={sectionTitle}>🔔 Notifications</h2>
          <Toggle value={s.notifications} onChange={(v) => s.set({ notifications: v })} label="Push Notifications" description="New episodes, recommendations, and platform updates." />
        </section>

        {/* Info */}
        <div className="rounded-xl bg-white/5 p-4 text-center text-xs text-foreground/40">
          All settings are saved instantly to your browser. Account-level sync arrives in a future update.
        </div>
      </div>
    </div>
  );
}
