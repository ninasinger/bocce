import { formatTeamName } from "@/lib/display";
import { getTeamStyle } from "@/lib/teamStyle";

export function TeamName({
  name,
  compact = false
}: {
  name: string;
  compact?: boolean;
}) {
  const formatted = formatTeamName(name);
  const style = getTeamStyle(formatted);

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${style.color}`}
        aria-hidden="true"
      >
        {style.initials}
      </span>
      {compact ? null : <span>{formatted}</span>}
    </span>
  );
}
