import Link from "next/link";
import { notFound } from "next/navigation";
import { TeamName } from "@/components/TeamName";
import { getServiceClient } from "@/lib/supabaseServer";
import { formatTeamName } from "@/lib/display";
import { normalizeRosterMembers } from "@/lib/teamRosters";

export const dynamic = "force-dynamic";

type TeamRecord = {
  id: string;
  name: string;
  captain_name: string | null;
  members: unknown;
  season: { name: string } | { name: string }[] | null;
};

function seasonName(season: TeamRecord["season"]) {
  if (!season) return "2026 Roster";
  if (Array.isArray(season)) return season[0]?.name || "2026 Roster";
  return season.name || "2026 Roster";
}

export default async function TeamRosterPage({ params }: { params: { id: string } }) {
  const client = getServiceClient();
  const { data: team, error } = await client
    .from("teams")
    .select("id, name, captain_name, members, season:seasons(name)")
    .eq("id", params.id)
    .maybeSingle<TeamRecord>();

  if (error || !team) notFound();

  const displayName = formatTeamName(team.name);
  const members = normalizeRosterMembers(team.members, displayName);

  return (
    <main className="space-y-4">
      <Link href="/schedule" className="tap inline-flex text-sm font-semibold text-moss">
        Back to schedule
      </Link>
      <section className="card p-4 md:p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-stone">
          {seasonName(team.season)}
        </p>
        <h2 className="section-title mt-2">
          <TeamName name={displayName} />
        </h2>
        {team.captain_name ? (
          <p className="mt-2 text-sm text-stone">Captain: {team.captain_name}</p>
        ) : null}
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {members.map((member) => (
            <div key={member} className="rounded-xl bg-white/70 px-4 py-3 font-semibold text-ink">
              {member}
            </div>
          ))}
          {members.length === 0 ? (
            <p className="rounded-xl bg-white/70 px-4 py-3 text-sm text-stone">
              No roster has been added for this team yet.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
