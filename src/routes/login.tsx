import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import {
  createListing,
  registerDonor,
  registerNGO,
  registerVolunteer,
  updateProfile,
} from "@/lib/db";
import { getLocalSession, signInWithEmail, signUpWithEmail } from "@/lib/supabase-auth";
import { getSupabase } from "@/lib/supabase";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log In — FoodLoop" },
      {
        name: "description",
        content: "Sign in to your FoodLoop donor, recipient, or volunteer account.",
      },
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
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const portalForRole = (r: Role) =>
    r === "donor"
      ? "/donor"
      : r === "volunteer"
        ? "/volunteer"
        : r === "admin"
          ? "/admin"
          : "/recipient";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const cred = await signInWithEmail(email.trim(), password);

      if (rememberMe) {
        localStorage.setItem("foodloop_remember_email", email.trim());
      } else {
        localStorage.removeItem("foodloop_remember_email");
      }

      // The account's OWN registered role wins; the picker only fills the gap
      // for accounts that never saved a role (legacy / Supabase-only users).
      let role: Role | null = null;
      try {
        const raw =
          localStorage.getItem("foodloop_profile_" + cred.uid) ||
          localStorage.getItem("annsetu_profile_" + cred.uid);
        const stored = raw ? (JSON.parse(raw) as { role?: Role }) : null;
        if (stored?.role) {
          role = stored.role;
        } else {
          const { data } = await getSupabase()
            .from("profiles")
            .select("role")
            .eq("uid", cred.uid)
            .maybeSingle();
          if (data?.role) role = data.role as Role;
        }
      } catch {
        // Role lookup is best-effort; the picker below is the fallback.
      }
      if (!role) role = selectedRole;
      if (!role) {
        toast.error("Please select how you are signing in.");
        return;
      }

      // Keep the profiles table in sync with the account's role.
      await updateProfile(cred.uid, { role });

      toast.success(`Welcome back to FoodLoop as ${role.toUpperCase()}!`);
      // Wait for AuthProvider to pick up the session before navigating.
      for (let i = 0; i < 20; i++) {
        if (getLocalSession()) break;
        await new Promise((r) => setTimeout(r, 50));
      }
      navigate({ to: portalForRole(role) });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed. Please check credentials.");
    } finally {
      setBusy(false);
    }
  }

  async function handleFastDemo(role: Role) {
    setBusy(true);
    setSelectedRole(role);
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
        // Sign up (or reuse via sign-in) so the demo account is REAL in
        // Supabase with a real uid — never a local-only ghost account.
        const cred = await signUpWithEmail(email, pass);
        uid = cred.uid;
      } catch {
        const cred = await signInWithEmail(email, pass);
        uid = cred.uid;
      }

      // Also seed the role-specific table so Supabase has a row per role.
      const now = Date.now();
      if (role === "donor") {
        await registerDonor({
          uid,
          name: "Campus Dining Services",
          orgName: "Campus Dining Hall",
          donorType: "restaurant",
          email,
          phone: "+91 98765 43210",
          area: "GLA Campus, Mathura",
          defaultPickupAddress: "Kitchen Gate 2, Campus Road",
          createdAt: now,
        });
        // Seed a few sample listings so the dashboard/table isn't empty on first visit.
        try {
          const { data: existing } = await getSupabase()
            .from("listings")
            .select("id")
            .eq("donorId", uid)
            .limit(1);
          if (!existing || existing.length === 0) {
            const samples = [
              {
                title: "Vegetable Pulao & Raita",
                description:
                  "Freshly prepared lunch surplus from campus mess, packed in biodegradable containers.",
                category: "Cooked meals" as const,
                foodType: "veg" as const,
                quantity: 40,
                unit: "plates",
                storage: "hot" as const,
                photo: "/images/food/dal_khichdi_roti.jpg",
                deadlineH: 3,
                locationText: "Kitchen Gate 2, GLA Campus",
                instructions: "Ask for Chef Ramesh at service dock",
              },
              {
                title: "Assorted Bread & Buns",
                description: "End-of-day bakery surplus — loaves, burger buns, dinner rolls.",
                category: "Bakery" as const,
                foodType: "veg" as const,
                quantity: 25,
                unit: "pieces",
                storage: "room" as const,
                photo: "/images/food/wheat_bread_buns.jpg",
                deadlineH: 5,
                locationText: "Campus Bakery, Block C",
                instructions: "Collect from bakery counter",
              },
              {
                title: "Fresh Fruit Crates",
                description: "Slightly overripe bananas and apples — perfect for shelters.",
                category: "Fruits & vegetables" as const,
                foodType: "veg" as const,
                quantity: 15,
                unit: "kg",
                storage: "room" as const,
                photo: "/images/food/fruit_crates.jpg",
                deadlineH: 6,
                locationText: "Central Store, GLA Campus",
                instructions: "Gate pass required at security",
              },
            ];
            for (const s of samples) {
              const { deadlineH, locationText, instructions, ...rest } = s;
              await createListing(
                {
                  donorId: uid,
                  donorName: "Campus Dining Services",
                  donorPhone: "+91 98765 43210",
                  preparedAt: now - 3600_000,
                  pickupDeadline: now + deadlineH * 3600_000,
                  locationText,
                  pickupInstructions: instructions,
                  allergens: [],
                  checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
                  ...rest,
                },
                "Campus Dining Services",
              );
            }
          }
        } catch {
          /* seeding is best-effort */
        }
      } else if (role === "recipient" || role === "ngo") {
        await registerNGO({
          uid,
          name: "Asha Children Shelter",
          orgName: "Asha Hope Foundation",
          contactPerson: "Rajesh Kumar",
          email,
          phone: "+91 98765 43210",
          area: "Mathura City",
          dailyCapacity: 250,
          createdAt: now,
        });
      } else if (role === "volunteer") {
        await registerVolunteer({
          uid,
          name: "Aman Sharma",
          email,
          phone: "+91 98765 43210",
          area: "Mathura Region",
          shifts: ["morning", "evening"],
          vehicleType: "bike",
          createdAt: now,
        });
      }

      await updateProfile(uid, { role });
      toast.success(`Logged in as demo ${role.toUpperCase()}!`);
      const targetPortal = portalForRole(role);
      // Wait for AuthProvider to pick up the session before navigating.
      for (let i = 0; i < 20; i++) {
        if (getLocalSession()) break;
        await new Promise((r) => setTimeout(r, 50));
      }
      navigate({ to: targetPortal });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not log in as demo.");
    } finally {
      setBusy(false);
    }
  }

  // Prefill remembered email once on mount.
  const [emailTouched, setEmailTouched] = useState(false);
  useEffect(() => {
    if (emailTouched || email) return;
    const remembered = localStorage.getItem("foodloop_remember_email");
    if (remembered) setEmail(remembered);
    setEmailTouched(true);
  }, [emailTouched, email]);

  return (
    <div className="min-h-screen text-[#242923] flex flex-col justify-between relative overflow-x-hidden">
      {/* Dark premium layered background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#081F15] via-[#123A2A] to-[#081F15]" />
        <img
          src="/images/food/dal_khichdi_roti.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-[0.07]"
        />
        <div className="absolute -top-40 -right-40 size-[26rem] rounded-full bg-[#3F8F62]/25 blur-3xl" />
        <div className="absolute top-1/3 -left-40 size-[30rem] rounded-full bg-[#ED7545]/20 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 size-[22rem] rounded-full bg-[#205C43]/40 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(#F8F5ED 0.7px, transparent 0.7px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(63,143,98,0.22),transparent_60%)]" />
      </div>

      {/* ===== Native app bar (mobile) ===== */}
      <header className="lg:hidden sticky top-0 z-30 border-b border-white/10 bg-[#081F15]/85 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            to="/welcome"
            aria-label="Go back"
            className="grid size-9 place-items-center rounded-full border border-white/15 bg-white/10 text-[#F8F5ED] transition-transform active:scale-90"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <Logo light size="sm" showTagline={false} />
          <Link
            to="/signup"
            className="rounded-full bg-gradient-to-r from-[#ED7545] to-[#F59E0B] px-3.5 py-1.5 text-[11px] font-extrabold text-white shadow-md shadow-[#ED7545]/20 transition-transform active:scale-95"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* ===== Desktop header (web) ===== */}
      <header className="hidden lg:block border-b border-white/10 bg-[#081F15]/70 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Logo light size="sm" showTagline={false} />
          <div className="flex items-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ED7545] to-[#F59E0B] px-4 py-2 text-xs font-extrabold text-white shadow-md shadow-[#ED7545]/20 transition-all hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-95"
            >
              Sign Up
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ===== Mobile hero (native app style) ===== */}
      <section className="lg:hidden relative overflow-hidden bg-gradient-to-b from-[#081F15] via-[#123A2A] to-[#0E3323] px-5 pb-14 pt-5 text-white">
        <img
          src="/images/food/wheat_bread_buns.jpg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-14 -top-8 h-52 w-52 rotate-6 rounded-3xl object-cover opacity-[0.14]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-20 size-56 rounded-full bg-[#3F8F62]/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 -left-20 size-52 rounded-full bg-[#ED7545]/15 blur-3xl"
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#3F8F62]/40 bg-[#3F8F62]/15 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.16em] text-[#9FE3BC] backdrop-blur-md">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#7FE0A8] opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[#7FE0A8]" />
            </span>
            ZERO HUNGER MOVEMENT
          </span>
          <h1 className="mt-4 font-display text-[2.15rem] font-extrabold leading-tight">
            Welcome <span className="text-[#F5B942]">back</span>
          </h1>
          <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-[#F8F5ED]/70">
            Sign in to manage donations, track live pickups and keep good food moving.
          </p>
          <div className="mt-5 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.06] py-3 backdrop-blur-md">
            {[
              { value: "14,250+", label: "Meals shared" },
              { value: "48", label: "Shelter homes" },
              { value: "35 min", label: "Rapid pickup" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-base font-extrabold text-white">{s.value}</p>
                <p className="mt-0.5 text-[8.5px] font-bold uppercase tracking-wider text-[#F8F5ED]/50">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-5xl px-3 sm:px-4 lg:py-10 flex-1 lg:flex lg:items-center lg:justify-center">
        <div className="relative z-10 -mt-10 lg:mt-0 w-full overflow-hidden rounded-[2rem] lg:rounded-3xl border border-[#DDD5C8] bg-white shadow-2xl ring-1 ring-white/20 grid lg:grid-cols-12">
          {/* Left Column: Hunger Relief & Community Impact Imagery */}
          <div className="hidden lg:flex lg:col-span-5 min-w-0 relative bg-[#164330] p-6 sm:p-8 text-white flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img
                src="/images/food/dal_khichdi_roti.jpg"
                alt="Community food donation & hunger relief"
                className="h-full w-full object-cover opacity-40 filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B281B] via-[#164330]/85 to-[#164330]/40" />
            </div>

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3 py-1.5 text-[10px] font-extrabold tracking-[0.16em] text-[#F8F5ED] border border-white/20">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#7FE0A8] opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-[#7FE0A8]" />
                </span>
                ZERO HUNGER MOVEMENT
              </span>
              <h2 className="mt-4 font-display text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Every meal saved is a life nourished.
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#F8F5ED]/85 leading-relaxed">
                Connect directly with surplus donor kitchens, verified recipient shelters, and
                courier volunteers to make sure good food never goes to waste.
              </p>
            </div>

            {/* Impact Highlights Card */}
            <div className="relative z-10 mt-6 rounded-2xl bg-white/[0.08] backdrop-blur-md p-4 border border-white/15 space-y-3 text-xs">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#9FE3BC]">
                Live impact
              </p>
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/10 text-base">
                  🍲
                </span>
                <span className="font-semibold text-white">14,250+ meals shared locally</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/10 text-base">
                  🏢
                </span>
                <span className="font-semibold text-white">48 verified shelter homes</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/10 text-base">
                  ⏱️
                </span>
                <span className="font-semibold text-white">Avg. 35-min rapid pickup</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sign In Form */}
          <div className="lg:col-span-7 min-w-0 p-5 sm:p-10 flex flex-col justify-center">
            <div className="hidden text-left lg:block">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#242923]">
                Welcome Back
              </h1>
              <p className="mt-1 text-xs text-[#656C62]">
                Sign in to access your surplus food dashboard or active collections
              </p>
            </div>

            {/* Active Session Alert */}
            {user && (
              <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900">
                <p className="font-semibold">
                  Signed in as: <strong>{user.email || profile?.name || "Active Member"}</strong> (
                  {profile?.role || "member"})
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to:
                          profile?.role === "donor"
                            ? "/donor"
                            : profile?.role === "volunteer"
                              ? "/volunteer"
                              : profile?.role === "admin"
                                ? "/admin"
                                : "/recipient",
                      })
                    }
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

            {/* Role Selection + Login Form */}
            <form onSubmit={handleLogin} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#242923]">
                  I am signing in as <span className="text-[#ED7545]">*</span>
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2.5">
                  {[
                    { id: "donor" as Role, icon: "🍲", label: "Donor", sub: "Share surplus" },
                    { id: "recipient" as Role, icon: "🏢", label: "Shelter NGO", sub: "Rescue meals" },
                    { id: "volunteer" as Role, icon: "🚴", label: "Volunteer", sub: "Deliver food" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      disabled={busy}
                      onClick={() => setSelectedRole(r.id)}
                      className={`group relative rounded-2xl border-2 px-2 py-3 text-center transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50 ${
                        selectedRole === r.id
                          ? "border-[#205C43] bg-gradient-to-b from-[#205C43]/12 to-[#205C43]/[0.03] ring-2 ring-[#205C43]/20 scale-[1.02] shadow-md"
                          : "border-[#E7E1D5] bg-[#FBFAF7] hover:border-[#205C43]/50 hover:scale-[1.01] hover:shadow-sm"
                      }`}
                    >
                      {selectedRole === r.id && (
                        <span className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-[#205C43] text-[10px] font-bold text-white shadow-md animate-in zoom-in-50 duration-200">
                          ✓
                        </span>
                      )}
                      <span className="block text-xl leading-none transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
                        {r.icon}
                      </span>
                      <span
                        className={`mt-1.5 block text-[11px] font-extrabold leading-tight ${selectedRole === r.id ? "text-[#205C43]" : "text-[#40473F]"}`}
                      >
                        {r.label}
                      </span>
                      <span className="mt-0.5 block text-[9px] font-semibold text-[#656C62]/75">
                        {r.sub}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-[10px] text-[#656C62]/80">
                  <ShieldCheck className="size-3 shrink-0 text-[#3F8F62]" />
                  Your selected role decides which portal dashboard opens after sign in.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#242923]">Email Address</label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#656C62]" />
                  <input
                    type="email"
                    required
                    placeholder="name@organization.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] pl-10 pr-4 text-sm font-medium text-[#242923] transition-all duration-200 focus:border-[#205C43] focus:bg-white focus:ring-2 focus:ring-[#205C43]/15 focus:outline-none"
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
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#656C62]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] pl-10 pr-11 text-sm font-medium text-[#242923] transition-all duration-200 focus:border-[#205C43] focus:bg-white focus:ring-2 focus:ring-[#205C43]/15 focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-[#656C62] transition-colors hover:bg-[#205C43]/10 hover:text-[#242923]"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#E7E1D5] bg-[#FBFAF7] px-3.5 py-2.5 transition-colors hover:border-[#205C43]/30">
                <span className="text-[11px] font-semibold text-[#656C62]">
                  Remember my email on this device
                </span>
                <span className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-[#DDD5C8] transition-colors duration-200 has-[:checked]:bg-[#205C43] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#205C43]/25">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="pointer-events-none absolute left-0.5 size-4 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-4" />
                </span>
              </label>

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="group relative flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-[#164330] via-[#205C43] to-[#3F8F62] py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  {busy ? (
                    "Signing In…"
                  ) : (
                    <>
                      {selectedRole
                        ? `Sign In as ${selectedRole === "recipient" ? "Shelter NGO" : selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
                        : "Sign In"}
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
                <p className="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-[#656C62]/75">
                  <ShieldCheck className="size-3 text-[#3F8F62]" />
                  Secure sign-in · Verified FoodLoop accounts only
                </p>
              </div>
            </form>

            {/* Divider */}
            <div className="mt-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#DDD5C8]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#656C62]/80">
                or try instantly — no password
              </span>
              <div className="h-px flex-1 bg-[#DDD5C8]" />
            </div>

            {/* Quick Evaluator 1-Tap Demo Login (below sign-in) */}
            <div className="mt-4 rounded-2xl border border-[#205C43]/15 bg-gradient-to-br from-[#205C43]/[0.07] to-[#ED7545]/[0.05] p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-wider text-[#205C43]">
                  <Sparkles className="size-3.5 text-[#ED7545]" /> 1-Tap Demo Access
                </p>
                <span className="rounded-full border border-[#205C43]/20 bg-white/70 px-2 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wide text-[#205C43]">
                  Demo mode
                </span>
              </div>
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {[
                  { role: "donor" as Role, icon: "🍲", label: "Donor" },
                  { role: "recipient" as Role, icon: "🏢", label: "NGO" },
                  { role: "volunteer" as Role, icon: "🚴", label: "Volunteer" },
                ].map((d) => (
                  <button
                    key={d.role}
                    type="button"
                    disabled={busy}
                    onClick={() => handleFastDemo(d.role)}
                    className="group flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-[#DDD5C8] bg-white py-2.5 text-[11px] font-extrabold text-[#242923] shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#205C43] hover:shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <span className="text-sm transition-transform duration-200 group-hover:scale-110">
                      {d.icon}
                    </span>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-[#DDD5C8] pt-4 text-center text-xs text-[#656C62] space-y-2">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span>New to FoodLoop?</span>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1 rounded-full bg-[#205C43] px-4 py-1.5 font-bold text-white shadow-sm transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-95"
                >
                  Create Account <ArrowRight className="size-3.5" />
                </Link>
              </div>
              <p className="text-[10px] text-[#656C62]/80">
                Want a dedicated donor/NGO/volunteer form?{" "}
                <Link to="/auth" className="font-bold text-[#205C43] hover:underline">
                  Open detailed registration →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="hidden lg:block p-4 pb-6 text-center text-xs text-[#F8F5ED]/60">
        <p>© FoodLoop. Good food. Shared with purpose.</p>
      </footer>
    </div>
  );
}
