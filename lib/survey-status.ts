import type { Survey } from "@/lib/api/surveys.api";

export type SubmissionState = "submitted" | "awaiting";

export function getSubmissionState(s: Pick<Survey, "responsesCount">): SubmissionState {
  return (s.responsesCount ?? 0) > 0 ? "submitted" : "awaiting";
}

export function submissionLabel(s: Pick<Survey, "responsesCount">): string {
  const n = s.responsesCount ?? 0;
  return n > 0 ? `Submitted · ${n}` : "Awaiting response";
}

/** Tailwind classes for the submission status badge. */
export function submissionBadgeClass(s: Pick<Survey, "responsesCount">): string {
  return getSubmissionState(s) === "submitted"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-amber-50 text-amber-700 border-amber-200";
}
