"use client";

import { useCallback, useEffect, useState } from "react";
import { TeamName } from "@/components/TeamName";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonCard } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { formatTeamName } from "@/lib/display";
import { getCurrentWeek } from "@/lib/week";

type MatchRow = {
  id: string;
  week_number: number;
  scheduled_datetime: string | null;
  status: string;
  home_team: { name: string } | { name: string }[] | null;
  away_team: { name: string } | { name: string }[] | null;
};

function teamName(team: MatchRow["home_team"]) {
  if (!team) return "TBD";
  if (Array.isArray(team)) return team[0]?.name ? formatTeamName(team[0].name) : "TBD";
  return team.name ? formatTeamName(team.name) : "TBD";
}

function formatWhen(value: string | null) {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export default function CaptainMatchesPage() {
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/my/matches");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not load your matches");
        return;
      }
      const loadedMatches = json.matches || [];
      setMatches(loadedMatches);
      setSelectedWeek(getCurrentWeek(loadedMatches));
    } catch {
      setError("Could not load your matches");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const weeks = Array.from(new Set(matches.map((match) => match.week_number))).sort(
    (left, right) => left - right
  );
  const visibleMatches = matches.filter((match) => match.week_number === selectedWeek);

  return (
    <main className="card p-4 md:p-6">
      <h2 className="section-title">My matches</h2>
      <p className="mt-1 text-sm text-stone">
        Submit once per match. Contact the commissioner for disputes.
      </p>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

      <div className="sticky-filters mt-3">
        <div className="flex items-center gap-3">
          <select
            className="flex-1 rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-base font-semibold"
            value={selectedWeek}
            onChange={(event) => setSelectedWeek(Number(event.target.value))}
          >
            {weeks.length === 0 ? <option value={1}>Week 1</option> : null}
            {weeks.map((week) => (
              <option key={week} value={week}>
                Week {week}
              </option>
            ))}
          </select>
          <button
            onClick={loadMatches}
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

      <div className="mt-4 space-y-3">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : visibleMatches.length === 0 ? (
          <EmptyState icon="clipboard" message={`No matches for week ${selectedWeek}.`} />
        ) : visibleMatches.map((match) => (
          <div key={match.id} className="rounded-xl bg-white/70 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={match.status} />
              <span className="text-xs text-stone">{formatWhen(match.scheduled_datetime)}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <TeamName name={teamName(match.home_team)} />
              <span className="text-stone">vs</span>
              <TeamName name={teamName(match.away_team)} />
            </div>
            <a
              href={`/captain/matches/${match.id}/submit`}
              className="tap-btn mt-2.5 inline-flex rounded-lg bg-moss px-4 py-2 text-sm font-semibold text-white"
            >
              Submit score
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
