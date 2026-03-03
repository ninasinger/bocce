"use client";

import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/clientFetch";

type SessionResponse = {
  authenticated?: boolean;
  session?: {
    role?: "captain" | "commissioner";
  };
};

export function SessionIndicator() {
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

        setLabel("Signed in: Team Captain");
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
  }, []);

  const className =
    variant === "commissioner"
      ? "bg-moss/90 text-white"
      : variant === "captain"
        ? "bg-sky-100 text-sky-800"
        : "bg-white/80 text-stone";

  return <p className={`badge ${className}`}>{label}</p>;
}
