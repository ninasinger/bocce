"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { queueSubmission } from "@/lib/offlineQueue";
import { TeamName } from "@/components/TeamName";
import { formatTeamName } from "@/lib/display";

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

type Step = "entry" | "confirm" | "success";

function ScoreStepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-stone">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="stepper-btn-minus"
          onClick={() => onChange(Math.max(0, value - 1))}
          aria-label={`Decrease ${label}`}
        >
          &minus;
        </button>
        <span className="w-14 text-center text-4xl font-display tabular-nums">
          {value}
        </span>
        <button
          type="button"
          className="stepper-btn-plus"
          onClick={() => onChange(value + 1)}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function computeLivePoints(scores: {
  g1h: number;
  g1a: number;
  g2h: number;
  g2a: number;
}) {
  const { g1h, g1a, g2h, g2a } = scores;
  let homePts = 0;
  let awayPts = 0;
  if (g1h > g1a) homePts += 1;
  if (g1a > g1h) awayPts += 1;
  if (g2h > g2a) homePts += 1;
  if (g2a > g2h) awayPts += 1;
  const homeTotal = g1h + g2h;
  const awayTotal = g1a + g2a;
  if (homeTotal > awayTotal) homePts += 1;
  if (awayTotal > homeTotal) awayPts += 1;
  return { homePts, awayPts, homeTotal, awayTotal };
}

