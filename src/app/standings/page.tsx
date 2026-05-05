"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { TeamName } from "@/components/TeamName";
import { SkeletonStandingRow } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";

type Season = { id: string; name: string; year: number };
type Standing = {
  teamId: string;
  rank: number;
  teamName: string;
  gamesPlayed: number;
  gamesWon: number;
  matchPoints: number;
  totalPoints: number;
};

function TeamRosterLink({ row }: { row: Standing }) {
  return (
    <Link
      href={`/teams/${row.teamId}`}
      className="tap -m-1 inline-flex rounded-lg p-1 text-ink underline decoration-moss/40 underline-offset-4"
    >
      <TeamName name={row.teamName} />
    </Link>
  );
}

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

  const loadStandings = useCallback(async () => {
    if (!seasonId) {
      setStandings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/seasons/${seasonId}/standings`, { cache: "no-store" });
    const json = await res.json();
    setStandings(json.standings || []);
    setLoading(false);
  }, [seasonId]);

  useEffect(() => {
    loadStandings();
  }, [loadStandings]);

  useEffect(() => {
    function refreshVisibleStandings() {
      if (document.visibilityState === "visible") {
        loadStandings();
      }
    }

    window.addEventListener("focus", loadStandings);
    document.addEventListener("visibilitychange", refreshVisibleStandings);
    return () => {
      window.removeEventListener("focus", loadStandings);
      document.removeEventListener("visibilitychange", refreshVisibleStandings);
    };
  }, [loadStandings]);

  return (
    <main className="card p-4 md:p-6">
      <h2 className="section-title">Standings</h2>
      <p className="mt-1 text-sm text-stone">
        Standings update in real time as scores are finalized and may not reflect games that have not been entered yet.
      </p>

      <div className="sticky-filters mt-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 md:flex md:gap-3">
          <select
            className="col-span-2 min-w-0 w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-sm font-semibold md:col-span-1 md:text-base"
            value={seasonId}
            onChange={(event) => setSeasonId(event.target.value)}
          >
            {seasons.length === 0 ? <option value="">No seasons found</option> : null}
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
          <button
            onClick={loadStandings}
            className="tap flex h-11 w-11 items-center justify-center rounded-xl border border-white/60 bg-white/70"
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
                <TeamRosterLink row={row} />
              </span>
              <span className="text-lg font-display">{row.gamesWon} <span className="text-sm text-stone">Games Won</span></span>
            </div>
            <div className="mt-1.5 flex gap-4 text-sm text-stone">
              <span>{row.gamesPlayed} games played</span>
              <span>{row.gamesWon} games won</span>
            </div>
            <div className="mt-1.5 flex gap-4 text-sm text-stone">
              <span>{row.totalPoints} total scores</span>
              <span>{row.matchPoints} total points</span>
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
                <th className="p-3">Games Played</th>
                <th className="p-3">Games Won</th>
                <th className="p-3">Total Scores</th>
                <th className="p-3">Total Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/60 bg-white/40">
              {standings.map((row) => (
                <tr key={row.teamName}>
                  <td className="p-3">
                    {row.rank}
                  </td>
                  <td className="p-3 font-semibold">
                    <TeamRosterLink row={row} />
                  </td>
                  <td className="p-3">{row.gamesPlayed}</td>
                  <td className="p-3">{row.gamesWon}</td>
                  <td className="p-3">{row.totalPoints}</td>
                  <td className="p-3">{row.matchPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
