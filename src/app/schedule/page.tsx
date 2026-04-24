"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TeamName } from "@/components/TeamName";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonCard } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { errorMessageFromData, fetchJson } from "@/lib/clientFetch";
import { formatMatchDateTime, formatMatchTeamName, type TeamRef } from "@/lib/matchFormat";

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
type SchedulePageResponse = {
  matches?: MatchRow[];
  teams?: Team[];
  error?: string;
};

export default function SchedulePage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonId, setSeasonId] = useState("");
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number | "all">("all");
  const [exportScope, setExportScope] = useState<"league" | "team">("league");
  const [exportTeamId, setExportTeamId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSchedule = useCallback(async () => {
    if (!seasonId) {
      setMatches([]);
      setTeams([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { response, data } = await fetchJson<SchedulePageResponse>(
        `/api/seasons/${seasonId}/schedule-page`
      );
      if (!response.ok) {
        setError(errorMessageFromData(data, "Failed to load schedule"));
        setMatches([]);
        setTeams([]);
        return;
      }
      const now = Date.now();
      const loadedMatches = (data.matches || []).filter((match) => {
        if (!match.scheduled_datetime) return true;
        const date = new Date(match.scheduled_datetime);
        if (Number.isNaN(date.getTime())) return true;
        return date.getTime() >= now;
      });
      setMatches(loadedMatches);
      setTeams(data.teams || []);
      const availableTeams = data.teams || [];
      setExportTeamId((current) =>
        current && availableTeams.some((team) => team.id === current) ? current : ""
      );
      setSelectedWeek("all");
    } catch {
      setError("Failed to load schedule");
      setMatches([]);
      setTeams([]);
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
    const groups: Array<{ label: string; matches: MatchRow[] }> = [];
    const groupMap = new Map<string, MatchRow[]>();

    for (const match of visibleMatches) {
      let label = "Other";
      if (match.scheduled_datetime) {
        const date = new Date(match.scheduled_datetime);
        if (!Number.isNaN(date.getTime())) {
          label = date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            timeZone: "America/New_York"
          });
        }
      }

      if (!groupMap.has(label)) {
        const bucket: MatchRow[] = [];
        groupMap.set(label, bucket);
        groups.push({ label, matches: bucket });
      }

      groupMap.get(label)?.push(match);
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

  function exportSchedulePdf() {
    if (!seasonId) return;
    const params = new URLSearchParams();
    if (exportScope === "team" && exportTeamId) {
      params.set("teamId", exportTeamId);
    }
    const query = params.toString();
    window.location.href = `/api/seasons/${seasonId}/schedule.pdf${query ? `?${query}` : ""}`;
  }

  function exportGoogleCalendar() {
    if (!seasonId || !exportTeamId) return;
    const params = new URLSearchParams({ teamId: exportTeamId });
    window.location.href = `/api/seasons/${seasonId}/schedule.ics?${params.toString()}`;
  }

  return (
    <main className="card p-4 md:p-6">
      <h2 className="section-title">Schedule</h2>

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
            className="tap flex h-11 w-11 items-center justify-center rounded-xl border border-white/60 bg-white/70"
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
            className="w-full min-w-0 rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-sm font-semibold md:w-56 md:text-base"
            value={exportScope}
            onChange={(event) => setExportScope(event.target.value as "league" | "team")}
          >
            <option value="league">Export Full League</option>
            <option value="team">Export Single Team</option>
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
            onClick={exportSchedulePdf}
            disabled={exportScope === "team" && !exportTeamId}
            className="tap inline-flex items-center justify-center gap-2 rounded-xl bg-moss px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            {exportScope === "team"
              ? "Download Team Calendar (.pdf)"
              : "Download Full League Schedule (.pdf)"}
          </button>
          {exportScope === "team" ? (
            <button
              onClick={exportGoogleCalendar}
              disabled={!exportTeamId}
              className="tap inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Download Team Calendar (.ics)
            </button>
          ) : null}
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      <p className="mt-3 text-sm text-stone">
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
            {groupedMatches.map((group) => (
              group.matches.length > 0 ? (
                <section key={group.label} className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-stone">
                    {group.label}
                  </h3>
                  {group.matches.map((item) => (
                    <div key={item.id} className="tap rounded-xl bg-white/70 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={item.status} />
                        <span className="text-sm text-stone">
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
                        <p className="mt-1 text-sm text-stone">
                          Final: {item.home_total_score}-{item.away_total_score}
                          {item.home_games_won != null && item.away_games_won != null
                            ? ` | Games: ${item.home_games_won}-${item.away_games_won}`
                            : null}
                        </p>
                      ) : null}
                      {(item.status === "verified" || item.status === "corrected") && winnerText(item) ? (
                        <p className="mt-1 text-sm font-semibold text-moss">{winnerText(item)}</p>
                      ) : null}
                      {courtText(item) ? <p className="mt-1 text-sm text-stone">{courtText(item)}</p> : null}
                      {item.notes && !courtText(item) ? <p className="mt-1 text-sm text-stone">{item.notes}</p> : null}
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
