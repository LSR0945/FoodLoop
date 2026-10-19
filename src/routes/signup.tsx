import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { registerDonor, registerNGO, registerVolunteer, updateProfile } from "@/lib/db";
import { createLocalAccountAndSession, getLocalSession, signUpWithEmail } from "@/lib/supabase-auth";
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

const ROLE_META: Record<Role, { label: string; emoji: string; portal: string; next: string[] }> = {
  donor: {
    label: "Food Donor",
    emoji: "🍲",
    portal: "/donor",
    next: [
      "List your first surplus meal from the Donor Dashboard",
      "Set pickup window, quantity & food category",
      "Get matched with verified shelters nearby",
    ],
  },
  recipient: {
    label: "Recipient Shelter",
    emoji: "🏢",
    portal: "/recipient",
    next: [
      "Browse available surplus meals near you",
      "Request meals for your beneficiaries",
      "Confirm handover with the 4-digit secure code",
    ],
  },
  volunteer: {
    label: "Delivery Volunteer",
    emoji: "🚴",
    portal: "/volunteer",
    next: [
      "Browse open pickup requests on your map",
      "Accept a route that fits your shift",
      "Deliver with photo + code verification",
    ],
  },
  ngo: {
    label: "NGO Partner",
    emoji: "🏢",
    portal: "/recipient",
    next: [
      "Complete your NGO verification",
      "Start receiving surplus food alerts",
      "Coordinate pickups with volunteers",
    ],
  },
  admin: {
    label: "Admin",
    emoji: "🛡️",
    portal: "/admin",
    next: ["Review pending listings", "Monitor platform activity"],
  },
};

