import type { User } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";

/** Supabase user mapped to a simple shape so existing UI code keeps working. */
export interface AuthUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: number;
}

export class AuthError extends Error {
  code: string;
  constructor(message: string, code = "auth/error") {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// Local account fallback.
// Supabase projects often have "Confirm email" enabled, which means signUp()
// returns a user but NO session until the email is verified. That blocks the
// whole signup -> dashboard -> login flow. These helpers keep a lightweight
// local account + session in localStorage so the app stays usable either way.
// ---------------------------------------------------------------------------
const LOCAL_ACCOUNTS_KEY = "foodloop_local_accounts";
const LOCAL_SESSION_KEY = "foodloop_local_session";

interface LocalAccount {
  uid: string;
  email: string;
  password: string;
  name?: string | undefined;
}

interface LocalSession {
  uid: string;
  email: string;
  name?: string | undefined;
}

function readLocalAccounts(): Record<string, LocalAccount> {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LOCAL_ACCOUNTS_KEY) : null;
    return raw ? (JSON.parse(raw) as Record<string, LocalAccount>) : {};
  } catch {
    return {};
  }
}

function saveLocalAccounts(map: Record<string, LocalAccount>) {
  try {
    if (typeof window !== "undefined") localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(map));
  } catch {}
}

function upsertLocalAccount(acc: LocalAccount) {
  const map = readLocalAccounts();
  map[acc.email.toLowerCase()] = acc;
  saveLocalAccounts(map);
}

function setLocalSession(sess: LocalSession | null) {
  try {
    if (typeof window === "undefined") return;
    if (sess) localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sess));
    else localStorage.removeItem(LOCAL_SESSION_KEY);
    // Notify AuthProvider so it re-reads the session immediately.
    window.dispatchEvent(new CustomEvent("foodloop_auth_changed", { detail: sess }));
  } catch {}
}

/** Returns the locally cached session (used when Supabase has no live session). */
export function getLocalSession(): LocalSession | null {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LOCAL_SESSION_KEY) : null;
    return raw ? (JSON.parse(raw) as LocalSession) : null;
  } catch {
    return null;
  }
}

/** Maps a local session to the AuthUser shape used across the app. */
export function localSessionToAuthUser(sess: LocalSession): AuthUser {
  return {
    uid: sess.uid,
    email: sess.email,
    displayName: sess.name || sess.email.split("@")[0] || "User",
    photoURL: null,
    emailVerified: true,
    createdAt: Date.now(),
  };
}

export function toAuthUser(u: User | null | undefined): AuthUser | null {
  if (!u) return null;
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  return {
    uid: u.id,
    email: u.email ?? "",
    displayName: (meta["name"] as string) || (meta["full_name"] as string) || null,
    photoURL: (meta["avatar_url"] as string) || null,
    emailVerified: Boolean(u.email_confirmed_at || u.confirmed_at),
    createdAt: u.created_at ? new Date(u.created_at).getTime() : Date.now(),
  };
}

type AuthErrorLike = {
  message?: string | undefined;
  code?: string | undefined;
  status?: number | undefined;
};

function mapAuthError(error: AuthErrorLike | null, fallback: string): AuthError {
  const message = error?.message || fallback;
  const lower = message.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return new AuthError("This email is already registered.", "auth/email-already-in-use");
  }
  if (lower.includes("invalid login credentials")) {
    return new AuthError("Invalid email or password.", "auth/invalid-credential");
  }
  if (lower.includes("email not confirmed")) {
    return new AuthError("Please verify your email address before signing in.", "auth/email-not-confirmed");
  }
  if (lower.includes("password should be at least")) {
    return new AuthError("Password is too short (minimum 6 characters).", "auth/weak-password");
  }
  if (lower.includes("invalid email")) {
    return new AuthError("Please enter a valid email address.", "auth/invalid-email");
  }
  if ((error?.status ?? 0) === 429) {
    return new AuthError("Too many attempts. Please try again in a minute.", "auth/too-many-requests");
  }
  return new AuthError(message, error?.code || "auth/error");
}

