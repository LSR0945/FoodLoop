import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { updateProfile } from "@/lib/db";
import { signInWithEmail, signUpWithEmail } from "@/lib/supabase-auth";
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
      await signInWithEmail(email.trim(), password);
      toast.success("Welcome back to FoodLoop!");
      navigate({ to: "/app" });
    } catch (err: any) {
      toast.error(err.message || "Login failed. Please check credentials.");
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

      let uid = "";
      try {
        const cred = await signInWithEmail(email, pass);
        uid = cred.uid;
      } catch {
        const cred = await signUpWithEmail(email, pass, role);
        uid = cred.uid;
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
      {/* Top Mobile-Safe Header */}
      <header className="border-b border-[#E2DBD0] bg-white px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Logo size="sm" showTagline={false} />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD5C8] bg-[#F8F5ED] px-3.5 py-1.5 text-xs font-bold text-[#205C43] shadow-xs hover:bg-white hover:border-[#205C43] transition-all"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10 flex-1 flex items-center justify-center">
        <div className="w-full overflow-hidden rounded-3xl border border-[#DDD5C8] bg-white shadow-xl grid lg:grid-cols-12">
          
          {/* Left Column: Hunger Relief & Community Impact Imagery */}
          <div className="lg:col-span-5 relative bg-[#164330] p-6 sm:p-8 text-white flex flex-col justify-between overflow-hidden">
            {/* Background image showing warm meals being shared with community */}
            <div className="absolute inset-0 z-0">
              <img
                src="/images/hunger/hunger3.png"
                alt="Community food donation & hunger relief"
                className="h-full w-full object-cover opacity-25 filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#164330] via-[#164330]/80 to-transparent" />
            </div>

            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-[#F8F5ED] border border-white/20">
                🌱 Zero Hunger Movement
              </span>
              <h2 className="mt-4 font-display text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Every meal saved is a life nourished.
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#F8F5ED]/90 leading-relaxed">
                Connect directly with surplus donor kitchens, verified recipient shelters, and courier volunteers to make sure good food never goes to waste.
              </p>
            </div>

            {/* Impact Highlights Card */}
            <div className="relative z-10 mt-6 rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/15 space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">🍲</span>
                <span className="font-semibold text-white">14,250+ Meals Shared Locally</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">🏢</span>
                <span className="font-semibold text-white">48 Verified Shelter Homes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">⏱️</span>
                <span className="font-semibold text-white">Avg. 35-min Rapid Pickup</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sign In Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            <div className="text-left">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#242923]">Welcome Back</h1>
              <p className="mt-1 text-xs text-[#656C62]">Sign in to access your surplus food dashboard or active collections</p>
            </div>

            {/* Active Session Alert */}
            {user && (
              <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900">
                <p className="font-semibold">
                  Signed in as: <strong>{user.email || profile?.name || "Active Member"}</strong> ({profile?.role || "donor"})
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate({ to: profile?.role === "donor" ? "/donor" : profile?.role === "volunteer" ? "/volunteer" : profile?.role === "admin" ? "/admin" : "/recipient" })}
                    className="rounded-lg bg-[#205C43] px-3.5 py-1.5 text-xs font-bold text-white hover:brightness-110 shadow-xs"
                  >
                    Open Dashboard →
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await signOut();
                      toast.success("Signed out successfully.");
                      window.location.reload();
                    }}
                    className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}

            {/* Quick Evaluator 1-Tap Login */}
            <div className="mt-5 rounded-2xl bg-[#205C43]/5 p-3.5 border border-[#205C43]/15">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#205C43] uppercase tracking-wider">
                <Sparkles className="size-3.5 text-[#ED7545]" /> 1-Tap Demo Access:
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleFastDemo("donor")}
                  className="rounded-xl border border-[#DDD5C8] bg-white py-2 text-xs font-bold text-[#242923] hover:border-[#205C43] shadow-2xs"
                >
                  🍲 Donor
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleFastDemo("recipient")}
                  className="rounded-xl border border-[#DDD5C8] bg-white py-2 text-xs font-bold text-[#242923] hover:border-[#205C43] shadow-2xs"
                >
                  🏢 Shelter NGO
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleFastDemo("volunteer")}
                  className="rounded-xl border border-[#DDD5C8] bg-white py-2 text-xs font-bold text-[#242923] hover:border-[#205C43] shadow-2xs"
                >
                  🚴 Volunteer
                </button>
              </div>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleLogin} className="mt-5 space-y-4">
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
                    className="w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] py-2.5 pl-10 pr-4 text-xs font-medium text-[#242923] focus:border-[#205C43] focus:outline-none focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#242923]">Password</label>
                  <Link
                    to="/forgot-password"
                    className="rounded-md px-1 py-0.5 text-[11px] font-bold text-[#205C43] hover:underline"
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
                    className="w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] py-2.5 pl-10 pr-10 text-xs font-medium text-[#242923] focus:border-[#205C43] focus:outline-none focus:bg-white transition-all"
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
                className="w-full rounded-full bg-[#205C43] py-3 text-xs font-bold text-white shadow-xs hover:brightness-105 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
              >
                {busy ? "Signing In…" : "Sign In to FoodLoop"}
              </button>
            </form>

            <div className="mt-6 border-t border-[#DDD5C8] pt-4 text-center text-xs text-[#656C62] space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span>New to FoodLoop?</span>
                <Link
                  to="/signup"
                  className="inline-flex items-center rounded-full bg-[#205C43]/10 px-3 py-1 font-bold text-[#205C43] hover:bg-[#205C43] hover:text-white transition-all"
                >
                  Create Account →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-[#656C62]">
        <p>© FoodLoop. Good food. Shared with purpose.</p>
      </footer>
    </div>
  );
}
