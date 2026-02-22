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
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${style.color}`}
        aria-hidden="true"
      >
        {style.initials}
      </span>
      {compact ? null : <span>{formatted}</span>}
    </span>
  );
}
