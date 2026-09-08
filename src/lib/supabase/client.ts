import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null | undefined;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Safe for render — returns null instead of throwing when env vars are missing. */
export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;

  if (browserClient !== undefined) {
    return browserClient;
  }

  try {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  } catch {
    browserClient = null;
  }

  return browserClient;
}

/** Use when Supabase must exist (e.g. after isSupabaseConfigured() check). */
export function requireClient(): SupabaseClient {
  const client = createClient();
  if (!client) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return client;
}
