"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchJson } from "@/lib/clientFetch";
import { pickSeasonId } from "@/lib/seasonSelection";

export type Season = { id: string; name: string; year: number };

const STORAGE_KEY = "bocce:selected-season";

function readSeasonParam() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("season");
}

function writeSeasonParam(seasonId: string) {
  const params = new URLSearchParams(window.location.search);
  params.set("season", seasonId);
  const url = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
  window.history.replaceState(null, "", url);
}

function readRememberedSeason() {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function rememberSeason(seasonId: string) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, seasonId);
  } catch {
    // Private browsing can block storage; the URL param still carries the choice.
  }
}

// The league shown on Schedule and Standings: the ?season= param, else the
// choice made earlier in this browser session, else the newest season.
export function useSelectedSeason() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonId, setSeasonId] = useState("");
  const [seasonsError, setSeasonsError] = useState("");

  useEffect(() => {
    async function loadSeasons() {
      try {
        const { data } = await fetchJson<{ seasons?: Season[] }>("/api/seasons");
        const list: Season[] = data.seasons || [];
        const picked = pickSeasonId(
          list.map((season) => season.id),
          readSeasonParam(),
          readRememberedSeason()
        );
        setSeasons(list);
        setSeasonId(picked);
        if (picked) rememberSeason(picked);
      } catch {
        setSeasonsError("Could not load seasons");
      }
    }

    loadSeasons();
  }, []);

  const selectSeason = useCallback((nextSeasonId: string) => {
    setSeasonId(nextSeasonId);
    writeSeasonParam(nextSeasonId);
    rememberSeason(nextSeasonId);
  }, []);

  return { seasons, seasonId, selectSeason, seasonsError };
}
