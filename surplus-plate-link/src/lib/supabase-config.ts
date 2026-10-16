// Supabase project identifiers are public client values (safe to ship in the app).
// They can be overridden at build time with VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY.
const DEFAULT_URL = "https://hzxwfocxwgtnodhngyth.supabase.co";
const DEFAULT_PUBLISHABLE_KEY = "sb_publishable_crHagn9D9N9pvRywBVkvRw_a6Tva8Ec";

function env(key: string): string | undefined {
  try {
    const meta = import.meta as unknown as { env?: Record<string, string | undefined> };
    return meta.env?.[key];
  } catch {
    return undefined;
  }
}

export function getSupabaseConfig() {
  return {
    url: env("VITE_SUPABASE_URL") || DEFAULT_URL,
    publishableKey: env("VITE_SUPABASE_PUBLISHABLE_KEY") || DEFAULT_PUBLISHABLE_KEY,
  };
}
