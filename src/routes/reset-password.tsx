import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { hasRecoverySession, updatePassword } from "@/lib/supabase-auth";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set New Password — FoodLoop" },
      { name: "description", content: "Choose a new password for your FoodLoop account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      // Give supabase-js a moment to exchange ?code= / #access_token= from the URL.
      const ok = await hasRecoverySession();
      if (!alive) return;
      setHasSession(ok);
      setChecking(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await updatePassword(password);
      setDone(true);
      toast.success("Password updated! You can now sign in.");
    } catch (err) {
      toast.error((err as Error).message || "Could not update password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#242923] flex flex-col justify-between">
      <header className="border-b border-[#E2DBD0] bg-white p-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Logo size="sm" />
          <Link to="/login" className="text-xs font-bold text-[#205C43] hover:underline">
            Back to Sign In
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-4 py-12">
        <div className="rounded-3xl border border-[#DDD5C8] bg-white p-8 shadow-sm">
          {checking ? (
            <div className="flex flex-col items-center gap-3 py-8 text-[#656C62]">
              <Loader2 className="size-6 animate-spin text-[#205C43]" />
              <p className="text-xs">Verifying your reset link…</p>
            </div>
          ) : done ? (
            <div className="text-center py-4 space-y-3">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#3F8F62]/10 text-[#3F8F62]">
                <CheckCircle2 className="size-6" />
              </div>
              <h2 className="font-display text-xl font-bold text-[#242923]">Password Changed</h2>
              <p className="text-xs text-[#656C62] leading-relaxed">
                Your password has been updated. Sign in with your new password.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => navigate({ to: "/login" })}
                  className="inline-flex rounded-full bg-[#205C43] px-6 py-2.5 text-xs font-bold text-white shadow-xs"
                >
                  Go to Sign In
                </button>
              </div>
            </div>
          ) : hasSession ? (
            <>
              <div className="text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#205C43]/10 text-[#205C43]">
                  <KeyRound className="size-6 text-[#ED7545]" />
                </div>
                <h1 className="mt-3 font-display text-2xl font-extrabold text-[#242923]">Set New Password</h1>
                <p className="mt-1 text-xs text-[#656C62]">
                  Choose a strong new password for your FoodLoop account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#242923]">New Password</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3.5 top-3 size-4 text-[#656C62]" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] py-2.5 pl-10 pr-4 text-xs font-medium text-[#242923] focus:border-[#205C43] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#242923]">Confirm Password</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3.5 top-3 size-4 text-[#656C62]" />
                    <input
                      type="password"
                      required
                      placeholder="Re-enter password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] py-2.5 pl-10 pr-4 text-xs font-medium text-[#242923] focus:border-[#205C43] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-full bg-[#205C43] py-3 text-xs font-bold text-white shadow-xs hover:brightness-105 disabled:opacity-50"
                >
                  {busy ? "Updating…" : "Update Password"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 space-y-3">
              <h2 className="font-display text-xl font-bold text-[#242923]">Link Expired or Invalid</h2>
              <p className="text-xs text-[#656C62] leading-relaxed">
                This password reset link is no longer valid. Please request a fresh link.
              </p>
              <div className="pt-4">
                <Link
                  to="/forgot-password"
                  className="inline-flex rounded-full bg-[#205C43] px-6 py-2.5 text-xs font-bold text-white shadow-xs"
                >
                  Request New Link
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-[#656C62]">
        <p>© FoodLoop Inc. Good food. Shared with purpose.</p>
      </footer>
    </div>
  );
}