export default function SubmitScorePage() {
  const params = useParams();
  const matchId = String(params.id);
  const [step, setStep] = useState<Step>("entry");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [homeTeamName, setHomeTeamName] = useState("Home");
  const [awayTeamName, setAwayTeamName] = useState("Away");

  const [g1h, setG1h] = useState(0);
  const [g1a, setG1a] = useState(0);
  const [g2h, setG2h] = useState(0);
  const [g2a, setG2a] = useState(0);
  const [notes, setNotes] = useState("");

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

  const live = useMemo(
    () => computeLivePoints({ g1h, g1a, g2h, g2a }),
    [g1h, g1a, g2h, g2a]
  );

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const payload = {
      game1_home_score: g1h,
      game1_away_score: g1a,
      game2_home_score: g2h,
      game2_away_score: g2a,
      notes: notes || undefined,
    };

    try {
      const res = await fetch(`/api/matches/${matchId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        const json = text ? JSON.parse(text) : {};
        setError(json.error || "Submission failed");
        setStep("entry");
        setSubmitting(false);
        return;
      }

      setStep("success");
    } catch {
      queueSubmission({
        matchId,
        payload,
        createdAt: new Date().toISOString(),
      });
      setStep("success");
    }
    setSubmitting(false);
  }

  // ── Success screen ──
  if (step === "success") {
    return (
      <main className="card p-6 text-center">
        <div className="success-pop mx-auto my-8 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-10 w-10 text-emerald-600"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="section-title">Scores submitted!</h2>
        <p className="mt-2 text-sm text-stone">
          Awaiting the other team&apos;s submission for verification.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <a
            href="/captain/matches"
            className="rounded-xl bg-moss px-6 py-3 text-center font-semibold text-white"
          >
            Back to my matches
          </a>
          <a
            href="/"
            className="rounded-xl bg-white/80 px-6 py-3 text-center font-semibold text-ink"
          >
            Go home
          </a>
        </div>
      </main>
    );
  }

  // ── Confirmation screen ──
  if (step === "confirm") {
    return (
      <main className="card p-6">
        <h2 className="section-title text-center">Confirm scores</h2>
        <p className="mt-2 text-center text-sm text-stone">
          Double-check before submitting.
        </p>

        <div className="mt-6 space-y-4">
          <div className="rounded-xl bg-white/70 p-4">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-stone">
              Game 1
            </p>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <TeamName name={formatTeamName(homeTeamName)} />
                <p className="mt-1 text-3xl font-display">{g1h}</p>
              </div>
              <span className="text-lg text-stone">&ndash;</span>
              <div className="text-center">
                <TeamName name={formatTeamName(awayTeamName)} />
                <p className="mt-1 text-3xl font-display">{g1a}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white/70 p-4">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-stone">
              Game 2
            </p>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <TeamName name={formatTeamName(homeTeamName)} />
                <p className="mt-1 text-3xl font-display">{g2h}</p>
              </div>
              <span className="text-lg text-stone">&ndash;</span>
              <div className="text-center">
                <TeamName name={formatTeamName(awayTeamName)} />
                <p className="mt-1 text-3xl font-display">{g2a}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-moss/10 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone">
              Match points
            </p>
            <p className="mt-1 text-2xl font-display">
              {live.homePts} &ndash; {live.awayPts}
            </p>
          </div>

          {notes ? (
            <div className="rounded-xl bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone">Notes</p>
              <p className="mt-1 text-sm">{notes}</p>
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-xl bg-moss px-6 py-4 text-lg font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit scores"}
          </button>
          <button
            onClick={() => setStep("entry")}
            className="rounded-xl bg-white/80 px-6 py-3 font-semibold text-ink"
          >
            Go back & edit
          </button>
        </div>
      </main>
    );
  }

  // ── Score entry screen ──
  return (
    <main className="card p-6">
      <h2 className="section-title text-center">Enter scores</h2>
      <div className="mt-2 flex items-center justify-center gap-3 text-sm">
        <TeamName name={formatTeamName(homeTeamName)} />
        <span className="text-stone">vs.</span>
        <TeamName name={formatTeamName(awayTeamName)} />
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {/* Game 1 */}
      <div className="mt-6 rounded-xl bg-white/70 p-5">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wide text-stone">
          Game 1
        </p>
        <div className="flex items-start justify-center gap-8">
          <ScoreStepper
            value={g1h}
            onChange={setG1h}
            label={homeTeamName.length > 10 ? homeTeamName.slice(0, 10) + "..." : homeTeamName}
          />
          <ScoreStepper
            value={g1a}
            onChange={setG1a}
            label={awayTeamName.length > 10 ? awayTeamName.slice(0, 10) + "..." : awayTeamName}
          />
        </div>
      </div>

      {/* Game 2 */}
      <div className="mt-4 rounded-xl bg-white/70 p-5">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wide text-stone">
          Game 2
        </p>
        <div className="flex items-start justify-center gap-8">
          <ScoreStepper
            value={g2h}
            onChange={setG2h}
            label={homeTeamName.length > 10 ? homeTeamName.slice(0, 10) + "..." : homeTeamName}
          />
          <ScoreStepper
            value={g2a}
            onChange={setG2a}
            label={awayTeamName.length > 10 ? awayTeamName.slice(0, 10) + "..." : awayTeamName}
          />
        </div>
      </div>

      {/* Live match points preview */}
      <div className="mt-4 rounded-xl bg-moss/10 p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone">
          Match points preview
        </p>
        <p className="mt-1 text-2xl font-display">
          {live.homePts} &ndash; {live.awayPts}
        </p>
        <p className="mt-1 text-xs text-stone">
          Total: {live.homeTotal} &ndash; {live.awayTotal}
        </p>
      </div>

      {/* Notes */}
      <div className="mt-4">
        <label className="grid gap-2 text-sm font-semibold">
          Notes (optional)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything worth noting..."
            className="min-h-[80px] rounded-xl border border-white/60 bg-white/70 px-4 py-3 text-base"
          />
        </label>
      </div>

      {/* Continue button */}
      <button
        onClick={() => {
          if (g1h === 0 && g1a === 0 && g2h === 0 && g2a === 0) {
            setError("Enter at least one score before continuing.");
            return;
          }
          setError(null);
          setStep("confirm");
        }}
        className="mt-6 w-full rounded-xl bg-moss px-6 py-4 text-lg font-semibold text-white transition-all active:scale-[0.98]"
      >
        Review & submit
      </button>
    </main>
  );
}
