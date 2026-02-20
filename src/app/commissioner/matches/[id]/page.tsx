"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatTeamName } from "@/lib/display";

type TeamRef = { name: string } | { name: string }[] | null;
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

function teamName(team: TeamRef) {
  if (!team) return "Team";
  if (Array.isArray(team)) return team[0]?.name ? formatTeamName(team[0].name) : "Team";
  return team.name ? formatTeamName(team.name) : "Team";
}

export default function CommissionerMatchReview() {
  const router = useRouter();
  const params = useParams();
  const matchId = String(params.id);

  const [match, setMatch] = useState<MatchData | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const res = await fetch("/api/auth/session");
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
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

    async function loadData() {
      setError("");
      const [matchRes, submissionsRes] = await Promise.all([
        fetch(`/api/matches/${matchId}`),
        fetch(`/api/matches/${matchId}/submissions`)
      ]);

      const matchText = await matchRes.text();
      const submissionsText = await submissionsRes.text();
      const matchJson = matchText ? JSON.parse(matchText) : {};
      const submissionsJson = submissionsText ? JSON.parse(submissionsText) : {};

      if (!matchRes.ok) {
        setError(matchJson.error || "Could not load match");
        return;
      }
      if (!submissionsRes.ok) {
        setError(submissionsJson.error || "Could not load submissions");
        return;
      }

      setMatch(matchJson.match || null);
      setSubmissions(submissionsJson.submissions || []);
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

    const res = await fetch(`/api/matches/${matchId}/correct`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    const json = text ? JSON.parse(text) : {};

    if (!res.ok) {
      setError(json.error || "Correction failed");
      return;
    }

    setMessage("Correction saved.");
  }

  if (!authorized) {
    return (
      <main className="card p-6">
        <p className="text-sm text-stone">Checking commissioner access...</p>
      </main>
    );
  }

  return (
    <main className="card p-6">
      <h2 className="section-title">Match review</h2>
      <p className="mt-2 text-sm text-stone">
        Compare submissions and enter an official correction if needed.
      </p>

      {match ? (
        <p className="mt-3 text-sm font-semibold">
          Week {match.week_number} · {teamName(match.home_team)} vs {teamName(match.away_team)}
        </p>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-moss">{message}</p> : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {submissions.map((submission) => (
          <div key={submission.id} className="rounded-xl bg-white/70 p-4">
            <p className="text-xs uppercase tracking-wide text-stone">
              {teamName(submission.submitted_team)} submission
            </p>
            <p className="mt-2 font-semibold">
              Game 1: {submission.game1_home_score} - {submission.game1_away_score}
            </p>
            <p className="font-semibold">
              Game 2: {submission.game2_home_score} - {submission.game2_away_score}
            </p>
            <p className="mt-2 text-sm">Notes: {submission.notes || "None"}</p>
          </div>
        ))}
      </div>

      <form className="mt-6 grid gap-4" onSubmit={onCorrect}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Official Game 1 · {match ? teamName(match.home_team) : "Home"}
            <input
              name="game1_home_score"
              type="number"
              min={0}
              max={20}
              step={1}
              required
              className="rounded-xl border border-white/60 bg-white/70 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Official Game 1 · {match ? teamName(match.away_team) : "Away"}
            <input
              name="game1_away_score"
              type="number"
              min={0}
              max={20}
              step={1}
              required
              className="rounded-xl border border-white/60 bg-white/70 px-4 py-3"
            />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Official Game 2 · {match ? teamName(match.home_team) : "Home"}
            <input
              name="game2_home_score"
              type="number"
              min={0}
              max={20}
              step={1}
              required
              className="rounded-xl border border-white/60 bg-white/70 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Official Game 2 · {match ? teamName(match.away_team) : "Away"}
            <input
              name="game2_away_score"
              type="number"
              min={0}
              max={20}
              step={1}
              required
              className="rounded-xl border border-white/60 bg-white/70 px-4 py-3"
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-semibold">
          Correction reason
          <textarea
            name="reason"
            required
            className="min-h-[100px] rounded-xl border border-white/60 bg-white/70 px-4 py-3"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Notes (optional)
          <textarea
            name="notes"
            className="min-h-[100px] rounded-xl border border-white/60 bg-white/70 px-4 py-3"
          />
        </label>
        <button className="rounded-xl bg-moss px-4 py-3 font-semibold text-white">
          Save correction
        </button>
      </form>
    </main>
  );
}
