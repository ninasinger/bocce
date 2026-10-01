"use client";

import type { Season } from "@/lib/useSelectedSeason";

export function LeagueTabs({
  seasons,
  selectedId,
  onSelect,
  className = ""
}: {
  seasons: Season[];
  selectedId: string;
  onSelect: (seasonId: string) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="League"
      className={`flex min-h-[2.75rem] gap-1 rounded-xl border border-white/60 bg-white/70 p-1 ${className}`}
    >
      {seasons.map((season) => {
        const active = season.id === selectedId;
        return (
          <button
            key={season.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(season.id)}
            className={`tap min-w-0 flex-1 basis-0 rounded-lg px-2 py-1.5 text-sm font-semibold leading-tight md:px-3 md:text-base ${
              active ? "bg-moss text-white shadow-sm" : "text-ink hover:bg-white"
            }`}
          >
            {season.name}
          </button>
        );
      })}
    </div>
  );
}
