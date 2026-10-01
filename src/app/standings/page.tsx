"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { TeamName } from "@/components/TeamName";
import { SkeletonStandingRow } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { LeagueTabs } from "@/components/LeagueTabs";
import { useSelectedSeason } from "@/lib/useSelectedSeason";
import { createLatestRequestTracker } from "@/lib/latestRequest";

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
      className="tap -m-1 inline-flex rounded-lg p-1 text-ink underline decoration-cobalt/40 underline-offset-4"
    >
      <TeamName name={row.teamName} />
    </Link>
  );
}

export default function StandingsPage() {
  const { seasons, seasonId, selectSeason, seasonsError } = useSelectedSeason();
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const requests = useRef(createLatestRequestTracker());

  const loadStandings = useCallback(async () => {
    const isLatest = requests.current.start();
    if (!seasonId) {
      setStandings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/seasons/${seasonId}/standings`, { cache: "no-store" });
    const json = await res.json();
    if (!isLatest()) return;
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
      <p className="mt-1 text-sm text-slate">
        Standings update in real time as scores are finalized and may not reflect games that have not been entered yet.
      </p>

      <div className="sticky-filters mt-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 md:flex md:gap-3">
          <LeagueTabs
            className="col-span-2 min-w-0 w-full md:col-span-1"
            seasons={seasons}
            selectedId={seasonId}
            onSelect={selectSeason}
          />
          <button
            onClick={loadStandings}
            className="tap flex h-11 w-11 items-center justify-center rounded-xl border border-tile bg-stucco"
            aria-label="Refresh"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
      </div>

      {seasonsError ? <p className="mt-3 text-sm text-red-700">{seasonsError}</p> : null}

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
          <div key={row.teamName} className="rounded-xl bg-stucco p-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cobalt/10 text-sm font-bold text-cobalt">
                  {row.rank}
                </span>
                <TeamRosterLink row={row} />
              </span>
              <span className="font-display text-2xl font-bold text-cobalt">{row.gamesWon} <span className="font-body text-sm font-normal text-slate">Games Won</span></span>
            </div>
            <div className="mt-1.5 flex gap-4 text-sm text-slate">
              <span>{row.gamesPlayed} games played</span>
              <span>{row.gamesWon} games won</span>
            </div>
            <div className="mt-1.5 flex gap-4 text-sm text-slate">
              <span>{row.totalPoints} total scores</span>
              <span>{row.matchPoints} total points</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table layout */}
      <div className="mt-4 hidden overflow-hidden rounded-xl border border-tile md:block">
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
            <thead className="bg-stucco text-left text-slate">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Team</th>
                <th className="p-3">Games Played</th>
                <th className="p-3">Games Won</th>
                <th className="p-3">Total Scores</th>
                <th className="p-3">Total Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tile bg-white">
              {standings.map((row) => (
                <tr key={row.teamName}>
                  <td className="p-3 font-display text-xl font-bold text-cobalt">
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
