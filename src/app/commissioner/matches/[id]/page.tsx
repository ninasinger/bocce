"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonCard } from "@/components/Skeleton";
import { errorMessageFromData, fetchJson } from "@/lib/clientFetch";
import { formatMatchTeamName, type TeamRef } from "@/lib/matchFormat";

type MatchData = {
  id: string;
  week_number: number;
  status: string;
  home_team: TeamRef;
  away_team: TeamRef;
};

type Submission = {
  id: string;
  submitted_team: TeamRef;
  game1_home_score: number;
  game1_away_score: number;
  game2_home_score: number;
  game2_away_score: number;
  notes: string | null;
};

type ScoreHistoryItem = {
  id: string;
  created_at: string;
  actor_role: string;
  action: string;
  before_values: Record<string, unknown> | null;
  after_values: Record<string, unknown> | null;
};

export default function CommissionerMatchReview() {
  const router = useRouter();
  const params = useParams();
  const matchId = String(params.id);

  const [match, setMatch] = useState<MatchData | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [history, setHistory] = useState<ScoreHistoryItem[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const { response, data } = await fetchJson<{ session?: { role?: string } }>("/api/auth/session");
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

    async function loadData() {
      setError("");
      const [matchResult, submissionsResult, historyResult] = await Promise.all([
        fetchJson<{ match?: MatchData; error?: string }>(`/api/matches/${matchId}`),
        fetchJson<{ submissions?: Submission[]; error?: string }>(`/api/matches/${matchId}/submissions`),
        fetchJson<{ history?: ScoreHistoryItem[]; error?: string }>(`/api/matches/${matchId}/history`)
      ]);

      if (!matchResult.response.ok) {
        setError(errorMessageFromData(matchResult.data, "Could not load match"));
        return;
      }
      if (!submissionsResult.response.ok) {
        setError(errorMessageFromData(submissionsResult.data, "Could not load submissions"));
        return;
      }
      if (!historyResult.response.ok) {
        setError(errorMessageFromData(historyResult.data, "Could not load score history"));
        return;
      }

      setMatch(matchResult.data.match || null);
      setSubmissions(submissionsResult.data.submissions || []);
      setHistory(historyResult.data.history || []);
    }

    loadData();
  }, [matchId, authorized]);

  async function onCorrect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      game1_home_score: Number(form.get("game1_home_score")),
      game1_away_score: Number(form.get("game1_away_score")),
      game2_home_score: Number(form.get("game2_home_score")),
      game2_away_score: Number(form.get("game2_away_score")),
      reason: String(form.get("reason") || ""),
      notes: String(form.get("notes") || "")
    };

    const { response, data } = await fetchJson<{ error?: string }>(`/api/matches/${matchId}/correct`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      setError(errorMessageFromData(data, "Correction failed"));
      return;
    }

    setMessage("Correction saved.");
    const historyResult = await fetchJson<{ history?: ScoreHistoryItem[] }>(
      `/api/matches/${matchId}/history`
    );
    if (historyResult.response.ok) {
      setHistory(historyResult.data.history || []);
    }
  }

  if (!authorized) {
    return (
      <main className="card p-4 md:p-6">
        <p className="text-sm text-stone">Checking commissioner access...</p>
      </main>
    );
  }

  return (
    <main className="card p-4 md:p-6">
      <a href="/commissioner" className="tap inline-flex items-center gap-1 text-sm font-semibold text-moss">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to dashboard
      </a>

      <h2 className="section-title mt-3">Match review</h2>
      <p className="mt-1 text-sm text-stone">
        Compare submissions and enter an official correction if needed.
      </p>

      {match ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={match.status} />
            <span className="text-sm font-semibold">
            Week {match.week_number} &middot; {formatMatchTeamName(match.home_team, "Team")} vs{" "}
            {formatMatchTeamName(match.away_team, "Team")}
          </span>
        </div>
      ) : !error ? (
        <div className="mt-3">
          <SkeletonCard />
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-moss">{message}</p> : null}

      <h3 className="section-title mt-6 text-base">Submissions</h3>
      {submissions.length === 0 && !error ? (
        <div className="mt-3 space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="mt-3 space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
          {submissions.map((submission) => (
            <div key={submission.id} className="rounded-xl bg-white/70 p-3 md:p-4">
              <p className="text-xs uppercase tracking-wide text-stone">
                {formatMatchTeamName(submission.submitted_team, "Team")} submission
              </p>
              <div className="mt-2 space-y-1">
                <p className="font-semibold">
                  Game 1: {submission.game1_home_score} - {submission.game1_away_score}
                </p>
                <p className="font-semibold">
                  Game 2: {submission.game2_home_score} - {submission.game2_away_score}
                </p>
              </div>
              <p className="mt-2 text-sm text-stone">Notes: {submission.notes || "None"}</p>
            </div>
          ))}
        </div>
      )}

      <h3 className="section-title mt-6 text-base">Score history</h3>
      <p className="mt-1 text-sm text-stone">
        Immutable event log for submissions and official score changes.
      </p>
      {history.length === 0 ? (
        <p className="mt-3 text-sm text-stone">No history entries yet for this match.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {history.map((item) => (
            <div key={item.id} className="rounded-xl border border-white/60 bg-white/70 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status="verified" />
                <span className="text-xs text-stone">
                  {new Date(item.created_at).toLocaleString()}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-stone">
                  {item.actor_role}
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold">{item.action.replace(/_/g, " ")}</p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <pre className="overflow-x-auto rounded-lg bg-white/80 p-2 text-xs text-stone">
                  before: {JSON.stringify(item.before_values || {}, null, 2)}
                </pre>
                <pre className="overflow-x-auto rounded-lg bg-white/80 p-2 text-xs text-stone">
                  after: {JSON.stringify(item.after_values || {}, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 className="section-title mt-6 text-base">Commissioner correction</h3>
      <form className="mt-3 grid gap-3" onSubmit={onCorrect}>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5 text-sm font-semibold">
            G1 &middot; {match ? formatMatchTeamName(match.home_team, "Home") : "Home"}
            <input
              name="game1_home_score"
              type="number"
              min={0}
              step={1}
              required
              className="rounded-xl border border-white/60 bg-white/70 px-3 py-2.5"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            G1 &middot; {match ? formatMatchTeamName(match.away_team, "Away") : "Away"}
            <input
              name="game1_away_score"
              type="number"
              min={0}
              step={1}
              required
              className="rounded-xl border border-white/60 bg-white/70 px-3 py-2.5"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5 text-sm font-semibold">
            G2 &middot; {match ? formatMatchTeamName(match.home_team, "Home") : "Home"}
            <input
              name="game2_home_score"
              type="number"
              min={0}
              step={1}
              required
              className="rounded-xl border border-white/60 bg-white/70 px-3 py-2.5"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            G2 &middot; {match ? formatMatchTeamName(match.away_team, "Away") : "Away"}
            <input
              name="game2_away_score"
              type="number"
              min={0}
              step={1}
              required
              className="rounded-xl border border-white/60 bg-white/70 px-3 py-2.5"
            />
          </label>
        </div>
        <label className="grid gap-1.5 text-sm font-semibold">
          Correction reason
          <textarea
            name="reason"
            required
            className="min-h-[80px] rounded-xl border border-white/60 bg-white/70 px-3 py-2.5"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          Notes (optional)
          <textarea
            name="notes"
            className="min-h-[80px] rounded-xl border border-white/60 bg-white/70 px-3 py-2.5"
          />
        </label>
        <button className="tap-btn rounded-xl bg-moss px-4 py-3 font-semibold text-white">
          Save correction
        </button>
      </form>

    </main>
  );
}
