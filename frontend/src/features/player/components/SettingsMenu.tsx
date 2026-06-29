"use client";

import { Check, Settings } from "lucide-react";
import { useState } from "react";
import type { AudioOption, Level, SubtitleOption } from "../types";

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface Props {
  levels: Level[];
  activeLevel: number; // -1 Auto
  onQuality: (index: number) => void;
  rate: number;
  onRate: (r: number) => void;
  subtitleTracks: SubtitleOption[];
  activeSubtitle: number; // -1 Off
  onSubtitle: (index: number) => void;
  audioTracks: AudioOption[];
  activeAudio: number;
  onAudio: (index: number) => void;
}

type Tab = "speed" | "quality" | "subtitles" | "audio";

export function SettingsMenu(props: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("quality");

  const tabs: Tab[] = ["quality", "speed", "subtitles", "audio"];

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-label="Settings" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10">
        <Settings className="h-5 w-5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-11 right-0 z-20 w-64 overflow-hidden rounded-xl border border-border bg-black/90 backdrop-blur-xl shadow-elevation-4">
            <div className="flex border-b border-border">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 px-2 py-2 text-[11px] font-medium capitalize ${tab === t ? "bg-white/10 text-foreground" : "text-foreground/60"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="max-h-64 overflow-y-auto p-1">
              {tab === "quality" && (
                <Menu>
                  <Row label="Auto" active={props.activeLevel === -1} onClick={() => props.onQuality(-1)} />
                  {props.levels.map((l) => (
                    <Row key={l.index} label={l.label} active={props.activeLevel === l.index} onClick={() => props.onQuality(l.index)} />
                  ))}
                </Menu>
              )}
              {tab === "speed" && (
                <Menu>
                  {RATES.map((r) => (
                    <Row key={r} label={r === 1 ? "Normal" : `${r}x`} active={props.rate === r} onClick={() => props.onRate(r)} />
                  ))}
                </Menu>
              )}
              {tab === "subtitles" && (
                <Menu>
                  <Row label="Off" active={props.activeSubtitle === -1} onClick={() => props.onSubtitle(-1)} />
                  {props.subtitleTracks.map((s, i) => (
                    <Row key={s.id} label={s.label} active={props.activeSubtitle === i} onClick={() => props.onSubtitle(i)} />
                  ))}
                  {props.subtitleTracks.length === 0 && <Empty>No subtitles</Empty>}
                </Menu>
              )}
              {tab === "audio" && (
                <Menu>
                  {props.audioTracks.map((a, i) => (
                    <Row key={a.id} label={a.label} active={props.activeAudio === i} onClick={() => props.onAudio(i)} />
                  ))}
                  {props.audioTracks.length === 0 && <Empty>Single track</Empty>}
                </Menu>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Menu({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col">{children}</div>;
}
function Row({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-white/10">
      <span>{label}</span>
      {active && <Check className="h-4 w-4 text-secondary" />}
    </button>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <div className="px-3 py-3 text-center text-xs text-foreground/40">{children}</div>;
}
