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
  /** True only for accounts created through signup (or a real Supabase login).
   *  Ghost entries saved by the old lenient login are NOT registered. */
  registered?: boolean | undefined;
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

export function setLocalSession(sess: LocalSession | null) {
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

/** True when this email has a real (signup-created) local account on this device. */
export function hasRegisteredLocalAccount(email: string): boolean {
  try {
    const acc = readLocalAccounts()[email.trim().toLowerCase()];
    return Boolean(acc && acc.registered === true);
  } catch {
    return false;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.includes("@") || password.length < 6) {
    throw new AuthError("Please enter a valid email and a 6+ character password.", "auth/invalid-credential");
  }

  const local = readLocalAccounts()[cleanEmail];
  const localRegistered = Boolean(local && local.registered === true);

  try {
    // 1) Real Supabase login — always tried first and authoritative.
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (!error && data.user) {
      const user = toAuthUser(data.user)!;
      upsertLocalAccount({ uid: user.uid, email: cleanEmail, password, name: user.displayName || undefined, registered: true });
      setLocalSession({ uid: user.uid, email: cleanEmail, name: user.displayName || undefined });
      return user;
    }

    const lower = (error?.message || "").toLowerCase();
    if (lower.includes("email not confirmed")) {
      throw new AuthError("Please verify your email address before signing in.", "auth/email-not-confirmed");
    }

    // 2) "Invalid login credentials": either the email was never registered or
    // the password is wrong. STRICT rule: only signup-created local accounts
    // may fall back, and only with the exact password they registered with.
    if (localRegistered && local && local.password === password) {
      setLocalSession({ uid: local.uid, email: cleanEmail, name: local.name });
      return localSessionToAuthUser({ uid: local.uid, email: cleanEmail, name: local.name });
    }
    if (localRegistered) {
      throw new AuthError("Incorrect password for this email. Please try again.", "auth/wrong-password");
    }

    // 3) Tell the user precisely whether this email exists at all.
    let profileExists = false;
    try {
      const { data: rows } = await supabase.from("profiles").select("uid").eq("email", cleanEmail).limit(1);
      profileExists = Boolean(rows && rows.length > 0);
    } catch {}
    if (profileExists) {
      throw new AuthError("Incorrect password for this email. Please try again.", "auth/wrong-password");
    }
    throw new AuthError("No account found with this email. Please create an account first.", "auth/user-not-found");
  } catch (err) {
    if (err instanceof AuthError) throw err;
    // Network/offline — allow ONLY signup-created local accounts with matching
    // password. Unknown emails are rejected instead of being let in.
    if (localRegistered && local && local.password === password) {
      setLocalSession({ uid: local.uid, email: cleanEmail, name: local.name });
      return localSessionToAuthUser({ uid: local.uid, email: cleanEmail, name: local.name });
    }
    if (localRegistered) {
      throw new AuthError("Incorrect password for this email. Please try again.", "auth/wrong-password");
    }
    throw new AuthError("Could not reach the server. Check your internet connection, or create a new account.", "auth/network-error");
  }
}

/** Creates a local-only account + session. Used as the last-resort fallback
 *  so signup always succeeds even if Supabase rejects the email. */
export function createLocalAccountAndSession(email: string, password: string, displayName?: string): AuthUser {
  const cleanEmail = email.trim().toLowerCase();
  const uid = "local_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const name = displayName || cleanEmail.split("@")[0] || "User";
  upsertLocalAccount({ uid, email: cleanEmail, password, name, registered: true });
  setLocalSession({ uid, email: cleanEmail, name });
  return localSessionToAuthUser({ uid, email: cleanEmail, name });
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
    upsertLocalAccount({ uid: user.uid, email: cleanEmail, password, name: displayName || user.displayName || undefined, registered: true });
    setLocalSession({ uid: user.uid, email: cleanEmail, name: displayName || user.displayName || undefined });
    return user;
  }

  if (error) {
    const lower = (error.message || "").toLowerCase();
    // The Supabase account already exists (e.g. from an earlier attempt).
    // Try to sign in with the given password so we reuse the REAL account
    // (and its real uid) instead of creating a local-only one.
    if (lower.includes("already registered") || lower.includes("already been registered")) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (!signInError && signInData.user) {
        const user = toAuthUser(signInData.user)!;
        upsertLocalAccount({ uid: user.uid, email: cleanEmail, password, name: displayName || user.displayName || undefined, registered: true });
        setLocalSession({ uid: user.uid, email: cleanEmail, name: displayName || user.displayName || undefined });
        return user;
      }
      return createLocalAccountAndSession(cleanEmail, password, displayName);
    }
    throw mapAuthError(error, "Registration failed. Please check details.");
  }

  // No Supabase user at all (e.g. rate limit / offline) — use a local account.
  return createLocalAccountAndSession(cleanEmail, password, displayName);
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