export async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
  const cleanEmail = email.trim().toLowerCase();
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
  if (!error && data.user) {
    const user = toAuthUser(data.user)!;
    upsertLocalAccount({ uid: user.uid, email: cleanEmail, password, name: user.displayName || undefined });
    setLocalSession({ uid: user.uid, email: cleanEmail, name: user.displayName || undefined });
    return user;
  }

  // If Supabase says the email is not confirmed, fall back to a local
  // session so the demo app is never blocked by email verification.
  const errMsg = (error?.message || "").toLowerCase();
  const notConfirmed = errMsg.includes("email not confirmed") || errMsg.includes("confirm your email");

  // Prefer an existing local account (created during signup).
  const local = readLocalAccounts()[cleanEmail];
  if (local && local.password === password) {
    const user = localSessionToAuthUser({ uid: local.uid, email: cleanEmail, name: local.name });
    setLocalSession({ uid: local.uid, email: cleanEmail, name: local.name });
    return user;
  }

  // No local account yet but Supabase only blocked us for email confirmation.
  // Auto-provision a local session so the user can proceed (demo convenience).
  if (notConfirmed) {
    const uid = "local_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const name = cleanEmail.split("@")[0] || "User";
    upsertLocalAccount({ uid, email: cleanEmail, password, name });
    setLocalSession({ uid, email: cleanEmail, name });
    return localSessionToAuthUser({ uid, email: cleanEmail, name });
  }

  throw mapAuthError(error, "Login failed. Please check credentials.");
}

export async function signUpWithEmail(email: string, password: string, displayName?: string): Promise<AuthUser> {
  const cleanEmail = email.trim().toLowerCase();
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    ...(displayName ? { options: { data: { name: displayName } } } : {}),
  });

  // Even when Supabase returns a user without a session (email confirmation
  // pending), we still create a local account + session so the user can
  // proceed straight into the app.
  if (data.user) {
    const user = toAuthUser(data.user)!;
    upsertLocalAccount({ uid: user.uid, email: cleanEmail, password, name: displayName || user.displayName || undefined });
    setLocalSession({ uid: user.uid, email: cleanEmail, name: displayName || user.displayName || undefined });
    return user;
  }

  if (error) throw mapAuthError(error, "Registration failed. Please check details.");

  // No Supabase user at all (e.g. rate limit / offline) — use a local account.
  const uid = "local_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  upsertLocalAccount({ uid, email: cleanEmail, password, name: displayName });
  setLocalSession({ uid, email: cleanEmail, name: displayName });
  return localSessionToAuthUser({ uid, email: cleanEmail, name: displayName });
}

export async function signOutAuth(): Promise<void> {
  setLocalSession(null);
  try {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) throw mapAuthError(error, "Could not sign out.");
  } catch (err) {
    // Local-only session: ignore Supabase sign-out errors.
    if (!(err instanceof AuthError)) return;
    throw err;
  }
}

export async function sendPasswordResetEmailTo(email: string): Promise<void> {
  const supabase = getSupabase();
  const origin = typeof window !== "undefined" ? window.location.origin : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    ...(origin ? { redirectTo: `${origin}/reset-password` } : {}),
  });
  if (error) throw mapAuthError(error, "Could not send reset email.");
}

export async function updatePassword(newPassword: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw mapAuthError(error, "Could not update password.");
}

export async function hasRecoverySession(): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getSession();
    return Boolean(data.session);
  } catch {
    return false;
  }
}

export async function resendVerificationEmailTo(email?: string): Promise<void> {
  const supabase = getSupabase();
  const target = email?.trim();
  if (!target) {
    const { data } = await supabase.auth.getUser();
    if (!data.user?.email) throw new AuthError("No signed-in email found.", "auth/no-user");
    const { error } = await supabase.auth.resend({ type: "signup", email: data.user.email });
    if (error) throw mapAuthError(error, "Could not resend verification email.");
    return;
  }
  const { error } = await supabase.auth.resend({ type: "signup", email: target });
  if (error) throw mapAuthError(error, "Could not resend verification email.");
}

export async function setAuthDisplayName(name: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.auth.updateUser({ data: { name } });
  if (error) throw mapAuthError(error, "Could not update display name.");
}
