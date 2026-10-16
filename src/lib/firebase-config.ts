import { createServerFn } from "@tanstack/react-start";

// Firebase web config values are public identifiers; they are stored as project
// secrets, so the server hands them to the browser at startup.
export const getFirebaseConfig = createServerFn({ method: "GET" }).handler(async () => {
  return {
    apiKey: (process.env.GOOGLE_API_KEY ?? "").trim(),
    measurementId: (process.env["GOOGLE_ANALYTICS_MEASUREMENT_ID"] ?? "").trim(),
  };
});
