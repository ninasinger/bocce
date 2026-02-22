"use client";

import { useEffect, useState } from "react";
import { TeamName } from "@/components/TeamName";
import { getCurrentWeek } from "@/lib/week";

type Season = { id: string; name: string; year: number };
type Standing = {
  rank: number;
  teamName: string;
  gamesPlayed: number;
  gamesWon: number;
  matchPoints: number;
  totalPoints: number;
};

export default function StandingsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonId, setSeasonId] = useState("");
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [weeks, setWeeks] = useState<number[]>([]);
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
      setWeeks([]);
      setSelectedWeek(1);
      setLoading(false);
      return;
    }

    async function loadWeeks() {
      setLoading(true);
      const scheduleRes = await fetch(`/api/seasons/${seasonId}/schedule`);
      const scheduleJson = await scheduleRes.json();
      const seasonMatches: { week_number: number; status: string }[] =
        scheduleJson.matches || [];

      const weekOptions = Array.from(
        new Set(seasonMatches.map((match) => match.week_number))
      ).sort((a, b) => a - b);
      const currentWeek = getCurrentWeek(seasonMatches);
      setWeeks(weekOptions);
      setSelectedWeek(currentWeek);
    }

    loadWeeks();
  }, [seasonId]);

  useEffect(() => {
    if (!seasonId) return;
    async function reloadForWeek() {
      setLoading(true);
      const res = await fetch(`/api/seasons/${seasonId}/standings?week=${selectedWeek}`);
      const json = await res.json();
      setStandings(json.standings || []);
      setLoading(false);
    }
    reloadForWeek();
  }, [seasonId, selectedWeek]);

  return (
    <main className="card p-4 md:p-6">
      <h2 className="section-title">Full standings</h2>
      <p className="mt-2 text-sm text-stone">
        Through week {selectedWeek}. Updates after matches are verified.
      </p>

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

      {loading ? <p className="mt-4 text-sm text-stone">Loading standings...</p> : null}

      {/* Mobile: card layout */}
      <div className="mt-6 space-y-3 md:hidden">
        {standings.map((row) => (
          <div key={row.teamName} className="rounded-xl bg-white/70 p-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-moss/10 text-sm font-bold text-moss">
                  {row.rank}
                </span>
                <TeamName name={row.teamName} />
              </span>
              <span className="text-lg font-display">{row.gamesWon} <span className="text-xs text-stone">GW</span></span>
            </div>
            <div className="mt-2 flex gap-4 text-xs text-stone">
              <span>{row.gamesPlayed} played</span>
              <span>{row.matchPoints} MP</span>
              <span>{row.totalPoints} TP</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table layout */}
      <div className="mt-6 hidden overflow-hidden rounded-xl border border-white/60 md:block">
        <table className="w-full text-sm">
          <thead className="bg-white/60 text-left">
            <tr>
              <th className="p-3">Rank</th>
              <th className="p-3">Team</th>
              <th className="p-3">GP</th>
              <th className="p-3">GW</th>
              <th className="p-3">MP</th>
              <th className="p-3">TP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/60 bg-white/40">
            {standings.map((row) => (
              <tr key={row.teamName}>
                <td className="p-3">{row.rank}</td>
                <td className="p-3 font-semibold">
                  <TeamName name={row.teamName} />
                </td>
                <td className="p-3">{row.gamesPlayed}</td>
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
