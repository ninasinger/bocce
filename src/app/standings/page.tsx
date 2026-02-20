"use client";

import { useEffect, useState } from "react";
import { formatTeamName } from "@/lib/display";

type Season = { id: string; name: string; year: number };
type Standing = {
  rank: number;
  teamName: string;
  gamesWon: number;
  matchPoints: number;
  totalPoints: number;
};

export default function StandingsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonId, setSeasonId] = useState("");
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeasons() {
      const res = await fetch("/api/seasons");
      const json = await res.json();
      const list: Season[] = json.seasons || [];
      setSeasons(list);
      setSeasonId(list[0]?.id || "");
    }

    loadSeasons();
  }, []);

  useEffect(() => {
    if (!seasonId) {
      setStandings([]);
      setLoading(false);
      return;
    }

    async function loadStandings() {
      setLoading(true);
      const res = await fetch(`/api/seasons/${seasonId}/standings`);
      const json = await res.json();
      setStandings(json.standings || []);
      setLoading(false);
    }

    loadStandings();
  }, [seasonId]);

  return (
    <main className="card p-6">
      <h2 className="section-title">Full standings</h2>
      <p className="mt-2 text-sm text-stone">
        Rankings update automatically once matches are verified or corrected.
      </p>

      <label className="mt-4 grid max-w-sm gap-2 text-sm font-semibold">
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

      {loading ? <p className="mt-4 text-sm text-stone">Loading standings...</p> : null}

      <div className="mt-6 overflow-hidden rounded-xl border border-white/60">
        <table className="w-full text-sm">
          <thead className="bg-white/60 text-left">
            <tr>
              <th className="p-3">Rank</th>
              <th className="p-3">Team</th>
              <th className="p-3">Games Won</th>
              <th className="p-3">Match Points</th>
              <th className="p-3">Total Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/60 bg-white/40">
            {standings.map((row) => (
              <tr key={row.teamName}>
                <td className="p-3">{row.rank}</td>
                <td className="p-3 font-semibold">{formatTeamName(row.teamName)}</td>
                <td className="p-3">{row.gamesWon}</td>
                <td className="p-3">{row.matchPoints}</td>
                <td className="p-3">{row.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
