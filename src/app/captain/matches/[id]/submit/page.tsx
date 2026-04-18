"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { queueSubmission } from "@/lib/offlineQueue";
import { TeamName } from "@/components/TeamName";
import { StatusBadge } from "@/components/StatusBadge";
import { errorMessageFromData, fetchJson } from "@/lib/clientFetch";
import { formatMatchTeamName, type TeamRef } from "@/lib/matchFormat";

type MatchResponse = {
  id: string;
  status: string;
  home_team: TeamRef;
  away_team: TeamRef;
};

function shortName(name: string) {
  if (name.length <= 8) return name;
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return initials.length >= 2 ? initials : name.slice(0, 8);
}

type Step = "loading" | "already_submitted" | "entry" | "confirm" | "success";
type SubmitResult = "pending_verification" | "verified" | "disputed" | "queued";

function ScoreInput({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <label className="grid justify-items-center gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-stone">
        {label}
      </span>
      <input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(event) => {
          const raw = event.target.value.replace(/\D/g, "");
          if (raw === "") {
            onChange(0);
            return;
          }
          const next = Number(raw);
          onChange(Number.isFinite(next) ? Math.max(0, Math.floor(next)) : 0);
        }}
        className="w-24 rounded-xl border border-white/70 bg-white px-2 py-2 text-center text-3xl font-display tabular-nums sm:w-28 sm:text-4xl"
        aria-label={`${label} score`}
      />
    </label>
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

function ScoreRecap({
  g1h, g1a, g2h, g2a,
  homeLabel, awayLabel,
}: {
  g1h: number; g1a: number; g2h: number; g2a: number;
  homeLabel: string; awayLabel: string;
}) {
  const live = computeLivePoints({ g1h, g1a, g2h, g2a });
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-white/70 p-3">
        <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wide text-stone">
          Game 1
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="text-xs font-semibold text-stone">{homeLabel}</p>
            <p className="text-3xl font-display">{g1h}</p>
          </div>
          <span className="text-lg text-stone">&ndash;</span>
          <div className="text-center">
            <p className="text-xs font-semibold text-stone">{awayLabel}</p>
            <p className="text-3xl font-display">{g1a}</p>
          </div>
        </div>
      </div>
      <div className="rounded-xl bg-white/70 p-3">
        <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wide text-stone">
          Game 2
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="text-xs font-semibold text-stone">{homeLabel}</p>
            <p className="text-3xl font-display">{g2h}</p>
          </div>
          <span className="text-lg text-stone">&ndash;</span>
          <div className="text-center">
            <p className="text-xs font-semibold text-stone">{awayLabel}</p>
            <p className="text-3xl font-display">{g2a}</p>
          </div>
        </div>
      </div>
      <div className="rounded-xl bg-moss/10 p-3 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-stone">
          Match points
        </p>
        <p className="mt-1 text-xl font-display">
          {live.homePts} &ndash; {live.awayPts}
        </p>
      </div>
    </div>
  );
}

