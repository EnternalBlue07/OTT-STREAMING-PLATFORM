"use client";

import { useState } from "react";

/**
 * Synopsis with expand/collapse. Truncates with line-clamp until expanded;
 * the toggle only appears when the text is long enough to clamp.
 */
export function SynopsisBlock({ text, clampThreshold = 180 }: { text: string; clampThreshold?: number }) {
  const [expanded, setExpanded] = useState(false);
  const long = text.length > clampThreshold;

  return (
    <div className="mb-8 max-w-3xl">
      <p className={!expanded && long ? "line-clamp-3 text-foreground/80" : "text-foreground/80"}>{text}</p>
      {long && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-1 text-sm font-medium text-foreground/60 hover:text-foreground"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
