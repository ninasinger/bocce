"use client";

import { useEffect, useMemo, useState } from "react";
import { formatTeamName } from "@/lib/display";

type Season = { id: string; name: string; year: number };
type Standing = {
  rank: number;
  teamName: string;
  gamesWon: number;
  matchPoints: number;
  totalPoints: number;
};
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
    hour: "numeric",
    minute: "2-digit"
  });
}

export default function HomePage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonId, setSeasonId] = useState("");
  const [standings, setStandings] = useState<Standing[]>([]);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSeasons() {
      try {
        const res = await fetch("/api/seasons");
        const text = await res.text();
        const json = text ? JSON.parse(text) : {};
        if (!res.ok) {
          setError(json.error || "Could not load seasons");
          setSeasons([]);
          setSeasonId("");
          return;
        }
        const list: Season[] = json.seasons || [];
        setSeasons(list);
        setSeasonId(list[0]?.id || "");
      } catch {
        setError("Could not load seasons");
        setSeasons([]);
        setSeasonId("");
      }
    }

    loadSeasons();
  }, []);

  useEffect(() => {
    if (!seasonId) return;

    async function loadData() {
      try {
        const [standingsRes, scheduleRes] = await Promise.all([
          fetch(`/api/seasons/${seasonId}/standings`),
          fetch(`/api/seasons/${seasonId}/schedule`)
        ]);
        const standingsText = await standingsRes.text();
        const scheduleText = await scheduleRes.text();
        const standingsJson = standingsText ? JSON.parse(standingsText) : {};
        const scheduleJson = scheduleText ? JSON.parse(scheduleText) : {};

        if (!standingsRes.ok || !scheduleRes.ok) {
          setError(
            standingsJson.error || scheduleJson.error || "Could not load home data"
          );
          setStandings([]);
          setMatches([]);
          return;
        }

        setStandings((standingsJson.standings || []).slice(0, 3));
        setMatches((scheduleJson.matches || []).slice(0, 2));
      } catch {
        setError("Could not load home data");
        setStandings([]);
        setMatches([]);
      }
    }

    loadData();
  }, [seasonId]);

  const verifiedCount = useMemo(
    () => matches.filter((match) => match.status === "verified" || match.status === "corrected").length,
    [matches]
  );

  return (
    <main className="space-y-8">
      <section className="card fade-in p-6">
        {error ? (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title">This week at a glance</h2>
          <select
            className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm"
            value={seasonId}
            onChange={(event) => setSeasonId(event.target.value)}
          >
            {seasons.length === 0 ? <option value="">No seasons</option> : null}
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name} ({season.year})
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-field/80 p-4">
            <p className="text-xs uppercase tracking-wide text-stone">Matches in preview</p>
            <p className="mt-2 text-3xl font-display">{matches.length}</p>
          </div>
          <div className="rounded-xl bg-field/80 p-4">
            <p className="text-xs uppercase tracking-wide text-stone">Top teams shown</p>
            <p className="mt-2 text-3xl font-display">{standings.length}</p>
          </div>
          <div className="rounded-xl bg-field/80 p-4">
            <p className="text-xs uppercase tracking-wide text-stone">Verified in preview</p>
            <p className="mt-2 text-3xl font-display">{verifiedCount}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="section-title">Standings preview</h2>
          <p className="mt-2 text-sm text-stone">
            Verified results only. Ranking uses games won, match points, total
            points, head-to-head, then alphabetical.
          </p>
          <div className="mt-4 space-y-3 text-sm">
            {standings.map((row) => (
              <div key={row.teamName} className="flex items-center justify-between rounded-lg bg-white/70 p-3">
                <span>
                  {row.rank}. {formatTeamName(row.teamName)}
                </span>
                <span className="font-semibold">{row.gamesWon} GW</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="section-title">Next matches</h2>
          <p className="mt-2 text-sm text-stone">
            Captains can submit scores only for their scheduled matches.
          </p>
          <div className="mt-4 space-y-3 text-sm">
            {matches.map((item) => (
              <div key={item.id} className="rounded-lg bg-white/70 p-3">
                <p className="font-semibold">
                  Week {item.week_number} · {formatWhen(item.scheduled_datetime)}
                </p>
                <p>
                  {teamName(item.home_team)} vs. {teamName(item.away_team)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