export default function SubmitScorePage() {
  const params = useParams();
  const matchId = String(params.id);
  const [step, setStep] = useState<Step>("loading");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [homeTeamName, setHomeTeamName] = useState("Home");
  const [awayTeamName, setAwayTeamName] = useState("Away");
  const [matchStatus, setMatchStatus] = useState("");

  const [g1h, setG1h] = useState(0);
  const [g1a, setG1a] = useState(0);
  const [g2h, setG2h] = useState(0);
  const [g2a, setG2a] = useState(0);
  const [notes, setNotes] = useState("");

  // Previously submitted scores (if any)
  const [existingScores, setExistingScores] = useState<{
    g1h: number; g1a: number; g2h: number; g2a: number;
  } | null>(null);

  useEffect(() => {
    async function loadMatch() {
      try {
        const [matchResult, statusResult] = await Promise.all([
          fetchJson<{ match?: MatchResponse; error?: string }>(`/api/matches/${matchId}`),
          fetchJson<{
            submitted?: boolean;
            submission?: {
              game1_home_score: number;
              game1_away_score: number;
              game2_home_score: number;
              game2_away_score: number;
            };
          }>(`/api/matches/${matchId}/submission-status`)
        ]);
        if (!matchResult.response.ok) {
          setError(errorMessageFromData(matchResult.data, "Could not load match details"));
          setStep("entry");
          return;
        }
        const match = matchResult.data.match as MatchResponse;
        setHomeTeamName(formatMatchTeamName(match.home_team, "Team"));
        setAwayTeamName(formatMatchTeamName(match.away_team, "Team"));
        setMatchStatus(match.status || "");

        // Check if already submitted
        if (statusResult.response.ok && statusResult.data.submitted && statusResult.data.submission) {
          const s = statusResult.data.submission;
          setExistingScores({
            g1h: s.game1_home_score,
            g1a: s.game1_away_score,
            g2h: s.game2_home_score,
            g2a: s.game2_away_score,
          });
          setStep("already_submitted");
          return;
        }

        setStep("entry");
      } catch {
        setError("Could not load match details");
        setStep("entry");
      }
    }

    loadMatch();
  }, [matchId]);

  const live = useMemo(
    () => computeLivePoints({ g1h, g1a, g2h, g2a }),
    [g1h, g1a, g2h, g2a]
  );

  const homeShort = shortName(homeTeamName);
  const awayShort = shortName(awayTeamName);
  const homeFmt = formatMatchTeamName({ name: homeTeamName }, "Team");
  const awayFmt = formatMatchTeamName({ name: awayTeamName }, "Team");

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
      const { response, data } = await fetchJson<{ error?: string; status?: SubmitResult }>(
        `/api/matches/${matchId}/submissions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        setError(errorMessageFromData(data, "Submission failed"));
        setStep("entry");
        setSubmitting(false);
        return;
      }

      setResult((data.status || "pending_verification") as SubmitResult);
      setStep("success");
    } catch {
      queueSubmission({
        matchId,
        payload,
        createdAt: new Date().toISOString(),
      });
      setResult("queued");
      setStep("success");
    }
    setSubmitting(false);
  }

  // ── Loading ──
  if (step === "loading") {
    return (
      <main className="card p-4 text-center">
        <div className="animate-pulse py-12">
          <div className="mx-auto h-6 w-32 rounded-lg bg-stone/15" />
          <div className="mx-auto mt-3 h-4 w-48 rounded-lg bg-stone/10" />
        </div>
      </main>
    );
  }

  // ── Already submitted ──
  if (step === "already_submitted" && existingScores) {
    return (
      <main className="card p-4 text-center">
        <div className="mx-auto my-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-emerald-600">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="section-title">Already submitted</h2>
        <p className="mt-1 text-sm text-stone">
          Your scores for this match have been recorded.
        </p>
        <div className="mt-1">
          <StatusBadge status={matchStatus} />
        </div>

        <div className="mt-4">
          <ScoreRecap
            g1h={existingScores.g1h} g1a={existingScores.g1a}
            g2h={existingScores.g2h} g2a={existingScores.g2a}
            homeLabel={homeShort} awayLabel={awayShort}
          />
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <a href="/captain/matches" className="tap-btn rounded-xl bg-moss px-5 py-3 text-center font-semibold text-white">
            Back to my matches
          </a>
        </div>
      </main>
    );
  }

  // ── Success screen ──
  if (step === "success") {
    const resultMessages: Record<string, { title: string; desc: string; color: string }> = {
      verified: {
        title: "Match verified!",
        desc: "Both teams submitted matching scores. The match is now official.",
        color: "bg-emerald-100 text-emerald-600",
      },
      pending_verification: {
        title: "Scores submitted!",
        desc: "Waiting for the other team to submit their scores. If both match, the result is auto-verified.",
        color: "bg-amber-100 text-amber-600",
      },
      disputed: {
        title: "Scores submitted",
        desc: "The other team submitted different scores. The commissioner will review and decide the official result.",
        color: "bg-red-100 text-red-600",
      },
      queued: {
        title: "Saved offline",
        desc: "You appear to be offline. Your scores are saved and will be submitted automatically when you reconnect.",
        color: "bg-sky-100 text-sky-600",
      },
    };

    const msg = resultMessages[result || "pending_verification"];

    return (
      <main className="card p-4 text-center">
        <div className={`success-pop mx-auto my-5 flex h-16 w-16 items-center justify-center rounded-full ${msg.color}`}>
          {result === "verified" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : result === "disputed" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          )}
        </div>
        <h2 className="section-title">{msg.title}</h2>
        <p className="mt-2 text-sm text-stone">{msg.desc}</p>

        {/* Show submitted scores */}
        <div className="mt-4">
          <ScoreRecap
            g1h={g1h} g1a={g1a} g2h={g2h} g2a={g2a}
            homeLabel={homeShort} awayLabel={awayShort}
          />
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <a href="/captain/matches" className="tap-btn rounded-xl bg-moss px-5 py-3 text-center font-semibold text-white">
            Back to my matches
          </a>
          <a href="/" className="tap-btn rounded-xl bg-white/80 px-5 py-3 text-center font-semibold text-ink">
            Go home
          </a>
        </div>
      </main>
    );
  }

  // ── Confirmation screen ──
  if (step === "confirm") {
    return (
      <main className="card p-4">
        <h2 className="section-title text-center">Confirm scores</h2>
        <p className="mt-1 text-center text-sm text-stone">
          Double-check before submitting.
        </p>

        <div className="mt-3 flex items-center justify-center gap-2 text-sm">
          <TeamName name={homeFmt} />
          <span className="text-stone">vs</span>
          <TeamName name={awayFmt} />
        </div>

        <div className="mt-4">
          <ScoreRecap
            g1h={g1h} g1a={g1a} g2h={g2h} g2a={g2a}
            homeLabel={homeShort} awayLabel={awayShort}
          />
        </div>

        {notes ? (
          <div className="mt-3 rounded-xl bg-white/70 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-stone">Notes</p>
            <p className="mt-1 text-sm">{notes}</p>
          </div>
        ) : null}

        {error ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        <div className="mt-4 flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="tap-btn rounded-xl bg-moss px-5 py-3.5 text-base font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit scores"}
          </button>
          <button
            onClick={() => setStep("entry")}
            className="tap-btn rounded-xl bg-white/80 px-5 py-3 font-semibold text-ink"
          >
            Go back & edit
          </button>
        </div>
      </main>
    );
  }

  // ── Score entry screen ──
  return (
    <main className="card p-4">
      <h2 className="section-title text-center">Enter scores</h2>
      <div className="mt-1 flex items-center justify-center gap-2 text-sm">
        <TeamName name={homeFmt} />
        <span className="text-stone">vs</span>
        <TeamName name={awayFmt} />
      </div>

      {/* How it works hint */}
      <div className="mt-3 rounded-xl bg-sky-50 p-2.5 text-center text-xs text-sky-800">
        Both teams submit scores separately. If they match, the result is verified automatically.
      </div>

      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {/* Game 1 */}
      <div className="mt-4 rounded-xl bg-white/70 p-3">
        <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-wide text-stone">
          Game 1
        </p>
        <div className="grid grid-cols-2 gap-4">
          <ScoreInput value={g1h} onChange={setG1h} label={homeShort} />
          <ScoreInput value={g1a} onChange={setG1a} label={awayShort} />
        </div>
      </div>

      {/* Game 2 */}
      <div className="mt-3 rounded-xl bg-white/70 p-3">
        <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-wide text-stone">
          Game 2
        </p>
        <div className="grid grid-cols-2 gap-4">
          <ScoreInput value={g2h} onChange={setG2h} label={homeShort} />
          <ScoreInput value={g2a} onChange={setG2a} label={awayShort} />
        </div>
      </div>

      {/* Live match points preview */}
      <div className="mt-3 rounded-xl bg-moss/10 p-3 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-stone">
          Match points
        </p>
        <p className="mt-1 text-xl font-display">
          {live.homePts} &ndash; {live.awayPts}
        </p>
        <p className="text-xs text-stone">
          Total: {live.homeTotal} &ndash; {live.awayTotal}
        </p>
      </div>

      {/* Notes */}
      <div className="mt-3">
        <label className="grid gap-1.5 text-sm font-semibold">
          Notes (optional)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything worth noting..."
            rows={2}
            className="rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-base"
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
        className="tap-btn mt-4 w-full rounded-xl bg-moss px-5 py-3.5 text-base font-semibold text-white"
      >
        Review & submit
      </button>
    </main>
  );
}
