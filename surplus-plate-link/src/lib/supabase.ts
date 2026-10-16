import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./supabase-config";

let client: SupabaseClient | null = null;

/** Browser-only. Lazily initialises the Supabase client once. */
export function getSupabase(): SupabaseClient {
  if (!client) {
    const cfg = getSupabaseConfig();
    if (!cfg.url || !cfg.publishableKey) throw new Error("Supabase URL or publishable key is missing");
    client = createClient(cfg.url, cfg.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // The Capacitor app uses hash routing, so email-link auto detection is handled by the browser.
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

export function isSupabaseConfigured(): boolean {
  const cfg = getSupabaseConfig();
  return Boolean(cfg.url && cfg.publishableKey);
}
