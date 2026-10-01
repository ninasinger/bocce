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
      className={`flex min-h-[2.75rem] gap-1.5 ${className}`}
    >
      {seasons.map((season) => {
        const active = season.id === selectedId;
        return (
          <button
            key={season.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(season.id)}
            className={`tap min-w-0 flex-1 basis-0 rounded-lg border px-2 py-2 text-sm font-semibold leading-tight md:px-3 md:text-base ${
              active
                ? "border-cobalt bg-cobalt text-white shadow-sm"
                : "border-cobalt/30 bg-white text-cobalt hover:border-cobalt"
            }`}
          >
            {season.name}
          </button>
        );
      })}
    </div>
  );
}
