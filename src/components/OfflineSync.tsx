"use client";

import { useEffect } from "react";
import { clearQueuedSubmissions, getQueuedSubmissions } from "@/lib/offlineQueue";

export function OfflineSync() {
  useEffect(() => {
    async function sync() {
      const queued = getQueuedSubmissions();
      if (queued.length === 0) return;

      for (const item of queued) {
        const res = await fetch(`/api/matches/${item.matchId}/submissions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item.payload)
        });
        if (!res.ok) return;
      }
      clearQueuedSubmissions();
    }

    function handleOnline() {
      sync();
    }

    window.addEventListener("online", handleOnline);
    if (navigator.onLine) {
      sync();
    }

    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return null;
}
