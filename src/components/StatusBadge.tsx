const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  scheduled: { label: "Scheduled", classes: "bg-sky-100 text-sky-800" },
  awaiting_submission: { label: "Awaiting Scores", classes: "bg-amber-100 text-amber-800" },
  pending_verification: { label: "Pending Other Score", classes: "bg-yellow-100 text-yellow-800" },
  verified: { label: "Approved", classes: "bg-emerald-100 text-emerald-800" },
  disputed: { label: "Disputed", classes: "bg-red-100 text-red-800" },
  corrected: { label: "Corrected", classes: "bg-violet-100 text-violet-800" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || {
    label: status.replace(/_/g, " "),
    classes: "bg-stone/15 text-ink",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
