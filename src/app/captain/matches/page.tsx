"use client";

import { useEffect, useState } from "react";

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
  if (Array.isArray(team)) return team[0]?.name || "TBD";
  return team.name || "TBD";
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
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMatches() {
      const res = await fetch("/api/my/matches");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not load your matches");
        return;
      }
      setMatches(json.matches || []);
    }

    loadMatches();
  }, []);

  return (
    <main className="card p-6">
      <h2 className="section-title">My matches</h2>
      <p className="mt-2 text-sm text-stone">
        Submit once per match. If a dispute occurs, contact the commissioner.
      </p>

      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

      <div className="mt-6 space-y-4">
        {matches.map((match) => (
          <div key={match.id} className="rounded-xl bg-white/70 p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">
                Week {match.week_number} · {formatWhen(match.scheduled_datetime)}
              </p>
              <span className="badge bg-sun/30 text-ink">{match.status}</span>
            </div>
            <p className="mt-1 text-sm text-stone">
              {teamName(match.home_team)} vs. {teamName(match.away_team)}
            </p>
            <a
              href={`/captain/matches/${match.id}/submit`}
              className="mt-3 inline-flex rounded-lg bg-moss px-4 py-2 text-sm font-semibold text-white"
            >
              Submit score
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
