"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TeamName } from "@/components/TeamName";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton, SkeletonCard, SkeletonStandingRow, SkeletonAwardCard } from "@/components/Skeleton";
import { errorMessageFromData, fetchJson } from "@/lib/clientFetch";
import { formatMatchDateTime, formatMatchTeamName, type TeamRef } from "@/lib/matchFormat";
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
type MatchRow = {
  id: string;
  week_number: number;
  scheduled_datetime: string | null;
  status: string;
  home_team: TeamRef;
  away_team: TeamRef;
};
type Award = {
  id: string;
  emoji: string;
  title: string;
  team: string;
  detail: string;
};

const AWARD_COLORS: Record<string, string> = {
  blowout: "bg-red-50",
  nailbiter: "bg-amber-50",
  topscorer: "bg-sky-50",
  hotstreak: "bg-orange-50",
  risingstar: "bg-violet-50",
};

export default function HomePage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonId, setSeasonId] = useState("");
  const [standings, setStandings] = useState<Standing[]>([]);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [awardsWeek, setAwardsWeek] = useState<number | null>(null);
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [captainNextMatch, setCaptainNextMatch] = useState<MatchRow | null>(null);

  useEffect(() => {
    async function loadCaptainNext() {
      const sessionRes = await fetchJson<{ authenticated?: boolean; session?: { role?: string } }>(
        "/api/auth/session"
      );
      if (!sessionRes.response.ok || sessionRes.data.session?.role !== "captain") {
        setCaptainNextMatch(null);
        return;
      }
      const { response, data } = await fetchJson<{ matches?: MatchRow[] }>("/api/my/matches");
      if (!response.ok) {
        setCaptainNextMatch(null);
        return;
      }
      const list = data.matches || [];
      const next = list.find((match) => match.status === "awaiting_submission") || null;
      setCaptainNextMatch(next);
    }

    loadCaptainNext();
  }, []);

  useEffect(() => {
    async function loadSeasons() {
      try {
        const { response, data } = await fetchJson<{ seasons?: Season[]; error?: string }>("/api/seasons");
        if (!response.ok) {
          setError(errorMessageFromData(data, "Could not load seasons"));
          setSeasons([]);
          setSeasonId("");
          setLoading(false);
          return;
        }
        const list: Season[] = data.seasons || [];
        setSeasons(list);
        setSeasonId(list[0]?.id || "");
      } catch {
        setError("Could not load seasons");
        setSeasons([]);
        setSeasonId("");
        setLoading(false);
      }
    }

    loadSeasons();
  }, []);

  useEffect(() => {
    if (!seasonId) return;

    async function loadData() {
      setLoading(true);
      try {
        const [standingsResult, scheduleResult, awardsResult] = await Promise.all([
          fetchJson<{ standings?: Standing[]; error?: string }>(`/api/seasons/${seasonId}/standings`),
          fetchJson<{ matches?: MatchRow[]; error?: string }>(`/api/seasons/${seasonId}/schedule`),
          fetchJson<{ awards?: Award[]; week?: number | null; error?: string }>(
            `/api/seasons/${seasonId}/awards`
          )
        ]);

        if (!standingsResult.response.ok || !scheduleResult.response.ok) {
          setError(
            errorMessageFromData(standingsResult.data, "") ||
              errorMessageFromData(scheduleResult.data, "") ||
              "Could not load home data"
          );
          setStandings([]);
          setMatches([]);
          return;
        }

        setStandings((standingsResult.data.standings || []).slice(0, 6));
        const allMatches: MatchRow[] = scheduleResult.data.matches || [];
        const week = getCurrentWeek(allMatches);
        setCurrentWeek(week);
        const weekMatches = allMatches.filter((m) => m.week_number === week);
        setMatches(weekMatches);
        setAwards(awardsResult.data.awards || []);
        setAwardsWeek(awardsResult.data.week || null);
      } catch {
        setError("Could not load home data");
        setStandings([]);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [seasonId]);

  const verifiedCount = useMemo(
    () => matches.filter((match) => match.status === "verified" || match.status === "corrected").length,
    [matches]
  );
  return (
    <main className="space-y-6">
      {captainNextMatch ? (
        <section className="card fade-in border-2 border-moss/30 bg-moss/5 p-4 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-moss">Your next match</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={captainNextMatch.status} />
            <span className="text-sm text-stone">
              Week {captainNextMatch.week_number}
              {captainNextMatch.scheduled_datetime
                ? ` · ${formatMatchDateTime(captainNextMatch.scheduled_datetime, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                  })}`
                : ""}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-lg font-display">
            <TeamName name={formatMatchTeamName(captainNextMatch.home_team)} />
            <span className="text-stone">vs</span>
            <TeamName name={formatMatchTeamName(captainNextMatch.away_team)} />
          </div>
          <Link
            href={`/captain/matches/${captainNextMatch.id}/submit`}
            className="tap-btn mt-3 inline-flex items-center justify-center rounded-xl bg-moss px-5 py-3 text-base font-semibold text-white shadow-sm"
          >
            Submit scores
          </Link>
        </section>
      ) : null}

      <section className="card fade-in p-4 md:p-6">
        {error ? (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title">This week at a glance</h2>
          <select
            className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-base"
            value={seasonId}
            onChange={(event) => setSeasonId(event.target.value)}
          >
            {seasons.length === 0 ? <option value="">No seasons</option> : null}
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
        </div>
        {loading ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/70 bg-field/85 p-3 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-stone">Matches</p>
              <p className="mt-1 text-2xl font-display">{matches.length}</p>
            </div>
            <div className="rounded-xl border border-white/70 bg-field/85 p-3 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-stone">Finished</p>
              <p className="mt-1 text-2xl font-display">{verifiedCount}</p>
            </div>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/schedule" className="tap nav-pill nav-pill-muted text-sm font-semibold">
            View Week {currentWeek ?? "?"} Schedule
          </Link>
          <Link href="/standings" className="tap nav-pill nav-pill-muted text-sm font-semibold">
            Open Full Standings
          </Link>
        </div>
      </section>

      {/* Weekly Awards */}
      {loading ? (
        <section className="card fade-in p-4 md:p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-56" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <SkeletonAwardCard />
            <SkeletonAwardCard />
          </div>
        </section>
      ) : awards.length > 0 ? (
        <section className="card fade-in p-4 md:p-6">
          <h2 className="section-title">
            Week {awardsWeek} Awards
          </h2>
          <p className="mt-1 text-sm text-stone">
            Highlights from this week&apos;s verified matches.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {awards.map((award) => (
              <div
                key={award.id}
                className={`award-card ${AWARD_COLORS[award.id] || "bg-white/70"}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl" role="img" aria-label={award.title}>
                    {award.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone">
                      {award.title}
                    </p>
                    <p className="mt-0.5 font-display text-base leading-tight">{award.team}</p>
                    <p className="mt-0.5 text-sm text-stone">{award.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card p-4 md:p-6">
          <h2 className="section-title">Standings preview</h2>
          <p className="mt-1 text-sm text-stone">
            Top teams by games won.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            {loading ? (
              <>
                <SkeletonStandingRow />
                <SkeletonStandingRow />
                <SkeletonStandingRow />
                <SkeletonStandingRow />
              </>
            ) : standings.map((row) => (
              <div key={row.teamName} className="tap flex items-center justify-between rounded-lg bg-white/70 p-3">
                  <span className="inline-flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-moss/10 text-xs font-bold text-moss">
                    {row.rank}
                  </span>
                  <TeamName name={formatMatchTeamName({ name: row.teamName })} />
                </span>
                <span className="font-semibold">{row.gamesWon} <span className="text-sm text-stone">Games Won</span></span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4 md:p-6">
          <h2 className="section-title">Week {currentWeek ?? "..."} matches</h2>
          <p className="mt-1 text-sm text-stone">
            {matches.length === 0 && !loading ? "No matches this week." : "Current week\u2019s games."}
          </p>
          <div className="mt-4 space-y-2 text-sm">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : matches.map((item) => (
              <div key={item.id} className="rounded-lg bg-white/70 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={item.status} />
                  <span className="text-sm text-stone">
                    Wk {item.week_number} ·{" "}
                    {formatMatchDateTime(item.scheduled_datetime, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <TeamName name={formatMatchTeamName(item.home_team)} />
                  <span className="text-stone">vs</span>
                  <TeamName name={formatMatchTeamName(item.away_team)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
