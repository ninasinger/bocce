"use client";

import { useCallback, useEffect, useState } from "react";
import { TeamName } from "@/components/TeamName";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton, SkeletonCard } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { formatTeamName } from "@/lib/display";

type MatchRow = {
  id: string;
  week_number: number;
  scheduled_datetime: string | null;
  status: string;
  home_team: { name: string } | { name: string }[] | null;
  away_team: { name: string } | { name: string }[] | null;
  home_games_won: number | null;
  away_games_won: number | null;
  home_total_score: number | null;
  away_total_score: number | null;
};

function resolveTeamName(team: MatchRow["home_team"]) {
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
    minute: "2-digit",
  });
}

function inferMyTeam(matches: MatchRow[]): string | null {
  // The captain's team appears in every match as either home or away.
  // Find the team name that appears most frequently.
  const counts = new Map<string, number>();
  for (const m of matches) {
    const home = resolveTeamName(m.home_team);
    const away = resolveTeamName(m.away_team);
    counts.set(home, (counts.get(home) || 0) + 1);
    counts.set(away, (counts.get(away) || 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [name, count] of counts) {
    if (count > bestCount && name !== "TBD") {
      best = name;
      bestCount = count;
    }
  }
  return best;
}

function getOpponent(match: MatchRow, myTeam: string): string {
  const home = resolveTeamName(match.home_team);
  const away = resolveTeamName(match.away_team);
  return home === myTeam ? away : home;
}

function isMyHomeTeam(match: MatchRow, myTeam: string): boolean {
  return resolveTeamName(match.home_team) === myTeam;
}

export default function CaptainDashboardPage() {
  const [matches, setMatches] = useState<MatchRow[]>([]);
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
      setMatches(json.matches || []);
    } catch {
      setError("Could not load your matches");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const myTeam = inferMyTeam(matches);

  const verifiedMatches = matches.filter((m) => m.status === "verified" || m.status === "corrected");
  const upcomingMatches = matches.filter(
    (m) => m.status === "scheduled" || m.status === "awaiting_submission"
  );

  // Record: count wins/losses from verified matches
  let wins = 0;
  let losses = 0;
  for (const m of verifiedMatches) {
    if (!myTeam) break;
    const homeWins = m.home_games_won ?? 0;
    const awayWins = m.away_games_won ?? 0;
    const iAmHome = isMyHomeTeam(m, myTeam);
    const myWins = iAmHome ? homeWins : awayWins;
    const theirWins = iAmHome ? awayWins : homeWins;
    wins += myWins;
    losses += theirWins;
  }

  const recentResults = [...verifiedMatches]
    .sort((a, b) => {
      const da = a.scheduled_datetime ? new Date(a.scheduled_datetime).getTime() : 0;
      const db = b.scheduled_datetime ? new Date(b.scheduled_datetime).getTime() : 0;
      return db - da;
    })
    .slice(0, 3);

  const nextMatch = upcomingMatches[0] || null;

  return (
    <main className="space-y-4">
      {/* Team Header */}
      <section className="card p-4 md:p-6">
        {loading ? (
          <>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="mt-2 h-4 w-32" />
          </>
        ) : error ? (
          <p className="text-sm text-red-700">{error}</p>
        ) : myTeam ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-stone">
                  My Team
                </p>
                <h2 className="mt-1 text-2xl font-display">
                  <TeamName name={myTeam} />
                </h2>
              </div>
              <a
                href="/captain/matches"
                className="tap-btn rounded-lg bg-moss px-4 py-2 text-sm font-semibold text-white"
              >
                Submit scores
              </a>
            </div>
          </>
        ) : (
          <EmptyState icon="clipboard" message="No team found. Submit a score to get started." />
        )}
      </section>

      {/* Quick Stats */}
      <section className="card p-4 md:p-6">
        <h3 className="section-title">Season snapshot</h3>
        {loading ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/70 p-3">
              <p className="text-xs uppercase tracking-wide text-stone">Record (games)</p>
              <p className="mt-1 text-2xl font-display">
                {wins}-{losses}
              </p>
            </div>
            <div className="rounded-xl bg-white/70 p-3">
              <p className="text-xs uppercase tracking-wide text-stone">Matches played</p>
              <p className="mt-1 text-2xl font-display">{verifiedMatches.length}</p>
            </div>
          </div>
        )}
      </section>

      {/* Next Upcoming Match */}
      <section className="card p-4 md:p-6">
        <h3 className="section-title">Up next</h3>
        {loading ? (
          <div className="mt-3">
            <SkeletonCard />
          </div>
        ) : nextMatch && myTeam ? (
          <div className="mt-3 rounded-xl bg-white/70 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={nextMatch.status} />
              <span className="text-xs text-stone">
                Week {nextMatch.week_number}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold">
              vs <TeamName name={getOpponent(nextMatch, myTeam)} />
            </p>
            <p className="mt-1 text-xs text-stone">
              {formatWhen(nextMatch.scheduled_datetime)}
            </p>
            <a
              href={`/captain/matches/${nextMatch.id}/submit`}
              className="tap-btn mt-2.5 inline-flex rounded-lg bg-moss px-4 py-2 text-sm font-semibold text-white"
            >
              Submit score
            </a>
          </div>
        ) : (
          <div className="mt-3">
            <EmptyState icon="calendar" message="No upcoming matches." />
          </div>
        )}
      </section>

      {/* Recent Results */}
      <section className="card p-4 md:p-6">
        <h3 className="section-title">Recent results</h3>
        <div className="mt-3 space-y-2">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : recentResults.length === 0 ? (
            <EmptyState icon="trophy" message="No verified results yet." />
          ) : (
            recentResults.map((match) => {
              const opponent = myTeam ? getOpponent(match, myTeam) : "TBD";
              const iAmHome = myTeam ? isMyHomeTeam(match, myTeam) : true;
              const myScore = iAmHome ? match.home_total_score : match.away_total_score;
              const theirScore = iAmHome ? match.away_total_score : match.home_total_score;
              const myGW = iAmHome ? match.home_games_won : match.away_games_won;
              const theirGW = iAmHome ? match.away_games_won : match.home_games_won;
              const won = (myGW ?? 0) > (theirGW ?? 0);
              const tied = (myGW ?? 0) === (theirGW ?? 0);

              return (
                <div key={match.id} className="rounded-xl bg-white/70 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            won
                              ? "bg-emerald-100 text-emerald-800"
                              : tied
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {won ? "Win" : tied ? "Tie" : "Loss"}
                        </span>
                        <span className="text-xs text-stone">Week {match.week_number}</span>
                      </div>
                      <p className="mt-1.5 text-sm font-semibold">
                        vs <TeamName name={opponent} />
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-display">
                        {myScore ?? "-"}-{theirScore ?? "-"}
                      </p>
                      <p className="text-xs text-stone">
                        {myGW ?? 0}-{theirGW ?? 0} GW
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
