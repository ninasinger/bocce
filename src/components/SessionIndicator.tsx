"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { fetchJson } from "@/lib/clientFetch";
import { formatTeamName } from "@/lib/display";

type SessionResponse = {
  authenticated?: boolean;
  session?: {
    role?: "captain" | "commissioner";
    teamId?: string;
    seasonId?: string;
  };
};

type TeamsResponse = {
  teams?: { id: string; name: string }[];
};

export function SessionIndicator() {
  const pathname = usePathname();
  const [label, setLabel] = useState("Checking sign-in...");
  const [variant, setVariant] = useState<"neutral" | "captain" | "commissioner">("neutral");

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const { response, data } = await fetchJson<SessionResponse>("/api/auth/session");
        if (!active) return;
        if (!response.ok || !data.authenticated || !data.session?.role) {
          setLabel("Not signed in");
          setVariant("neutral");
          return;
        }

        if (data.session.role === "commissioner") {
          setLabel("Signed in: Commissioner");
          setVariant("commissioner");
          return;
        }

        if (!pathname.startsWith("/captain")) {
          setLabel("Not signed in");
          setVariant("neutral");
          return;
        }

        const { teamId, seasonId } = data.session;
        if (teamId && seasonId) {
          const teamResult = await fetchJson<TeamsResponse>(`/api/seasons/${seasonId}/teams`);
          if (active && teamResult.response.ok) {
            const team = (teamResult.data.teams || []).find((entry) => entry.id === teamId);
            if (team) {
              setLabel(`Team Captain: ${formatTeamName(team.name)}`);
              setVariant("captain");
              return;
            }
          }
        }

        setLabel("Team Captain");
        setVariant("captain");
      } catch {
        if (!active) return;
        setLabel("Not signed in");
        setVariant("neutral");
      }
    }

    loadSession();
    return () => {
      active = false;
    };
  }, [pathname]);

  const className =
    variant === "commissioner"
      ? "bg-moss/90 text-white"
      : variant === "captain"
        ? "bg-sky-100 text-sky-800"
        : "bg-white/80 text-stone";

  return <p className={`badge ${className}`}>{label}</p>;
}
