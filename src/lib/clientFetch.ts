type UnknownObject = Record<string, unknown>;

export function parseJsonSafely<T extends UnknownObject = UnknownObject>(text: string): T {
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

export async function fetchJson<T extends UnknownObject = UnknownObject>(
  input: RequestInfo | URL,
  init?: RequestInit
) {
  const response = await fetch(input, init);
  const text = await response.text();
  const data = parseJsonSafely<T>(text);
  return { response, data };
}

export function errorMessageFromData(data: UnknownObject, fallback: string) {
  const value = data.error;
  return typeof value === "string" && value ? value : fallback;
}
