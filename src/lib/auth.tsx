import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "firebase/auth";
import type { Profile, Role } from "./types";
import { getFirebase } from "./firebase";

interface InternalAuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export interface AuthState extends InternalAuthState {
  signOut: () => Promise<void>;
}

export async function signOutUser(): Promise<void> {
  try {
    const { auth } = await getFirebase();
    const { signOut: fbSignOut } = await import("firebase/auth");
    await fbSignOut(auth);
  } catch (err) {
    console.warn("Firebase signOut failed:", err);
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
        setState((s) => ({
          ...s,
          profile: s.profile ? { ...s.profile, ...e.detail } : (e.detail as Profile),
        }));
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
    let unsubProfile = () => {};
    (async () => {
      try {
        const { auth, db } = await getFirebase();
        const { onAuthStateChanged } = await import("firebase/auth");
        const { doc, onSnapshot } = await import("firebase/firestore");
        unsubAuth = onAuthStateChanged(auth, (user) => {
          unsubProfile();
          if (!user) {
            setState({ user: null, profile: null, loading: false, error: null });
            return;
          }
          setState((s) => ({ ...s, user, loading: true }));
          unsubProfile = onSnapshot(
            doc(db, "users", user.uid),
            (snap) => {
              if (snap.exists()) {
                const p = snap.data() as Profile;
                try {
                  localStorage.setItem("foodloop_profile_" + user.uid, JSON.stringify(p));
                  localStorage.setItem("annsetu_profile_" + user.uid, JSON.stringify(p));
                } catch {}
                setState({ user, profile: p, loading: false, error: null });
              } else {
                let saved: Profile | null = null;
                try {
                  const raw =
                    localStorage.getItem("foodloop_profile_" + user.uid) ||
                    localStorage.getItem("annsetu_profile_" + user.uid);
                  if (raw) saved = JSON.parse(raw);
                } catch {}
                const fallback: Profile = saved ?? {
                  uid: user.uid,
                  name: user.displayName || user.email?.split("@")[0] || "User",
                  email: user.email || "",
                  role: ((saved as any)?.role as Role) || "donor",
                  createdAt: Date.now(),
                };
                setState({ user, profile: fallback, loading: false, error: null });
                import("firebase/firestore").then(({ setDoc }) => {
                  setDoc(doc(db, "users", user.uid), fallback, { merge: true }).catch(() => {});
                });
              }
            },
            () => {
              // On error (e.g. firestore permissions), load cached or fallback profile
              let saved: Profile | null = null;
              try {
                const raw =
                  localStorage.getItem("foodloop_profile_" + user.uid) ||
                  localStorage.getItem("annsetu_profile_" + user.uid);
                if (raw) saved = JSON.parse(raw);
              } catch {}
              const fallback: Profile = saved ?? {
                uid: user.uid,
                name: user.displayName || user.email?.split("@")[0] || "Food Donor",
                email: user.email || "",
                role: "donor",
                createdAt: Date.now(),
              };
              setState({ user, profile: fallback, loading: false, error: null });
            },
          );
        });
      } catch (e) {
        setState((s) => ({ ...s, loading: false, error: (e as Error).message }));
      }
    })();
    return () => {
      unsubAuth();
      unsubProfile();
    };
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    setState({ user: null, profile: null, loading: false, error: null });
  };

  return <Ctx.Provider value={{ ...state, signOut: handleSignOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
