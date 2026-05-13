import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

function uncachedFetch(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, { ...init, cache: "no-store" });
}

export function getServiceClient() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error("Missing Supabase service role env vars");
  }
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    global: { fetch: uncachedFetch },
    auth: { persistSession: false }
  });
}

export function getAnonClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error("Missing Supabase anon env vars");
  }
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: { fetch: uncachedFetch },
    auth: { persistSession: false }
  });
}