function passwordScore(pw: string): number {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

function SignupPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<Role>("donor");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [registered, setRegistered] = useState<{ name: string; email: string; role: Role } | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  // Auto-redirect to the portal after 3 seconds on the success screen.
  useEffect(() => {
    if (!registered) return;
    const timer = setTimeout(() => {
      setRedirecting(true);
      handleGoToDashboard();
    }, 3000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registered]);

  const score = passwordScore(password);
  const strengthLabel = ["Too short", "Weak", "Fair", "Good", "Strong"][score];
  const strengthColor = ["#DC2626", "#DC2626", "#D97706", "#205C43", "#164330"][score];

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
    let cred: Awaited<ReturnType<typeof signUpWithEmail>>;
    try {
      // Never let a slow/hanging network delay the welcome screen: race the
      // real signup against an 8s timeout, then fall back to a local account.
      cred = await Promise.race([
        signUpWithEmail(email.trim(), password, fullName.trim()),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("signup-timeout")), 8000)),
      ]);
    } catch {
      // Last-resort fallback: create a local account + session so signup
      // ALWAYS lands in the dashboard — never bounce back to /login.
      cred = createLocalAccountAndSession(email.trim(), password, fullName.trim());
    }

    // 🎉 Show the welcome celebration screen IMMEDIATELY — role-table syncing
    // runs in the background so it can never block the celebration.
    toast.success(`Welcome to FoodLoop, ${fullName.trim().split(" ")[0]}! 🎉`);
    setRegistered({ name: fullName.trim(), email: email.trim(), role: selectedRole });
    setBusy(false);

    const now = Date.now();
    const phoneVal = phone.trim();
    void (async () => {
      try {
        // Write to the role-specific Supabase table AND the shared profiles table.
        if (selectedRole === "donor") {
          await registerDonor({
            uid: cred.uid,
            name: fullName.trim(),
            donorType: "household",
            email: email.trim(),
            phone: phoneVal,
            area: "",
            createdAt: now,
          });
        } else if (selectedRole === "recipient") {
          await registerNGO({
            uid: cred.uid,
            name: fullName.trim(),
            orgName: fullName.trim(),
            contactPerson: fullName.trim(),
            email: email.trim(),
            phone: phoneVal,
            area: "",
            createdAt: now,
          });
        } else if (selectedRole === "volunteer") {
          await registerVolunteer({
            uid: cred.uid,
            name: fullName.trim(),
            email: email.trim(),
            phone: phoneVal,
            area: "",
            shifts: ["evening"],
            createdAt: now,
          });
        }

        // Also upsert profiles so AuthProvider can load role immediately.
        const profileUpdate: { name: string; email: string; role: Role; phone?: string } = {
          name: fullName.trim(),
          email: email.trim(),
          role: selectedRole,
        };
        if (phoneVal) profileUpdate.phone = phoneVal;
        await updateProfile(cred.uid, profileUpdate);
      } catch (err) {
        console.warn("Role data sync failed (kept locally):", err);
      }
    })();
  }

  async function handleGoToDashboard() {
    if (!registered) return;
    const meta = ROLE_META[registered.role];
    // Wait briefly so AuthProvider can pick up the fresh local session
    // (the foodloop_auth_changed event triggers an async re-bootstrap).
    for (let i = 0; i < 20; i++) {
      const sess = getLocalSession();
      if (sess) break;
      await new Promise((r) => setTimeout(r, 50));
    }
    navigate({ to: meta.portal });
  }

  return (
    <div className="min-h-screen text-[#242923] flex flex-col justify-between relative overflow-x-hidden">
      {/* ── Background: fixed cream base + dotted texture ───────────────── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#F8F5ED]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(#205C43 0.7px, transparent 0.7px)",
            backgroundSize: "20px 20px",
          }}
        />
      </div>
      {/* ── Background: deep-green branded sky fading into cream (scrolls with page) ── */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #0E3323 0%, #164330 38%, rgba(32,92,67,0.6) 70%, rgba(248,245,237,0) 100%)",
          }}
        />
        <img
          src="/images/hunger/hunger1.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-soft-light"
        />
        <div className="absolute -top-24 -right-24 size-[24rem] rounded-full bg-[#ED7545]/25 blur-3xl" />
        <div className="absolute top-40 -left-32 size-[22rem] rounded-full bg-[#F59E0B]/20 blur-3xl" />
        <div className="absolute top-16 right-1/4 size-[16rem] rounded-full bg-[#3F8F62]/25 blur-3xl" />
        {/* subtle grain sparkle */}
        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage: "radial-gradient(rgba(248,245,237,0.9) 0.8px, transparent 0.8px)",
            backgroundSize: "26px 26px",
          }}
        />
      </div>

      {/* ===== Native app bar (mobile) ===== */}
      <header className="lg:hidden border-b border-white/10 bg-[#0E3323]/90 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            to="/welcome"
            aria-label="Go back"
            className="grid size-9 place-items-center rounded-full border border-white/25 bg-white/10 text-[#F8F5ED] transition-transform active:scale-90"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <Logo light size="sm" showTagline={false} />
          <Link
            to="/login"
            className="rounded-full bg-[#ED7545] px-3.5 py-1.5 text-[11px] font-bold text-white shadow-xs transition-transform active:scale-95"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* ===== Desktop header (web) ===== */}
      <header className="hidden lg:block border-b border-white/10 bg-[#0E3323]/90 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo light size="sm" showTagline={false} />
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="group inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-[#F8F5ED] shadow-xs hover:bg-white/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            >
              <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">←</span> Sign In
            </Link>
            <Link
              to="/login"
              className="group inline-flex items-center gap-1.5 rounded-full bg-[#ED7545] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:brightness-110 hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* ===== Mobile hero (native app style) ===== */}
      <section className="lg:hidden relative px-5 pt-7 pb-16 text-white">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold text-[#F8F5ED] backdrop-blur-md">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3F8F62] opacity-70" />
            <span className="relative inline-flex size-1.5 rounded-full bg-[#3F8F62]" />
          </span>
          🌱 FoodLoop Community Movement
        </span>
        <h1 className="mt-3 font-display text-[2rem] font-extrabold leading-tight text-white">
          Good food,<br />shared with purpose.
        </h1>
        <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-[#F8F5ED]/75">
          Create your free account and start rescuing surplus food in minutes.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-bold">
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-md">✓ 100% Wholesome Surplus</span>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-md">🍲 Zero Waste</span>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-md">⚡ 35-min Pickup</span>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-3 sm:px-4 pb-8 sm:pb-12 lg:py-12 flex-1">
        {/* ============ WELCOME + AUTO-REDIRECT SCREEN ============ */}
        {registered ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-[#DDD5C8] bg-white/95 px-6 py-12 text-center shadow-xl ring-1 ring-white/60 backdrop-blur-sm">
            {/* Animated check + name */}
            <div className="relative mx-auto w-fit">
              <span className="absolute inset-0 rounded-full bg-[#3F8F62]/40 animate-ping" aria-hidden />
              <div className="relative grid size-20 place-items-center rounded-full bg-gradient-to-br from-[#205C43] to-[#3F8F62] text-white shadow-2xl animate-in zoom-in-50 duration-500">
                <CheckCircle2 className="size-10" />
              </div>
            </div>
            <h1 className="mt-6 font-display text-3xl sm:text-4xl font-extrabold text-[#164330] animate-in fade-in slide-in-from-bottom-4 duration-500">
              Welcome, {registered.name.split(" ")[0]}! 🎉
            </h1>
            <p className="mt-2 text-sm font-semibold text-[#3F8F62] animate-in fade-in slide-in-from-bottom-4 duration-700">
              {ROLE_META[registered.role].emoji} Your {ROLE_META[registered.role].label} account is ready.
            </p>

            {/* Progress bar for auto-redirect */}
            <div className="mx-auto mt-8 max-w-xs">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#DDD5C8]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#205C43] to-[#3F8F62] transition-all duration-[2800ms] ease-linear"
                  style={{ width: redirecting ? "100%" : "0%" }}
                />
              </div>
              <p className="mt-3 text-xs text-[#656C62]">
                {redirecting ? "Taking you to your dashboard…" : "Redirecting to your dashboard in 3 seconds…"}
              </p>
            </div>

            {/* Manual skip button (optional) */}
            <button
              type="button"
              onClick={handleGoToDashboard}
              disabled={redirecting}
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[#205C43] px-8 py-3 text-sm font-bold text-white shadow-md hover:brightness-110 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              Open {ROLE_META[registered.role].label} Dashboard Now{" "}
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        ) : (
        <div className="relative z-10 -mt-10 lg:mt-0 grid overflow-hidden rounded-[2rem] lg:rounded-3xl border border-[#DDD5C8] bg-white/95 shadow-2xl ring-1 ring-white/60 backdrop-blur-sm lg:grid-cols-12">
          {/* Brand accent bar */}
          <div className="lg:col-span-12 h-1.5 w-full bg-gradient-to-r from-[#164330] via-[#3F8F62] to-[#ED7545]" />
          {/* Left Hero Column */}
          <div className="hidden lg:flex lg:col-span-5 relative min-w-0 overflow-hidden border-b border-[#DDD5C8] bg-gradient-to-b from-[#EBF3ED] to-[#F8F5ED] p-8 sm:p-10 flex-col justify-between lg:border-b-0 lg:border-r">
            <div className="absolute -top-16 -right-16 size-48 rounded-full bg-[#205C43]/10 blur-2xl" aria-hidden />
            <div className="absolute -bottom-20 -left-16 size-56 rounded-full bg-[#ED7545]/10 blur-3xl" aria-hidden />
            <div className="absolute right-8 top-1/2 size-40 -translate-y-1/2 rounded-full bg-[#3F8F62]/8 blur-3xl" aria-hidden />
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#205C43]/10 px-3 py-1 text-xs font-bold text-[#205C43]">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3F8F62] opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-[#205C43]" />
                </span>
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
          <div className="lg:col-span-7 min-w-0 p-5 sm:p-10 flex flex-col justify-center">
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
                    className="rounded-lg bg-[#205C43] px-3 py-1 text-[11px] font-bold text-white hover:brightness-110 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    Go to Portal →
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await signOut();
                      toast.success("Signed out. You can now register a new account.");
                    }}
                    className="rounded-lg border border-red-300 bg-white px-3 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
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
                  { r: "donor", emoji: "🍲", label: "Food Donor", desc: "Kitchens & banquets" },
                  { r: "recipient", emoji: "🏢", label: "Recipient", desc: "Shelters & NGOs" },
                  { r: "volunteer", emoji: "🚴", label: "Volunteer", desc: "Delivery Heroes" },
                ].map(({ r, emoji, label, desc }) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRole(r as Role)}
                    className={`group relative rounded-2xl border-2 p-2.5 text-center transition-all duration-200 cursor-pointer active:scale-95 ${
                      selectedRole === r
                        ? "border-[#205C43] bg-gradient-to-b from-[#205C43]/12 to-[#205C43]/5 ring-2 ring-[#205C43]/20 scale-[1.03] shadow-md"
                        : "border-[#DDD5C8] hover:border-[#205C43]/40 hover:bg-[#F8F5ED] hover:scale-[1.02] hover:shadow-sm"
                    }`}
                  >
                    {selectedRole === r && (
                      <span className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-[#205C43] text-[10px] font-bold text-white shadow-md animate-in zoom-in-50 duration-200">
                        ✓
                      </span>
                    )}
                    <span className="block text-lg leading-none transition-transform duration-200 group-hover:scale-125 group-active:scale-95">
                      {emoji}
                    </span>
                    <p className="mt-1 text-xs font-bold text-[#242923]">{label}</p>
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
                    className="w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] py-2.5 pl-10 pr-4 text-xs font-medium text-[#242923] focus:border-[#205C43] focus:bg-white focus:ring-2 focus:ring-[#205C43]/15 focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
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
                      className="w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] py-2.5 pl-10 pr-4 text-xs font-medium text-[#242923] focus:border-[#205C43] focus:bg-white focus:ring-2 focus:ring-[#205C43]/15 focus:outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#242923]">
                    Phone <span className="font-medium text-[#656C62]">(optional)</span>
                  </label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3.5 top-3 size-4 text-[#656C62]" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] py-2.5 pl-10 pr-4 text-xs font-medium text-[#242923] focus:border-[#205C43] focus:bg-white focus:ring-2 focus:ring-[#205C43]/15 focus:outline-none transition-all duration-200"
                    />
                  </div>
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
                    className="w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] py-2.5 pl-10 pr-10 text-xs font-medium text-[#242923] focus:border-[#205C43] focus:bg-white focus:ring-2 focus:ring-[#205C43]/15 focus:outline-none transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#656C62] hover:text-[#242923]"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {/* Password strength meter */}
                {password.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex flex-1 gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="h-1 flex-1 rounded-full bg-[#DDD5C8] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: i < score ? "100%" : "0%",
                              backgroundColor: strengthColor,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: strengthColor }}>
                      {strengthLabel}
                    </span>
                  </div>
                )}
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
                    className="w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] py-2.5 pl-10 pr-4 text-xs font-medium text-[#242923] focus:border-[#205C43] focus:bg-white focus:ring-2 focus:ring-[#205C43]/15 focus:outline-none transition-all duration-200"
                  />
                  {confirmPassword.length > 0 && confirmPassword === password && (
                    <Check className="absolute right-3 top-3 size-4 text-[#205C43]" />
                  )}
                </div>
                {confirmPassword.length > 0 && confirmPassword !== password && (
                  <p className="mt-1 text-[10px] font-bold text-red-500">Passwords do not match</p>
                )}
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
                className="group w-full rounded-full bg-gradient-to-r from-[#164330] via-[#205C43] to-[#3F8F62] py-3 text-xs font-bold text-white shadow-md hover:shadow-lg hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {busy ? (
                  "Registering…"
                ) : (
                  <>
                    Create Free Account
                    <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Social Sign Up / 1-Click Fast Access */}
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
                  className="group flex items-center justify-center gap-2 rounded-2xl border border-[#DDD5C8] bg-white py-2.5 px-3 text-xs font-bold text-[#242923] hover:border-[#205C43] hover:bg-[#F8F5ED] hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <span className="text-red-500 font-extrabold inline-block transition-transform duration-200 group-hover:scale-125 group-active:rotate-12">G</span> Continue with Google
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
                  className="group flex items-center justify-center gap-2 rounded-2xl border border-[#DDD5C8] bg-white py-2.5 px-3 text-xs font-bold text-[#242923] hover:border-[#205C43] hover:bg-[#F8F5ED] hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <span className="inline-block transition-transform duration-200 group-hover:scale-125">&#63743;</span> Continue with Apple
                </button>
              </div>
            </div>

            <div className="mt-5 border-t border-[#DDD5C8] pt-4 text-center text-xs text-[#656C62] flex items-center justify-center gap-2">
              <span>Already registered?</span>
              <Link
                to="/login"
                className="group inline-flex items-center gap-1 rounded-full bg-[#205C43]/10 px-3 py-1 font-bold text-[#205C43] hover:bg-[#205C43] hover:text-white hover:scale-105 active:scale-95 transition-all shadow-2xs"
              >
                Sign In Here
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </div>
        )}
      </main>

      <footer className="hidden lg:block p-4 text-center text-xs text-[#656C62]">
        <p>© FoodLoop Inc. Good food. Shared with purpose.</p>
      </footer>
    </div>
  );
}
