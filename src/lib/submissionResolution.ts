import { computeOutcome, type ComputedOutcome, type MatchScore, scoresMatch } from "./scoring";

export type SubmissionResolution =
  | { status: "pending_verification" }
  | { status: "disputed" }
  | { status: "verified"; outcome: ComputedOutcome };

export function resolveSubmissionStatus(submissions: MatchScore[]): SubmissionResolution {
  if (submissions.length < 2) {
    return { status: "pending_verification" };
  }

  const [first, second] = submissions;
  if (!scoresMatch(first, second)) {
    return { status: "disputed" };
  }

  return {
    status: "verified",
    outcome: computeOutcome(first)
  };
}
