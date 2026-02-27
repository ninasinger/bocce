"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TeamName } from "@/components/TeamName";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonCard } from "@/components/Skeleton";
import { errorMessageFromData, fetchJson } from "@/lib/clientFetch";
import { formatMatchTeamName, type TeamRef } from "@/lib/matchFormat";
import { getCurrentWeek } from "@/lib/week";

type Season = { id: string; name: string; year: number };
type MatchRow = {
  id: string;
  week_number: number;
  status: string;
  scheduled_datetime: string | null;
  home_team: TeamRef;
  away_team: TeamRef;
};

export default function CommissionerDashboard() {
  const router = useRouter();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonId, setSeasonId] = useState("");
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [message, setMessage] = useState("");
  const [emailPreview, setEmailPreview] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [driveEmail, setDriveEmail] = useState("");

  useEffect(() => {
    async function checkSession() {
      const { response, data } = await fetchJson<{ session?: { role?: string } }>(
        "/api/auth/session"
      );
      if (!response.ok || data.session?.role !== "commissioner") {
        router.replace("/commissioner/login");
        return;
      }
      setAuthorized(true);
    }

    checkSession();
  }, [router]);

  useEffect(() => {
    if (!authorized) return;

    async function loadSeasons() {
      const { data } = await fetchJson<{ seasons?: Season[] }>("/api/seasons");
      const list: Season[] = data.seasons || [];
      setSeasons(list);
      setSeasonId(list[0]?.id || "");
    }

    loadSeasons();
  }, [authorized]);

  useEffect(() => {
    if (!authorized || !seasonId) {
      setMatches([]);
      return;
    }

    async function loadSchedule() {
      const { data } = await fetchJson<{ matches?: MatchRow[] }>(`/api/seasons/${seasonId}/schedule`);
      setMatches(data.matches || []);
    }

    loadSchedule();
  }, [seasonId, authorized]);

  useEffect(() => {
    if (!authorized || !seasonId) return;
    async function loadDriveStatus() {
      const { data } = await fetchJson<{ connected?: boolean; commissionerEmail?: string }>(
        `/api/integrations/google-drive/status?seasonId=${encodeURIComponent(seasonId)}`
      );
      setDriveConnected(Boolean(data.connected));
      setDriveEmail(data.commissionerEmail || "");
    }
    loadDriveStatus();
  }, [seasonId, authorized]);

  const weeks = useMemo(() => {
    const values = Array.from(new Set(matches.map((m) => m.week_number))).sort((a, b) => a - b);
    const currentWeek = getCurrentWeek(matches);
    if (values.length > 0 && !values.includes(selectedWeek)) {
      setSelectedWeek(currentWeek);
    }
    return values;
  }, [matches, selectedWeek]);

  const weekMatches = matches.filter((m) => m.week_number === selectedWeek);
  const disputes = weekMatches.filter((m) => m.status === "disputed");
  const missingSubmissions = weekMatches.filter((m) =>
    ["scheduled", "awaiting_submission", "pending_verification"].includes(m.status)
  );
  const nextActionMatch = disputes[0] || missingSubmissions[0] || null;

  async function closeWeek() {
    setMessage("");
    const { response, data } = await fetchJson<{ error?: string }>(`/api/weeks/${selectedWeek}/close`, {
      method: "POST"
    });
    setMessage(
      response.ok ? `Week ${selectedWeek} closed.` : errorMessageFromData(data, "Could not close week")
    );
  }

  async function previewEmail() {
    setMessage("");
    const { response, data } = await fetchJson<{ error?: string; email?: { html?: string } }>(
      "/api/email/preview",
      {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekNumber: selectedWeek })
    }
    );
    if (!response.ok) {
      setMessage(errorMessageFromData(data, "Could not preview email"));
      return;
    }
    setEmailPreview(data.email?.html || "");
    setMessage("Email preview loaded.");
  }

  async function backupToDrive() {
    setMessage("");
    const { response, data } = await fetchJson<{ error?: string }>("/api/backups/drive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekNumber: selectedWeek })
    });
    setMessage(response.ok ? "Backup uploaded to Drive." : errorMessageFromData(data, "Drive backup failed"));
  }

  function connectDrive() {
    if (!seasonId) {
      setMessage("Select a season first.");
      return;
    }
    window.location.href = `/api/auth/google/start?mode=drive&seasonId=${encodeURIComponent(
      seasonId
    )}`;
  }

  if (!authorized) {
    return (
      <main className="card p-4 md:p-6">
        <p className="text-sm text-stone">Checking commissioner access...</p>
      </main>
    );
  }

  return (
    <main className="space-y-4 md:space-y-6">
      <section className="card p-4 md:p-6">
        <h2 className="section-title">Admin dashboard</h2>
        <p className="mt-1 text-sm text-stone">
          Review submissions, resolve disputes, close the week, and trigger exports.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Season
            <select
              className="rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-base"
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
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Week
            <select
              className="rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-base"
              value={selectedWeek}
              onChange={(event) => setSelectedWeek(Number(event.target.value))}
            >
              {weeks.length === 0 ? <option value={1}>1</option> : null}
              {weeks.map((week) => (
                <option key={week} value={week}>
                  Week {week}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 md:flex md:flex-wrap md:gap-3">
          <button
            onClick={closeWeek}
            className="tap-btn rounded-xl bg-moss px-4 py-2.5 text-sm font-semibold text-white"
          >
            Close week
          </button>
          <button
            onClick={previewEmail}
            className="tap-btn rounded-xl bg-white/80 px-4 py-2.5 text-sm font-semibold"
          >
            Preview email
          </button>
          <button
            onClick={backupToDrive}
            className="tap-btn rounded-xl bg-white/80 px-4 py-2.5 text-sm font-semibold"
          >
            Backup to Drive
          </button>
          <button
            onClick={connectDrive}
            className="tap-btn rounded-xl bg-white/80 px-4 py-2.5 text-sm font-semibold"
          >
            {driveConnected ? "Reconnect Drive" : "Connect Drive"}
          </button>
        </div>

        {message ? <p className="mt-3 text-sm text-moss">{message}</p> : null}
        <p className="mt-2 text-xs text-stone">
          Drive: {driveConnected ? `Connected (${driveEmail || "Google"})` : "Not connected"}
        </p>
        {emailPreview ? (
          <details className="mt-4 rounded-xl bg-white/70 p-3 md:p-4">
            <summary className="cursor-pointer text-sm font-semibold">Email preview</summary>
            <div className="mt-3 overflow-x-auto text-sm" dangerouslySetInnerHTML={{ __html: emailPreview }} />
          </details>
        ) : null}
      </section>

      <section className="card p-4 md:p-6">
        <h3 className="section-title">Action queue</h3>
        <p className="mt-1 text-sm text-stone">Week {selectedWeek} priorities</p>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-white/70 p-3 md:p-4">
            <p className="text-xs uppercase tracking-wide text-stone">Disputes</p>
            <p className="mt-1 text-2xl font-display">{disputes.length}</p>
          </div>
          <div className="rounded-xl bg-white/70 p-3 md:p-4">
            <p className="text-xs uppercase tracking-wide text-stone">Missing</p>
            <p className="mt-1 text-2xl font-display">{missingSubmissions.length}</p>
          </div>
          <div className="col-span-2 rounded-xl bg-white/70 p-3 md:col-span-1 md:p-4">
            <p className="text-xs uppercase tracking-wide text-stone">Next action</p>
            {nextActionMatch ? (
              <a
                href={`/commissioner/matches/${nextActionMatch.id}`}
                className="tap-btn mt-2 inline-flex rounded-lg bg-moss px-3 py-2 text-xs font-semibold text-white"
              >
                Review next match
              </a>
            ) : (
              <p className="mt-2 text-sm text-stone">All clear for this week</p>
            )}
          </div>
        </div>
      </section>

      <section className="card p-4 md:p-6">
        <h3 className="section-title">Week {selectedWeek} matches</h3>
        <div className="mt-3 space-y-2">
          {weekMatches.length === 0 ? (
            <p className="text-sm text-stone">No matches for week {selectedWeek}.</p>
          ) : null}
          {weekMatches.map((match) => (
            <div key={match.id} className="rounded-xl bg-white/70 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={match.status} />
                    <span className="text-xs text-stone">Wk {match.week_number}</span>
                  </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm">
                    <TeamName name={formatMatchTeamName(match.home_team)} />
                    <span className="text-stone">vs</span>
                    <TeamName name={formatMatchTeamName(match.away_team)} />
                  </div>
                </div>
                <a
                  href={`/commissioner/matches/${match.id}`}
                  className="tap-btn flex-shrink-0 rounded-lg bg-moss px-3 py-2 text-xs font-semibold text-white"
                >
                  Review
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {disputes.length > 0 ? (
        <section className="card p-4 md:p-6">
          <h3 className="section-title">Disputes</h3>
          <div className="mt-3 space-y-2">
            {disputes.map((match) => (
              <div key={match.id} className="rounded-xl bg-red-50/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status="disputed" />
                      <span className="text-xs text-stone">Week {match.week_number}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm">
                      <TeamName name={formatMatchTeamName(match.home_team)} />
                      <span className="text-stone">vs</span>
                      <TeamName name={formatMatchTeamName(match.away_team)} />
                    </div>
                  </div>
                  <a
                    href={`/commissioner/matches/${match.id}`}
                    className="tap-btn flex-shrink-0 rounded-lg bg-moss px-3 py-2 text-xs font-semibold text-white"
                  >
                    Review
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
