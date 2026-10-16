import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "firebase/auth";
import type { Profile } from "./types";
import { getFirebase } from "./firebase";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

const Ctx = createContext<AuthState>({ user: null, profile: null, loading: true, error: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, profile: null, loading: true, error: null });

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
                try { localStorage.setItem("annsetu_profile_" + user.uid, JSON.stringify(p)); } catch {}
                setState({ user, profile: p, loading: false, error: null });
              } else {
                let saved: Profile | null = null;
                try {
                  const raw = localStorage.getItem("annsetu_profile_" + user.uid);
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
                import("firebase/firestore").then(({ setDoc }) => {
                  setDoc(doc(db, "users", user.uid), fallback, { merge: true }).catch(() => {});
                });
              }
            },
            () => {
              // On error (e.g. firestore permissions), load cached or fallback profile
              let saved: Profile | null = null;
              try {
                const raw = localStorage.getItem("annsetu_profile_" + user.uid);
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

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
