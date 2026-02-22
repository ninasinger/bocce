"use client";

import { useEffect, useState } from "react";
import { TeamName } from "@/components/TeamName";
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
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMatches() {
      const res = await fetch("/api/my/matches");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not load your matches");
        return;
      }
      const loadedMatches = json.matches || [];
      setMatches(loadedMatches);
      setSelectedWeek(getCurrentWeek(loadedMatches));
    }

    loadMatches();
  }, []);

  const weeks = Array.from(new Set(matches.map((match) => match.week_number))).sort(
    (left, right) => left - right
  );
  const visibleMatches = matches.filter((match) => match.week_number === selectedWeek);

  return (
    <main className="card p-6">
      <h2 className="section-title">My matches</h2>
      <p className="mt-2 text-sm text-stone">
        Submit once per match. If a dispute occurs, contact the commissioner.
      </p>

      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

      <label className="mt-4 grid max-w-sm gap-2 text-sm font-semibold">
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

      <div className="mt-6 space-y-4">
        {visibleMatches.map((match) => (
          <div key={match.id} className="rounded-xl bg-white/70 p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">
                Week {match.week_number} · {formatWhen(match.scheduled_datetime)}
              </p>
              <span className="badge bg-sun/30 text-ink">{match.status}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-stone">
              <TeamName name={teamName(match.home_team)} />
              <span>vs.</span>
              <TeamName name={teamName(match.away_team)} />
            </div>
            <a
              href={`/captain/matches/${match.id}/submit`}
              className="mt-3 inline-flex rounded-lg bg-moss px-4 py-2 text-sm font-semibold text-white"
            >
              Submit score
            </a>
          </div>
        ))}
        {visibleMatches.length === 0 ? (
          <p className="text-sm text-stone">No matches found for week {selectedWeek}.</p>
        ) : null}
      </div>
    </main>
  );
}
