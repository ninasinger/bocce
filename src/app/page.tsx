"use client";

import { useEffect, useMemo, useState } from "react";
import { TeamName } from "@/components/TeamName";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton, SkeletonCard, SkeletonStandingRow, SkeletonAwardCard } from "@/components/Skeleton";
import { formatTeamName } from "@/lib/display";
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
  home_team: { name: string } | { name: string }[] | null;
  away_team: { name: string } | { name: string }[] | null;
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
  const [awards, setAwards] = useState<Award[]>([]);
  const [awardsWeek, setAwardsWeek] = useState<number | null>(null);
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
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
          setLoading(false);
          return;
        }
        const list: Season[] = json.seasons || [];
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
        const [standingsRes, scheduleRes, awardsRes] = await Promise.all([
          fetch(`/api/seasons/${seasonId}/standings`),
          fetch(`/api/seasons/${seasonId}/schedule`),
          fetch(`/api/seasons/${seasonId}/awards`)
        ]);
        const standingsText = await standingsRes.text();
        const scheduleText = await scheduleRes.text();
        const awardsText = await awardsRes.text();
        const standingsJson = standingsText ? JSON.parse(standingsText) : {};
        const scheduleJson = scheduleText ? JSON.parse(scheduleText) : {};
        const awardsJson = awardsText ? JSON.parse(awardsText) : {};

        if (!standingsRes.ok || !scheduleRes.ok) {
          setError(
            standingsJson.error || scheduleJson.error || "Could not load home data"
          );
          setStandings([]);
          setMatches([]);
          return;
        }

        setStandings((standingsJson.standings || []).slice(0, 6));
        const allMatches: MatchRow[] = scheduleJson.matches || [];
        const week = getCurrentWeek(allMatches);
        setCurrentWeek(week);
        const weekMatches = allMatches.filter((m) => m.week_number === week);
        setMatches(weekMatches);
        setAwards(awardsJson.awards || []);
        setAwardsWeek(awardsJson.week || null);
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
                {season.name} ({season.year})
              </option>
            ))}
          </select>
        </div>
        {loading ? (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        ) : (
          <div className="mt-4 grid gap-3 grid-cols-3">
            <div className="rounded-xl bg-field/80 p-3">
              <p className="text-[10px] uppercase tracking-wide text-stone">Matches</p>
              <p className="mt-1 text-2xl font-display">{matches.length}</p>
            </div>
            <div className="rounded-xl bg-field/80 p-3">
              <p className="text-[10px] uppercase tracking-wide text-stone">Teams</p>
              <p className="mt-1 text-2xl font-display">{standings.length}</p>
            </div>
            <div className="rounded-xl bg-field/80 p-3">
              <p className="text-[10px] uppercase tracking-wide text-stone">Verified</p>
              <p className="mt-1 text-2xl font-display">{verifiedCount}</p>
            </div>
          </div>
        )}
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
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-stone">
                      {award.title}
                    </p>
                    <p className="mt-0.5 font-display text-base leading-tight">{award.team}</p>
                    <p className="mt-0.5 text-xs text-stone">{award.detail}</p>
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
                  <TeamName name={formatTeamName(row.teamName)} />
                </span>
                <span className="font-semibold">{row.gamesWon} <span className="text-xs text-stone">GW</span></span>
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
                  <span className="text-xs text-stone">Wk {item.week_number} · {formatWhen(item.scheduled_datetime)}</span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <TeamName name={teamName(item.home_team)} />
                  <span className="text-stone">vs</span>
                  <TeamName name={teamName(item.away_team)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
