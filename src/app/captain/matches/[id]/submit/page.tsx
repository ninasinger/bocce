"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { queueSubmission } from "@/lib/offlineQueue";

type TeamRef = { name: string } | { name: string }[] | null;
type MatchResponse = {
  id: string;
  home_team: TeamRef;
  away_team: TeamRef;
};

function getTeamName(team: TeamRef) {
  if (!team) return "Team";
  if (Array.isArray(team)) return team[0]?.name || "Team";
  return team.name || "Team";
}

export default function SubmitScorePage() {
  const params = useParams();
  const matchId = String(params.id);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [homeTeamName, setHomeTeamName] = useState("Home team");
  const [awayTeamName, setAwayTeamName] = useState("Away team");

  useEffect(() => {
    async function loadMatch() {
      try {
        const res = await fetch(`/api/matches/${matchId}`);
        const text = await res.text();
        const json = text ? JSON.parse(text) : {};
        if (!res.ok) {
          setError(json.error || "Could not load match details");
          return;
        }
        const match = json.match as MatchResponse;
        setHomeTeamName(getTeamName(match.home_team));
        setAwayTeamName(getTeamName(match.away_team));
      } catch {
        setError("Could not load match details");
      }
    }

    loadMatch();
  }, [matchId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setError(null);

    const formData = new FormData(event.currentTarget);

    const payload = {
      game1_home_score: formData.get("game1_home_score"),
      game1_away_score: formData.get("game1_away_score"),
      game2_home_score: formData.get("game2_home_score"),
      game2_away_score: formData.get("game2_away_score"),
      notes: formData.get("notes")
    };

    try {
      const res = await fetch(`/api/matches/${matchId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        const json = text ? JSON.parse(text) : {};
        setError(json.error || "Submission failed");
        return;
      }

      setStatus("Submitted. Awaiting verification.");
    } catch {
      queueSubmission({ matchId, payload, createdAt: new Date().toISOString() });
      setStatus("Saved locally. Will submit when online.");
    }
  }

  return (
    <main className="card p-6">
      <h2 className="section-title">Submit match score</h2>
      <p className="mt-2 text-sm text-stone">
        Enter whole-number scores for both games. Any non-negative score is allowed.
      </p>
      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Game 1 · {homeTeamName}
            <input
              name="game1_home_score"
              type="number"
              min={0}
              step={1}
              required
              className="rounded-xl border border-white/60 bg-white/70 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Game 1 · {awayTeamName}
            <input
              name="game1_away_score"
              type="number"
              min={0}
              step={1}
              required
              className="rounded-xl border border-white/60 bg-white/70 px-4 py-3"
            />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Game 2 · {homeTeamName}
            <input
              name="game2_home_score"
              type="number"
              min={0}
              step={1}
              required
              className="rounded-xl border border-white/60 bg-white/70 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Game 2 · {awayTeamName}
            <input
              name="game2_away_score"
              type="number"
              min={0}
              step={1}
              required
              className="rounded-xl border border-white/60 bg-white/70 px-4 py-3"
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-semibold">
          Notes (optional)
          <textarea
            name="notes"
            className="min-h-[100px] rounded-xl border border-white/60 bg-white/70 px-4 py-3"
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button className="rounded-xl bg-moss px-4 py-3 font-semibold text-white">
          Submit scores
        </button>
        {status ? <p className="text-sm text-moss">{status}</p> : null}
      </form>
    </main>
  );
}
