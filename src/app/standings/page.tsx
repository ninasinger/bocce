"use client";

import { useCallback, useEffect, useState } from "react";
import { TeamName } from "@/components/TeamName";
import { SkeletonStandingRow } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
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

  const loadStandings = useCallback(async () => {
    if (!seasonId) return;
    setLoading(true);
    const res = await fetch(`/api/seasons/${seasonId}/standings?week=${selectedWeek}`);
    const json = await res.json();
    setStandings(json.standings || []);
    setLoading(false);
  }, [seasonId, selectedWeek]);

  useEffect(() => {
    loadStandings();
  }, [loadStandings]);

  return (
    <main className="card p-4 md:p-6">
      <h2 className="section-title">Full standings</h2>
      <p className="mt-1 text-sm text-stone">
        Through week {selectedWeek}. Updates after verification.
      </p>

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
            onClick={loadStandings}
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

      {/* Mobile: card layout */}
      <div className="mt-4 space-y-2 md:hidden">
        {loading ? (
          <>
            <SkeletonStandingRow />
            <SkeletonStandingRow />
            <SkeletonStandingRow />
            <SkeletonStandingRow />
            <SkeletonStandingRow />
          </>
        ) : standings.length === 0 ? (
          <EmptyState icon="trophy" message="No standings yet. Matches need to be verified first." />
        ) : standings.map((row) => (
          <div key={row.teamName} className="rounded-xl bg-white/70 p-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-moss/10 text-sm font-bold text-moss">
                  {row.rank}
                </span>
                <TeamName name={row.teamName} />
              </span>
              <span className="text-lg font-display">{row.gamesWon} <span className="text-xs text-stone">GW</span></span>
            </div>
            <div className="mt-1.5 flex gap-4 text-xs text-stone">
              <span>{row.gamesPlayed} played</span>
              <span>{row.matchPoints} MP</span>
              <span>{row.totalPoints} TP</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table layout */}
      <div className="mt-4 hidden overflow-hidden rounded-xl border border-white/60 md:block">
        {loading ? (
          <div className="space-y-2 p-4">
            <SkeletonStandingRow />
            <SkeletonStandingRow />
            <SkeletonStandingRow />
          </div>
        ) : standings.length === 0 ? (
          <EmptyState icon="trophy" message="No standings yet. Matches need to be verified first." />
        ) : (
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
        )}
      </div>
    </main>
  );
}
