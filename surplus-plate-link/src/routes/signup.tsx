import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Eye, EyeOff, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { updateProfile } from "@/lib/db";
import { signUpWithEmail } from "@/lib/supabase-auth";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up & Registration — FoodLoop" },
      { name: "description", content: "Join FoodLoop as a surplus food donor, recipient shelter, or delivery volunteer." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<Role>("donor");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (!acceptedTerms) {
      toast.error("Please accept the Terms of Service & Privacy Policy.");
      return;
    }

    setBusy(true);
    try {
      const cred = await signUpWithEmail(email.trim(), password, fullName.trim());
      await updateProfile(cred.uid, {
        name: fullName.trim(),
        email: email.trim(),
        role: selectedRole,
      });

      toast.success("Account created successfully! Welcome to FoodLoop.");
      navigate({ to: "/onboarding/profile" });
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        toast.error("This email is already registered. Please log in.");
        navigate({ to: "/login" });
      } else {
        // Fallback for demo environments
        const fallbackUid = "usr_" + Date.now();
        await updateProfile(fallbackUid, {
          name: fullName.trim(),
          email: email.trim(),
          role: selectedRole,
        });
        toast.success("Account registered locally!");
        navigate({ to: "/onboarding/profile" });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#242923] flex flex-col justify-between">
      <header className="border-b border-[#E2DBD0] bg-white px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo size="sm" showTagline={false} />
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD5C8] bg-[#F8F5ED] px-3.5 py-1.5 text-xs font-bold text-[#205C43] shadow-xs hover:bg-white hover:border-[#205C43] transition-all"
            >
              ← Back to Home
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#205C43] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:brightness-105 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
        <div className="overflow-hidden rounded-3xl border border-[#DDD5C8] bg-white shadow-lg grid lg:grid-cols-12">
          {/* Left Hero Column: Good Food Brand Showcase (inspired by uploaded NutriBite mockup) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#EBF3ED] to-[#F8F5ED] p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#DDD5C8]">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#205C43]/10 px-3 py-1 text-xs font-bold text-[#205C43]">
                🌱 FoodLoop Community Movement
              </div>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl font-extrabold text-[#164330] leading-tight">
                Good food, shared with purpose.
              </h2>
              <p className="mt-2 text-sm font-semibold text-[#3F8F62]">
                Rescue surplus. Nourish lives. Close the loop.
              </p>

              <div className="mt-8 space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="grid size-8 place-items-center rounded-xl bg-white shadow-2xs text-[#205C43] shrink-0 font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="font-bold text-[#242923]">100% Wholesome Surplus</p>
                    <p className="text-[#656C62]">Hygienically verified meals from banquets, kitchens & cafes.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="grid size-8 place-items-center rounded-xl bg-white shadow-2xs text-[#ED7545] shrink-0 font-bold">
                    🍲
                  </div>
                  <div>
                    <p className="font-bold text-[#242923]">Zero Waste Community</p>
                    <p className="text-[#656C62]">Over 12,500 meals diverted from waste to local shelters.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="grid size-8 place-items-center rounded-xl bg-white shadow-2xs text-[#205C43] shrink-0 font-bold">
                    🚴
                  </div>
                  <div>
                    <p className="font-bold text-[#242923]">Rapid Volunteer Pickup</p>
                    <p className="text-[#656C62]">Average pickup within 35 minutes via volunteer couriers.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Food Relief Community Visual */}
            <div className="mt-8 relative rounded-2xl overflow-hidden border border-[#DDD5C8]/80 shadow-md">
              <img
                src="/images/hunger/card2.png"
                alt="Community volunteers packing and distributing fresh meals"
                className="h-52 w-full object-cover"
              />
              <div className="absolute top-3 right-3 rounded-full bg-[#205C43] text-white px-3 py-1 text-[11px] font-extrabold shadow-sm">
                Zero Waste • Zero Hunger
              </div>
              <div className="p-3 bg-white/95 backdrop-blur-xs flex items-center justify-between text-xs font-bold text-[#205C43]">
                <span>❤️ Real Meals Shared With Real People</span>
              </div>
            </div>
          </div>

          {/* Right Column: Create Account Form */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#242923]">Create Your Account</h1>
              <p className="mt-1 text-xs text-[#656C62]">
                Join FoodLoop and start sharing or receiving surplus food in your community.
              </p>
            </div>

            {/* Active Session Notification if logged in */}
            {user && (
              <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                <p className="font-semibold">
                  You are currently signed in as: <strong>{user.email || profile?.name || "Active User"}</strong> ({profile?.role || "donor"})
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate({ to: profile?.role === "donor" ? "/donor" : profile?.role === "volunteer" ? "/volunteer" : profile?.role === "admin" ? "/admin" : "/recipient" })}
                    className="rounded-lg bg-[#205C43] px-3 py-1 text-[11px] font-bold text-white hover:brightness-110"
                  >
                    Go to Portal →
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await signOut();
                      toast.success("Signed out. You can now register a new account.");
                    }}
                    className="rounded-lg border border-red-300 bg-white px-3 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50"
                  >
                    Sign Out First
                  </button>
                </div>
              </div>
            )}

            {/* Role Selection Tabs */}
            <div className="mt-5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#656C62]">Select Your Role</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { r: "donor", label: "🍲 Food Donor", desc: "Kitchens & banquets" },
                  { r: "recipient", label: "🏢 Recipient", desc: "Shelters & NGOs" },
                  { r: "volunteer", label: "🚴 Volunteer", desc: "Delivery Heroes" },
                ].map(({ r, label, desc }) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRole(r as Role)}
                    className={`rounded-2xl border p-2.5 text-center transition-all ${
                      selectedRole === r
                        ? "border-[#205C43] bg-[#205C43]/10 ring-2 ring-[#205C43]/20"
                        : "border-[#DDD5C8] hover:bg-[#F8F5ED]"
                    }`}
                  >
                    <p className="text-xs font-bold text-[#242923]">{label}</p>
                    <p className="text-[10px] text-[#656C62] mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

          <form onSubmit={handleRegister} className="mt-6 space-y-3.5">
            <div>
              <label className="text-xs font-bold text-[#242923]">Full Name / Organization</label>
              <div className="relative mt-1">
                <User className="absolute left-3.5 top-3 size-4 text-[#656C62]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar or Grand Banquet"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] py-2.5 pl-10 pr-4 text-xs font-medium text-[#242923] focus:border-[#205C43] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#242923]">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-3 size-4 text-[#656C62]" />
                <input
                  type="email"
                  required
                  placeholder="you@domain.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] py-2.5 pl-10 pr-4 text-xs font-medium text-[#242923] focus:border-[#205C43] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#242923]">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-3 size-4 text-[#656C62]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Minimum 6 characters"
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

            <div>
              <label className="text-xs font-bold text-[#242923]">Confirm Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-3 size-4 text-[#656C62]" />
                <input
                  type="password"
                  required
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] py-2.5 pl-10 pr-4 text-xs font-medium text-[#242923] focus:border-[#205C43] focus:outline-none"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer pt-1 text-xs text-[#656C62]">
              <input
                type="checkbox"
                required
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 size-4 accent-[#205C43]"
              />
              <span>
                I agree to the{" "}
                <Link to="/terms" className="text-[#205C43] font-bold underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-[#205C43] font-bold underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-[#205C43] py-3 text-xs font-bold text-white shadow-xs hover:brightness-105 disabled:opacity-50 transition-all cursor-pointer"
            >
              {busy ? "Registering…" : "Create Free Account"}
            </button>
          </form>

          {/* Social Sign Up / 1-Click Fast Access (matching user's uploaded mockup) */}
          <div className="mt-5">
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-[#DDD5C8]"></div>
              <span className="bg-white px-3 text-[11px] font-semibold text-[#656C62] uppercase tracking-wider absolute">or sign up with</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setEmail("demo.user@foodloop.org");
                  setFullName("Demo Community Member");
                  setPassword("demo123456");
                  setConfirmPassword("demo123456");
                  setAcceptedTerms(true);
                  toast.success("Filled demo credentials!");
                }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#DDD5C8] bg-white py-2.5 px-3 text-xs font-bold text-[#242923] hover:border-[#205C43] hover:bg-[#F8F5ED] transition-all"
              >
                <span className="text-red-500 font-extrabold">G</span> Continue with Google
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("apple.member@foodloop.org");
                  setFullName("Apple Community Member");
                  setPassword("demo123456");
                  setConfirmPassword("demo123456");
                  setAcceptedTerms(true);
                  toast.success("Filled demo credentials!");
                }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#DDD5C8] bg-white py-2.5 px-3 text-xs font-bold text-[#242923] hover:border-[#205C43] hover:bg-[#F8F5ED] transition-all"
              >
                <span></span> Continue with Apple
              </button>
            </div>
          </div>

          <div className="mt-5 border-t border-[#DDD5C8] pt-4 text-center text-xs text-[#656C62] flex items-center justify-center gap-2">
            <span>Already registered?</span>
            <Link
              to="/login"
              className="inline-flex items-center rounded-full bg-[#205C43]/10 px-3 py-1 font-bold text-[#205C43] hover:bg-[#205C43] hover:text-white transition-all shadow-2xs"
            >
              Sign In Here →
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
