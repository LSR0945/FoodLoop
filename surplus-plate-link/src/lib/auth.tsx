import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Profile, Role } from "./types";
import { getSupabase } from "./supabase";
import { getLocalSession, localSessionToAuthUser, signOutAuth, toAuthUser, type AuthUser } from "./supabase-auth";

interface InternalAuthState {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export interface AuthState extends InternalAuthState {
  signOut: () => Promise<void>;
}

export async function signOutUser(): Promise<void> {
  try {
    await signOutAuth();
  } catch (err) {
    console.warn("Supabase signOut failed:", err);
  }
  try {
    if (typeof window !== "undefined") {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("foodloop_") || key.startsWith("annsetu_")) {
          // Keep listings so demo data stays available
          if (!key.includes("listings")) {
            localStorage.removeItem(key);
          }
        }
      });
      window.dispatchEvent(new CustomEvent("foodloop_profile_updated", { detail: null }));
    }
  } catch {}
}

const Ctx = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
  error: null,
  signOut: signOutUser,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InternalAuthState>({ user: null, profile: null, loading: true, error: null });

  // Listen for local profile updates (role switch, name, photo changes)
  useEffect(() => {
    const onProfileUpdated = (e: any) => {
      if (e.detail) {
        // Only update profile when a user is actually signed in.
        setState((s) =>
          s.user
            ? { ...s, profile: s.profile ? { ...s.profile, ...e.detail } : (e.detail as Profile) }
            : s,
        );
      }
    };
    window.addEventListener("foodloop_profile_updated", onProfileUpdated);
    window.addEventListener("annsetu_profile_updated", onProfileUpdated);
    return () => {
      window.removeEventListener("foodloop_profile_updated", onProfileUpdated);
      window.removeEventListener("annsetu_profile_updated", onProfileUpdated);
    };
  }, []);

  useEffect(() => {
    let unsubAuth = () => {};
    let channel: ReturnType<ReturnType<typeof getSupabase>["channel"]> | null = null;

    const inferRole = (uid: string): Role => {
      try {
        if (localStorage.getItem("foodloop_donor_" + uid)) return "donor";
        if (localStorage.getItem("foodloop_recipient_" + uid)) return "recipient";
        if (localStorage.getItem("foodloop_volunteer_" + uid)) return "volunteer";
        const cached = readCached(uid);
        if (cached?.role) return cached.role;
      } catch {}
      return "donor";
    };

    const fallbackProfile = (user: AuthUser, saved?: Profile | null): Profile =>
      saved ?? {
        uid: user.uid,
        name: user.displayName || user.email?.split("@")[0] || "User",
        email: user.email || "",
        role: inferRole(user.uid),
        createdAt: Date.now(),
      } as Profile;

    const readCached = (uid: string): Profile | null => {
      try {
        const raw = localStorage.getItem("foodloop_profile_" + uid) || localStorage.getItem("annsetu_profile_" + uid);
        return raw ? (JSON.parse(raw) as Profile) : null;
      } catch {
        return null;
      }
    };

    const cacheProfile = (p: Profile) => {
      try {
        localStorage.setItem("foodloop_profile_" + p.uid, JSON.stringify(p));
        localStorage.setItem("annsetu_profile_" + p.uid, JSON.stringify(p));
      } catch {}
    };

    const applyProfile = async (user: AuthUser) => {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase.from("profiles").select("*").eq("uid", user.uid).maybeSingle();
        if (error) throw error;

        if (data) {
          const p = data as unknown as Profile;
          cacheProfile(p);
          setState({ user, profile: p, loading: false, error: null });
        } else {
          const saved = readCached(user.uid);
          const fallback = fallbackProfile(user, saved);
          setState({ user, profile: fallback, loading: false, error: null });
          supabase
            .from("profiles")
            .upsert(fallback, { onConflict: "uid" })
            .then(() => {}, () => {});
        }

        // Live profile updates (role change, verification, name edits)
        if (channel) {
          supabase.removeChannel(channel);
          channel = null;
        }
        channel = supabase
          .channel("profile:" + user.uid)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "profiles", filter: `uid=eq.${user.uid}` },
            (payload: any) => {
              const row = payload.new as Profile | undefined;
              if (row) {
                cacheProfile(row);
                setState((s) => ({ ...s, user, profile: { ...(s.profile || row), ...row }, loading: false, error: null }));
              }
            },
          )
          .subscribe();
      } catch {
        // On error (e.g. permissions or offline), load cached or fallback profile
        const fallback = fallbackProfile(user, readCached(user.uid));
        setState({ user, profile: fallback, loading: false, error: null });
      }
    };

    (async () => {
      try {
        const supabase = getSupabase();
        const { data } = await supabase.auth.getSession();
        let initial = toAuthUser(data.session?.user);

        // Supabase may have no live session (e.g. email confirmation pending).
        // Fall back to a locally registered session so signup/login still work.
        if (!initial) {
          const local = getLocalSession();
          if (local) initial = localSessionToAuthUser(local);
        }

        if (initial) {
          setState((s) => ({ ...s, user: initial, loading: true }));
          await applyProfile(initial);
        } else {
          setState({ user: null, profile: null, loading: false, error: null });
        }

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
          const user = toAuthUser(session?.user);
          if (!user) {
            if (channel) {
              supabase.removeChannel(channel);
              channel = null;
            }
            setState({ user: null, profile: null, loading: false, error: null });
            return;
          }
          setState((s) => ({ ...s, user, loading: true }));
          applyProfile(user);
        });
        unsubAuth = () => listener.subscription.unsubscribe();
      } catch (e) {
        setState((s) => ({ ...s, loading: false, error: (e as Error).message }));
      }
    })();

    return () => {
      unsubAuth();
      try {
        if (channel) getSupabase().removeChannel(channel);
      } catch {}
    };
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    setState({ user: null, profile: null, loading: false, error: null });
  };

  return <Ctx.Provider value={{ ...state, signOut: handleSignOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
