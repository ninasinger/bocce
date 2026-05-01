"use client";

import { useEffect } from "react";
import { getQueuedSubmissions, type QueuedSubmission } from "@/lib/offlineQueue";

const STORAGE_KEY = "bocce-submissions";

export function OfflineSync() {
  useEffect(() => {
    async function sync() {
      const queued = getQueuedSubmissions();
      if (queued.length === 0) return;

      const remaining: QueuedSubmission[] = [];
      for (const item of queued) {
        try {
          const res = await fetch(`/api/matches/${item.matchId}/submissions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.payload)
          });
          // 2xx = success, 4xx = client error (bad data or duplicate) — don't retry forever.
          // 5xx or network = transient; keep in queue.
          if (!res.ok && res.status >= 500) {
            remaining.push(item);
          }
        } catch {
          remaining.push(item);
        }
      }
      if (remaining.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
      }
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
