export type QueuedSubmission = {
  matchId: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

const STORAGE_KEY = "bocce-submissions";

export function queueSubmission(item: QueuedSubmission) {
  const existing = getQueuedSubmissions();
  existing.push(item);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getQueuedSubmissions(): QueuedSubmission[] {
  if (typeof localStorage === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function clearQueuedSubmissions() {
  localStorage.removeItem(STORAGE_KEY);
}
