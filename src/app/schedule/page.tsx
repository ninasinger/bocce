"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TeamName } from "@/components/TeamName";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonCard } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { errorMessageFromData, fetchJson } from "@/lib/clientFetch";
import { formatMatchDateTime, formatMatchTeamName, type TeamRef } from "@/lib/matchFormat";
import { getCurrentWeek } from "@/lib/week";

type Season = { id: string; name: string; year: number };
type Team = { id: string; name: string };
type MatchRow = {
  id: string;
  week_number: number;
  scheduled_datetime: string | null;
  status: string;
  notes: string | null;
  home_team: TeamRef;
  away_team: TeamRef;
  home_games_won: number | null;
  away_games_won: number | null;
  home_total_score: number | null;
  away_total_score: number | null;
};

export default function SchedulePage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonId, setSeasonId] = useState("");
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number | "all">(1);
  const [exportScope, setExportScope] = useState<"league" | "team">("league");
  const [exportTeamId, setExportTeamId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSchedule = useCallback(async () => {
    if (!seasonId) {
      setMatches([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { response, data } = await fetchJson<{ matches?: MatchRow[]; error?: string }>(
        `/api/seasons/${seasonId}/schedule`
      );
      if (!response.ok) {
        setError(errorMessageFromData(data, "Failed to load schedule"));
        setMatches([]);
        return;
      }
      const loadedMatches = data.matches || [];
      setMatches(loadedMatches);
      setSelectedWeek(getCurrentWeek(loadedMatches));
    } catch {
      setError("Failed to load schedule");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    async function loadSeasons() {
      try {
        const { data } = await fetchJson<{ seasons?: Season[] }>("/api/seasons");
        const list: Season[] = data.seasons || [];
        setSeasons(list);
        setSeasonId(list[0]?.id || "");
      } catch {
        setError("Could not load seasons");
      }
    }

    loadSeasons();
  }, []);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  useEffect(() => {
    async function loadTeams() {
      if (!seasonId) {
        setTeams([]);
        setExportTeamId("");
        return;
      }
      const { data } = await fetchJson<{ teams?: Team[] }>(`/api/seasons/${seasonId}/teams`);
      const list = data.teams || [];
      setTeams(list);
      setExportTeamId((current) => (current && list.some((team) => team.id === current) ? current : ""));
    }
    loadTeams();
  }, [seasonId]);

  const weeks = useMemo(
    () => Array.from(new Set(matches.map((match) => match.week_number))).sort((a, b) => a - b),
    [matches]
  );
  const visibleMatches = useMemo(
    () =>
      selectedWeek === "all"
        ? matches
        : matches.filter((match) => match.week_number === selectedWeek),
    [matches, selectedWeek]
  );
  const groupedMatches = useMemo(() => {
    const groups: Record<string, MatchRow[]> = {
      Tuesday: [],
      Thursday: [],
      Other: []
    };
    for (const match of visibleMatches) {
      if (!match.scheduled_datetime) {
        groups.Other.push(match);
        continue;
      }
      const day = new Date(match.scheduled_datetime).toLocaleDateString("en-US", { weekday: "long" });
      if (day === "Tuesday" || day === "Thursday") {
        groups[day].push(match);
      } else {
        groups.Other.push(match);
      }
    }
    return groups;
  }, [visibleMatches]);

  function winnerText(item: MatchRow) {
    if (item.home_total_score == null || item.away_total_score == null) return "";
    const homeName = formatMatchTeamName(item.home_team);
    const awayName = formatMatchTeamName(item.away_team);
    if (item.home_total_score > item.away_total_score) return `Winner: ${homeName}`;
    if (item.away_total_score > item.home_total_score) return `Winner: ${awayName}`;
    return "Winner: Tie";
  }

  function courtText(item: MatchRow) {
    if (!item.notes) return "";
    const match = item.notes.match(/Court\s*\d+/i);
    return match ? match[0] : "";
  }

  function exportScheduleCsv() {
    if (!seasonId) return;
    const params = new URLSearchParams();
    if (exportScope === "team" && exportTeamId) {
      params.set("teamId", exportTeamId);
    }
    const query = params.toString();
    window.location.href = `/api/seasons/${seasonId}/schedule.csv${query ? `?${query}` : ""}`;
  }

  return (
    <main className="card p-4 md:p-6">
      <h2 className="section-title">Weekly schedule</h2>

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
          <select
            className="w-24 rounded-xl border border-white/60 bg-white/70 px-2 py-2.5 text-sm font-semibold md:w-28 md:px-3 md:text-base"
            value={selectedWeek}
            onChange={(event) =>
              setSelectedWeek(event.target.value === "all" ? "all" : Number(event.target.value))
            }
          >
            {weeks.length === 0 ? <option value={1}>Wk 1</option> : null}
            {weeks.length > 0 ? <option value="all">All</option> : null}
            {weeks.map((week) => (
              <option key={week} value={week}>
                Wk {week}
              </option>
            ))}
          </select>
          <button
            onClick={loadSchedule}
            className="tap flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/70"
            aria-label="Refresh"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-stone">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
        <div className="mt-2 grid grid-cols-1 gap-2 md:flex md:items-center md:gap-3">
          <select
            className="min-w-0 rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-sm font-semibold md:w-44 md:text-base"
            value={exportScope}
            onChange={(event) => setExportScope(event.target.value as "league" | "team")}
          >
            <option value="league">Export full league</option>
            <option value="team">Export one team</option>
          </select>
          {exportScope === "team" ? (
            <select
              className="min-w-0 rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-sm font-semibold md:w-64 md:text-base"
              value={exportTeamId}
              onChange={(event) => setExportTeamId(event.target.value)}
            >
              <option value="">Choose team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          ) : null}
          <button
            onClick={exportScheduleCsv}
            disabled={exportScope === "team" && !exportTeamId}
            className="tap rounded-xl border border-white/60 bg-white/80 px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export schedule CSV
          </button>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      <p className="mt-3 text-xs text-stone">
        Pending other score means one team submitted scores and we are waiting on the other team.
      </p>

      <div className="mt-4 space-y-3">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : visibleMatches.length === 0 ? (
          <EmptyState
            icon="calendar"
            message={`No matches scheduled for ${selectedWeek === "all" ? "the selected view" : `week ${selectedWeek}`}.`}
          />
        ) : (
          <>
            {(["Tuesday", "Thursday", "Other"] as const).map((day) => (
              groupedMatches[day].length > 0 ? (
                <section key={day} className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-stone">
                    {day}
                  </h3>
                  {groupedMatches[day].map((item) => (
                    <div key={item.id} className="tap rounded-xl bg-white/70 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={item.status} />
                        <span className="text-xs text-stone">
                          {formatMatchDateTime(item.scheduled_datetime, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 font-semibold">
                        <TeamName name={formatMatchTeamName(item.home_team)} />
                        <span className="text-stone font-normal">vs</span>
                        <TeamName name={formatMatchTeamName(item.away_team)} />
                      </div>
                      {(item.status === "verified" || item.status === "corrected") &&
                        item.home_total_score != null && item.away_total_score != null ? (
                        <p className="mt-1 text-xs text-stone">
                          Final: {item.home_total_score}-{item.away_total_score}
                          {item.home_games_won != null && item.away_games_won != null
                            ? ` | Games: ${item.home_games_won}-${item.away_games_won}`
                            : null}
                        </p>
                      ) : null}
                      {(item.status === "verified" || item.status === "corrected") && winnerText(item) ? (
                        <p className="mt-1 text-xs font-semibold text-moss">{winnerText(item)}</p>
                      ) : null}
                      {courtText(item) ? <p className="mt-1 text-xs text-stone">{courtText(item)}</p> : null}
                      {item.notes && !courtText(item) ? <p className="mt-1 text-xs text-stone">{item.notes}</p> : null}
                    </div>
                  ))}
                </section>
              ) : null
            ))}
          </>
        )}
      </div>
    </main>
  );
}
