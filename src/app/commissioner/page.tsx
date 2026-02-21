"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatTeamName } from "@/lib/display";

type Season = { id: string; name: string; year: number };
type TeamRef = { name: string } | { name: string }[] | null;
type MatchRow = {
  id: string;
  week_number: number;
  status: string;
  scheduled_datetime: string | null;
  home_team: TeamRef;
  away_team: TeamRef;
};

function teamName(team: TeamRef) {
  if (!team) return "TBD";
  if (Array.isArray(team)) return team[0]?.name ? formatTeamName(team[0].name) : "TBD";
  return team.name ? formatTeamName(team.name) : "TBD";
}

function safeParseJson(text: string) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

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
      const res = await fetch("/api/auth/session");
      const text = await res.text();
      const json = safeParseJson(text);
      if (!res.ok || json.session?.role !== "commissioner") {
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
      const res = await fetch("/api/seasons");
      const text = await res.text();
      const json = safeParseJson(text);
      const list: Season[] = json.seasons || [];
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
      const res = await fetch(`/api/seasons/${seasonId}/schedule`);
      const text = await res.text();
      const json = safeParseJson(text);
      setMatches(json.matches || []);
    }

    loadSchedule();
  }, [seasonId, authorized]);

  useEffect(() => {
    if (!authorized || !seasonId) return;
    async function loadDriveStatus() {
      const res = await fetch(
        `/api/integrations/google-drive/status?seasonId=${encodeURIComponent(seasonId)}`
      );
      const text = await res.text();
      const json = safeParseJson(text);
      setDriveConnected(Boolean(json.connected));
      setDriveEmail(json.commissionerEmail || "");
    }
    loadDriveStatus();
  }, [seasonId, authorized]);

  const weeks = useMemo(() => {
    const values = Array.from(new Set(matches.map((m) => m.week_number))).sort((a, b) => a - b);
    if (values.length > 0 && !values.includes(selectedWeek)) {
      setSelectedWeek(values[0]);
    }
    return values;
  }, [matches, selectedWeek]);

  const weekMatches = matches.filter((m) => m.week_number === selectedWeek);
  const disputes = weekMatches.filter((m) => m.status === "disputed");

  async function closeWeek() {
    setMessage("");
    const res = await fetch(`/api/weeks/${selectedWeek}/close`, { method: "POST" });
    const text = await res.text();
    const json = safeParseJson(text);
    setMessage(res.ok ? `Week ${selectedWeek} closed.` : json.error || "Could not close week");
  }

  async function previewEmail() {
    setMessage("");
    const res = await fetch("/api/email/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekNumber: selectedWeek })
    });
    const text = await res.text();
    const json = safeParseJson(text);
    if (!res.ok) {
      setMessage(json.error || "Could not preview email");
      return;
    }
    setEmailPreview(json.email?.html || "");
    setMessage("Email preview loaded.");
  }

  async function backupToDrive() {
    setMessage("");
    const res = await fetch("/api/backups/drive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekNumber: selectedWeek })
    });
    const text = await res.text();
    const json = safeParseJson(text);
    setMessage(res.ok ? "Backup uploaded to Drive." : json.error || "Drive backup failed");
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
      <main className="card p-6">
        <p className="text-sm text-stone">Checking commissioner access...</p>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <section className="card p-6">
        <h2 className="section-title">Admin dashboard</h2>
        <p className="mt-2 text-sm text-stone">
          Review submissions, resolve disputes, close the week, and trigger exports.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Season
            <select
              className="rounded-xl border border-white/60 bg-white/70 px-4 py-3"
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
              className="rounded-xl border border-white/60 bg-white/70 px-4 py-3"
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

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={closeWeek}
            className="rounded-xl bg-moss px-4 py-2 text-sm font-semibold text-white"
          >
            Close week
          </button>
          <button
            onClick={previewEmail}
            className="rounded-xl bg-white/80 px-4 py-2 text-sm font-semibold"
          >
            Preview email
          </button>
          <button
            onClick={backupToDrive}
            className="rounded-xl bg-white/80 px-4 py-2 text-sm font-semibold"
          >
            Backup to Drive
          </button>
          <button
            onClick={connectDrive}
            className="rounded-xl bg-white/80 px-4 py-2 text-sm font-semibold"
          >
            {driveConnected ? "Reconnect Drive" : "Connect Drive"}
          </button>
        </div>

        {message ? <p className="mt-3 text-sm text-moss">{message}</p> : null}
        <p className="mt-2 text-xs text-stone">
          Drive: {driveConnected ? `Connected (${driveEmail || "Google"})` : "Not connected"}
        </p>
        {emailPreview ? (
          <details className="mt-4 rounded-xl bg-white/70 p-4">
            <summary className="cursor-pointer text-sm font-semibold">Email preview</summary>
            <div className="mt-3 text-sm" dangerouslySetInnerHTML={{ __html: emailPreview }} />
          </details>
        ) : null}
      </section>

      <section className="card p-6">
        <h3 className="section-title">Disputes</h3>
        <div className="mt-4 space-y-3">
          {disputes.length === 0 ? (
            <p className="text-sm text-stone">No disputes for week {selectedWeek}.</p>
          ) : null}
          {disputes.map((match) => (
            <div key={match.id} className="rounded-xl bg-white/70 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">
                  Week {match.week_number} · {teamName(match.home_team)} vs {teamName(match.away_team)}
                </p>
                <a
                  href={`/commissioner/matches/${match.id}`}
                  className="rounded-lg bg-moss px-3 py-2 text-xs font-semibold text-white"
                >
                  Review
                </a>
              </div>
              <p className="mt-1 text-sm text-stone">Disputed submissions</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
