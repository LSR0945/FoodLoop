import type { User } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";

/** Supabase user mapped to a Firestore-like shape so existing UI code keeps working. */
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
  return new AuthError(message.replace(/^Firebase:\s*/, ""), error?.code || "auth/error");
}

export async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw mapAuthError(error, "Login failed. Please check credentials.");
  return toAuthUser(data.user)!;
}

export async function signUpWithEmail(email: string, password: string, displayName?: string): Promise<AuthUser> {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    ...(displayName ? { options: { data: { name: displayName } } } : {}),
  });
  if (error) throw mapAuthError(error, "Registration failed. Please check details.");
  if (!data.user) throw new AuthError("Registration failed. Please try again.", "auth/signup-failed");
  return toAuthUser(data.user)!;
}

export async function signOutAuth(): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw mapAuthError(error, "Could not sign out.");
}

export async function sendPasswordResetEmailTo(email: string): Promise<void> {
  const supabase = getSupabase();
  const origin = typeof window !== "undefined" ? window.location.origin : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim(),
    origin ? { redirectTo: `${origin}/#/login` } : undefined,
  );
  if (error) throw mapAuthError(error, "Could not send reset email.");
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
