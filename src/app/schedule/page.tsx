"use client";

import { useEffect, useMemo, useState } from "react";
import { TeamName } from "@/components/TeamName";
import { formatTeamName } from "@/lib/display";
import { getCurrentWeek } from "@/lib/week";

type Season = { id: string; name: string; year: number };
type MatchRow = {
  id: string;
  week_number: number;
  scheduled_datetime: string | null;
  status: string;
  notes: string | null;
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

export default function SchedulePage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonId, setSeasonId] = useState("");
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSeasons() {
      try {
        const res = await fetch("/api/seasons");
        const json = await res.json();
        const list: Season[] = json.seasons || [];
        setSeasons(list);
        setSeasonId(list[0]?.id || "");
      } catch {
        setError("Could not load seasons");
      }
    }

    loadSeasons();
  }, []);

  useEffect(() => {
    if (!seasonId) {
      setMatches([]);
      setLoading(false);
      return;
    }

    async function loadSchedule() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/seasons/${seasonId}/schedule`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Failed to load schedule");
          setMatches([]);
          return;
        }
        const loadedMatches = json.matches || [];
        setMatches(loadedMatches);
        setSelectedWeek(getCurrentWeek(loadedMatches));
      } catch {
        setError("Failed to load schedule");
        setMatches([]);
      } finally {
        setLoading(false);
      }
    }

    loadSchedule();
  }, [seasonId]);

  const seasonName = useMemo(() => {
    return seasons.find((season) => season.id === seasonId)?.name || "Schedule";
  }, [seasons, seasonId]);

  const weeks = useMemo(
    () => Array.from(new Set(matches.map((match) => match.week_number))).sort((a, b) => a - b),
    [matches]
  );
  const visibleMatches = useMemo(
    () => matches.filter((match) => match.week_number === selectedWeek),
    [matches, selectedWeek]
  );

  return (
    <main className="card p-6">
      <h2 className="section-title">Weekly schedule</h2>
      <p className="mt-2 text-sm text-stone">{seasonName}</p>

      <div className="mt-4 grid gap-3 md:max-w-2xl md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">
          Season
          <select
            className="rounded-xl border border-white/60 bg-white/70 px-4 py-3"
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
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Week
          <select
            className="rounded-xl border border-white/60 bg-white/70 px-4 py-3"
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
        </label>
      </div>

      {loading ? <p className="mt-4 text-sm text-stone">Loading schedule...</p> : null}
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      {!loading && !error && visibleMatches.length === 0 ? (
        <p className="mt-4 text-sm text-stone">No scheduled matches found.</p>
      ) : null}

      <div className="mt-4 space-y-4">
        {visibleMatches.map((item) => (
          <div key={item.id} className="rounded-xl bg-white/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">Week {item.week_number}</p>
              <span className="badge bg-clay/30 text-ink">{item.status}</span>
            </div>
            <p className="mt-2 text-sm text-stone">{formatWhen(item.scheduled_datetime)}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 font-semibold">
              <TeamName name={teamName(item.home_team)} />
              <span>vs.</span>
              <TeamName name={teamName(item.away_team)} />
            </div>
            {item.notes ? <p className="mt-1 text-xs text-stone">{item.notes}</p> : null}
          </div>
        ))}
      </div>
    </main>
  );
}
