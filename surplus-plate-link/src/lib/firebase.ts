import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFirebaseConfig } from "./firebase-config";

type Services = { app: FirebaseApp; auth: Auth; db: Firestore };
let promise: Promise<Services> | null = null;

/** Browser-only. Lazily initialises Firebase once. */
export function getFirebase(): Promise<Services> {
  if (!promise) {
    promise = (async () => {
      const cfg = await getFirebaseConfig();
      if (!cfg.apiKey) throw new Error("Firebase API key is missing");
      const app =
        getApps()[0] ??
        initializeApp({
          apiKey: cfg.apiKey,
          authDomain: "food-app-f3778.firebaseapp.com",
          projectId: "food-app-f3778",
          storageBucket: "food-app-f3778.firebasestorage.app",
          messagingSenderId: "587598535959",
          appId: "1:587598535959:web:52a6d560705cdd71a26b52",
          ...(cfg.measurementId ? { measurementId: cfg.measurementId } : {}),
        });
      if (cfg.measurementId) {
        import("firebase/analytics")
          .then(async (m) => ((await m.isSupported()) ? m.getAnalytics(app) : null))
          .catch(() => null);
      }
      return { app, auth: getAuth(app), db: getFirestore(app) };
    })();
    promise.catch(() => (promise = null));
  }
  return promise;
}
