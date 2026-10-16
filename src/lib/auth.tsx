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
            (snap) =>
              setState({
                user,
                profile: snap.exists() ? (snap.data() as Profile) : null,
                loading: false,
                error: null,
              }),
            (e) => setState({ user, profile: null, loading: false, error: e.message }),
          );
        });
      } catch (e) {
        setState({ user: null, profile: null, loading: false, error: (e as Error).message });
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
