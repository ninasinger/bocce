"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TeamName } from "@/components/TeamName";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonCard } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { errorMessageFromData, fetchJson } from "@/lib/clientFetch";
import { formatMatchDateTime, formatMatchTeamName, type TeamRef } from "@/lib/matchFormat";
import { getCurrentWeek } from "@/lib/week";

type Season = { id: string; name: string; year: number };
type MatchRow = {
  id: string;
  week_number: number;
  scheduled_datetime: string | null;
  status: string;
  notes: string | null;
  home_team: TeamRef;
  away_team: TeamRef;
  home_games_won: number | null;
  away_games_won: number | null;
  home_total_score: number | null;
  away_total_score: number | null;
};

export default function SchedulePage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonId, setSeasonId] = useState("");
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSchedule = useCallback(async () => {
    if (!seasonId) {
      setMatches([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { response, data } = await fetchJson<{ matches?: MatchRow[]; error?: string }>(
        `/api/seasons/${seasonId}/schedule`
      );
      if (!response.ok) {
        setError(errorMessageFromData(data, "Failed to load schedule"));
        setMatches([]);
        return;
      }
      const loadedMatches = data.matches || [];
      setMatches(loadedMatches);
      setSelectedWeek(getCurrentWeek(loadedMatches));
    } catch {
      setError("Failed to load schedule");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    async function loadSeasons() {
      try {
        const { data } = await fetchJson<{ seasons?: Season[] }>("/api/seasons");
        const list: Season[] = data.seasons || [];
        setSeasons(list);
        setSeasonId(list[0]?.id || "");
      } catch {
        setError("Could not load seasons");
      }
    }

    loadSeasons();
  }, []);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const weeks = useMemo(
    () => Array.from(new Set(matches.map((match) => match.week_number))).sort((a, b) => a - b),
    [matches]
  );
  const visibleMatches = useMemo(
    () => matches.filter((match) => match.week_number === selectedWeek),
    [matches, selectedWeek]
  );

  return (
    <main className="card p-4 md:p-6">
      <h2 className="section-title">Weekly schedule</h2>

      <div className="sticky-filters mt-3">
        <div className="flex items-center gap-3">
          <select
            className="flex-1 rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-base font-semibold"
            value={seasonId}
            onChange={(event) => setSeasonId(event.target.value)}
          >
            {seasons.length === 0 ? <option value="">No seasons found</option> : null}
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name} ({season.year})
              </option>
            ))}
          </select>
          <select
            className="w-28 rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-base font-semibold"
            value={selectedWeek}
            onChange={(event) => setSelectedWeek(Number(event.target.value))}
          >
            {weeks.length === 0 ? <option value={1}>Wk 1</option> : null}
            {weeks.map((week) => (
              <option key={week} value={week}>
                Wk {week}
              </option>
            ))}
          </select>
          <button
            onClick={loadSchedule}
            className="tap flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/70 border border-white/60"
            aria-label="Refresh"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-stone">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

      <div className="mt-4 space-y-3">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : visibleMatches.length === 0 ? (
          <EmptyState icon="calendar" message={`No matches scheduled for week ${selectedWeek}.`} />
        ) : visibleMatches.map((item) => (
          <div key={item.id} className="tap rounded-xl bg-white/70 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={item.status} />
              <span className="text-xs text-stone">
                {formatMatchDateTime(item.scheduled_datetime, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit"
                })}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 font-semibold">
              <TeamName name={formatMatchTeamName(item.home_team)} />
              <span className="text-stone font-normal">vs</span>
              <TeamName name={formatMatchTeamName(item.away_team)} />
            </div>
            {(item.status === "verified" || item.status === "corrected") &&
              item.home_total_score != null && item.away_total_score != null ? (
              <p className="mt-1 text-xs text-stone">
                Final: {item.home_total_score}-{item.away_total_score}
                {item.home_games_won != null && item.away_games_won != null
                  ? ` | Games: ${item.home_games_won}-${item.away_games_won}`
                  : null}
              </p>
            ) : null}
            {item.notes ? <p className="mt-1 text-xs text-stone">{item.notes}</p> : null}
          </div>
        ))}
      </div>
    </main>
  );
}
