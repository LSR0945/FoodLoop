import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { updateProfile } from "@/lib/db";
import { getFirebase } from "@/lib/firebase";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log In — FoodLoop" },
      { name: "description", content: "Sign in to your FoodLoop donor, recipient, or volunteer account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { auth } = await getFirebase();
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(auth, email.trim(), password);
      toast.success("Welcome back to FoodLoop!");
      navigate({ to: "/app" });
    } catch (err: any) {
      toast.error(err.message.replace("Firebase: ", "") || "Login failed. Please check credentials.");
    } finally {
      setBusy(false);
    }
  }

  async function handleFastDemo(role: Role) {
    setBusy(true);
    try {
      const demoEmails: Record<Role, string> = {
        donor: "donor.demo@foodloop.org",
        recipient: "shelter.demo@foodloop.org",
        ngo: "shelter.demo@foodloop.org",
        volunteer: "volunteer.demo@foodloop.org",
        admin: "admin.moderator@foodloop.org",
      };
      const email = demoEmails[role];
      const pass = "demo123456";

      const { auth } = await getFirebase();
      const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import("firebase/auth");

      let uid = "";
      try {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        uid = cred.user.uid;
      } catch {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        uid = cred.user.uid;
      }
      await updateProfile(uid, { role });
      toast.success(`Logged in as demo ${role.toUpperCase()}!`);
      const targetPortal = role === "donor" ? "/donor" : role === "volunteer" ? "/volunteer" : role === "admin" ? "/admin" : "/recipient";
      navigate({ to: targetPortal });
    } catch (err: any) {
      toast.error(err.message || "Could not log in as demo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#242923] flex flex-col justify-between">
      <header className="border-b border-[#E2DBD0] bg-white p-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Logo size="sm" />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD5C8] bg-[#F8F5ED] px-3.5 py-1.5 text-xs font-bold text-[#205C43] shadow-xs hover:bg-white hover:border-[#205C43] transition-all"
          >
            ← Guest Browsing
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-4 py-8">
        <div className="rounded-3xl border border-[#DDD5C8] bg-white p-8 shadow-sm">
          <div className="text-center">
            <h1 className="font-display text-2xl font-extrabold text-[#242923]">Welcome Back</h1>
            <p className="mt-1 text-xs text-[#656C62]">Sign in to manage your surplus food or collections</p>
          </div>

          {/* Active Session Notification if logged in */}
          {user && (
            <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
              <p className="font-semibold">
                Currently signed in as: <strong>{user.email || profile?.name || "Active User"}</strong> ({profile?.role || "donor"})
              </p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate({ to: profile?.role === "donor" ? "/donor" : profile?.role === "volunteer" ? "/volunteer" : profile?.role === "admin" ? "/admin" : "/recipient" })}
                  className="rounded-lg bg-[#205C43] px-3 py-1 text-[11px] font-bold text-white hover:brightness-110"
                >
                  Enter Portal →
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    toast.success("Signed out successfully.");
                    window.location.reload();
                  }}
                  className="rounded-lg border border-red-300 bg-white px-3 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50"
                >
                  Sign Out of Account
                </button>
              </div>
            </div>
          )}

          {/* Quick Demo Access */}
          <div className="mt-5 rounded-2xl bg-[#205C43]/5 p-3.5 border border-[#205C43]/15 text-center">
            <p className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#205C43] uppercase tracking-wider">
              <Sparkles className="size-3.5 text-[#ED7545]" /> 1-Click Fast Evaluator Login
            </p>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => handleFastDemo("donor")}
                className="rounded-xl border border-[#DDD5C8] bg-white py-1.5 text-[11px] font-bold text-[#242923] hover:border-[#205C43]"
              >
                🍲 Donor
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleFastDemo("recipient")}
                className="rounded-xl border border-[#DDD5C8] bg-white py-1.5 text-[11px] font-bold text-[#242923] hover:border-[#205C43]"
              >
                🏢 Shelter
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleFastDemo("volunteer")}
                className="rounded-xl border border-[#DDD5C8] bg-white py-1.5 text-[11px] font-bold text-[#242923] hover:border-[#205C43]"
              >
                🚴 Volunteer
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-[#242923]">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-3 size-4 text-[#656C62]" />
                <input
                  type="email"
                  required
                  placeholder="name@organization.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] py-2.5 pl-10 pr-4 text-xs font-medium text-[#242923] focus:border-[#205C43] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#242923]">Password</label>
                <Link
                  to="/forgot-password"
                  className="rounded-md px-1.5 py-0.5 text-[11px] font-bold text-[#205C43] hover:bg-[#205C43]/10 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-3 size-4 text-[#656C62]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] py-2.5 pl-10 pr-10 text-xs font-medium text-[#242923] focus:border-[#205C43] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#656C62] hover:text-[#242923]"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-[#205C43] py-3 text-xs font-bold text-white shadow-xs hover:brightness-105 disabled:opacity-50 transition-all"
            >
              {busy ? "Signing in…" : "Sign In to FoodLoop"}
            </button>
          </form>

          <div className="mt-6 border-t border-[#DDD5C8] pt-5 text-center text-xs text-[#656C62] space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span>Don't have an account yet?</span>
              <Link
                to="/signup"
                className="inline-flex items-center rounded-full bg-[#205C43]/10 px-3 py-1 font-bold text-[#205C43] hover:bg-[#205C43] hover:text-white transition-all shadow-2xs"
              >
                Create Account →
              </Link>
            </div>
            <div className="pt-1">
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#ED7545]/30 bg-[#ED7545]/5 px-3 py-1.5 text-[11px] font-bold text-[#ED7545] hover:bg-[#ED7545] hover:text-white transition-all"
              >
                🏢 Detailed Role Onboarding (NGO / Donor / Courier) →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-[#656C62]">
        <p>© FoodLoop Inc. Good food. Shared with purpose.</p>
      </footer>
    </div>
  );
}
