import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  HeartHandshake,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User,
  Users,
  UtensilsCrossed,
  Bike,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { updateProfile } from "@/lib/db";
import { getFirebase } from "@/lib/firebase";
import type { Role, Shift } from "@/lib/types";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In or Join — BhojanBandhu" },
      { name: "description", content: "Join as a Food Donor, NGO Partner, or Delivery Volunteer on BhojanBandhu." },
      { property: "og:title", content: "Sign In or Join — BhojanBandhu" },
      { property: "og:description", content: "Join as a Food Donor, NGO Partner, or Delivery Volunteer on BhojanBandhu." },
    ],
  }),
  component: AuthPage,
});

const ROLE_OPTIONS: { id: Role; title: string; subtitle: string; icon: any; color: string }[] = [
  {
    id: "donor",
    title: "Food Donor",
    subtitle: "Restaurants, Caterers, Hostels & Homes (Surplus khana daan karein)",
    icon: UtensilsCrossed,
    color: "text-saffron",
  },
  {
    id: "ngo",
    title: "NGO / Food Bank",
    subtitle: "Charities & Shelter Homes (Bhooke logon tak bhojan pahunchayein)",
    icon: Building2,
    color: "text-emerald-600",
  },
  {
    id: "volunteer",
    title: "Delivery Volunteer",
    subtitle: "Pickup champions (Khana collect aur deliver karne wale)",
    icon: Bike,
    color: "text-amber-600",
  },
];

const SHIFTS: { id: Shift; label: string }[] = [
  { id: "morning", label: "Morning (8 AM - 12 PM)" },
  { id: "afternoon", label: "Afternoon (12 PM - 4 PM)" },
  { id: "evening", label: "Evening (4 PM - 8 PM)" },
  { id: "night", label: "Night (8 PM - 12 AM)" },
];

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<Role>("donor");

  // Form fields
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [shifts, setShifts] = useState<Shift[]>(["evening"]);
  const [busy, setBusy] = useState(false);

  // Forgot password state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [sendingReset, setSendingReset] = useState(false);

  if (!loading && user) {
    navigate({ to: "/app", replace: true });
    return null;
  }

  // Quick 1-Click Demo Logins for Hackathon Judges & Evaluators
  async function handleDemoLogin(demoRole: Role) {
    setBusy(true);
    try {
      const demoUsers = {
        donor: { email: "donor.demo@bhojanbandhu.org", pass: "demo123456", name: "Varis Khan (Green Garden)", org: "Green Garden Restaurant" },
        ngo: { email: "ngo.demo@bhojanbandhu.org", pass: "demo123456", name: "Feeding Hope Trust", org: "Feeding Hope Foundation" },
        volunteer: { email: "volunteer.demo@bhojanbandhu.org", pass: "demo123456", name: "Aman Sharma (Volunteer)", org: "" },
      };

      const target = demoUsers[demoRole];
      const { auth, db } = await getFirebase();
      const { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile: updateAuthProfile } = await import("firebase/auth");
      const { doc, setDoc } = await import("firebase/firestore");

      let currentUid = "";
      try {
        const cred = await signInWithEmailAndPassword(auth, target.email, target.pass);
        currentUid = cred.user.uid;
      } catch {
        const cred = await createUserWithEmailAndPassword(auth, target.email, target.pass);
        currentUid = cred.user.uid;
        await updateAuthProfile(cred.user, { displayName: target.name });
      }

      // Explicitly set the chosen role
      const profileData = {
        uid: currentUid,
        name: target.name,
        email: target.email,
        role: demoRole,
        orgName: target.org,
        area: "GLA Campus, Mathura",
        phone: "+91 98765 43210",
        shifts: ["evening" as Shift],
        createdAt: Date.now(),
      };

      await updateProfile(currentUid, profileData);
      try {
        await setDoc(doc(db, "users", currentUid), profileData, { merge: true });
      } catch {}

      toast.success(`Logged in as Demo ${demoRole.toUpperCase()}!`);
      navigate({ to: "/app" });
    } catch (err) {
      toast.error((err as Error).message || "Could not log in as demo.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    try {
      const { auth, db } = await getFirebase();
      const { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile: updateAuthProfile } = await import("firebase/auth");
      const { doc, setDoc } = await import("firebase/firestore");

      if (mode === "login") {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        // Ensure user's profile has role updated if they chose a specific role
        if (role) {
          await updateProfile(cred.user.uid, { role });
        }
        toast.success("Welcome back to BhojanBandhu!");
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateAuthProfile(cred.user, { displayName: name });

        const newProfile = {
          uid: cred.user.uid,
          name: name.trim() || "User",
          email: email.trim(),
          role, // Explicitly saved as chosen role (donor, ngo, or volunteer)
          ...(orgName ? { orgName: orgName.trim() } : {}),
          ...(phone ? { phone: phone.trim() } : {}),
          ...(area ? { area: area.trim() } : {}),
          ...(role === "volunteer" ? { shifts } : {}),
          createdAt: Date.now(),
        };

        // Save locally and to Firestore
        await updateProfile(cred.user.uid, newProfile);
        try {
          await setDoc(doc(db, "users", cred.user.uid), newProfile);
        } catch {}

        toast.success(`Account created as ${role.toUpperCase()} — Welcome!`);
      }

      navigate({ to: "/app" });
    } catch (err) {
      toast.error((err as Error).message.replace("Firebase: ", ""));
    } finally {
      setBusy(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Please enter your registered email address.");
      return;
    }
    setSendingReset(true);
    try {
      const { auth } = await getFirebase();
      const { sendPasswordResetEmail } = await import("firebase/auth");
      await sendPasswordResetEmail(auth, forgotEmail);
      toast.success("Password reset link sent to your email!");
      setForgotOpen(false);
    } catch (err) {
      toast.error((err as Error).message.replace("Firebase: ", ""));
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto w-full max-w-lg px-4 py-4 flex items-center justify-between border-b border-border/40">
        <Logo showTagline={false} size="sm" />
        <Link to="/" className="text-xs font-semibold text-primary hover:underline">
          ← Back to Home
        </Link>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {mode === "login" ? "Welcome back" : "Join BhojanBandhu"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login"
              ? "Sign in to share surplus food, claim meals, or volunteer."
              : "Register in under a minute to start sharing or collecting food."}
          </p>
        </div>

        {/* 1-Click Fast Demo Logins for Hackathon Evaluators */}
        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-primary flex items-center justify-center gap-1.5">
            <Sparkles className="size-3.5 text-saffron" /> 1-Click Instant Demo Login
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Experience the platform directly as any role without manual sign up:
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => handleDemoLogin("donor")}
              className="rounded-xl border border-border bg-card p-2 text-xs font-bold text-foreground shadow-sm hover:border-saffron hover:bg-saffron/10 transition-colors"
            >
              🍲 Food Donor
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleDemoLogin("ngo")}
              className="rounded-xl border border-border bg-card p-2 text-xs font-bold text-foreground shadow-sm hover:border-emerald-600 hover:bg-emerald-500/10 transition-colors"
            >
              🏢 NGO Partner
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleDemoLogin("volunteer")}
              className="rounded-xl border border-border bg-card p-2 text-xs font-bold text-foreground shadow-sm hover:border-amber-600 hover:bg-amber-500/10 transition-colors"
            >
              🚴 Volunteer
            </button>
          </div>
        </div>

        {/* Toggle Login vs Signup */}
        <div className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-muted p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-full py-2.5 text-sm font-semibold transition-all ${
              mode === "login" ? "bg-card shadow-card text-foreground" : "text-muted-foreground"
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-full py-2.5 text-sm font-semibold transition-all ${
              mode === "signup" ? "bg-card shadow-card text-foreground" : "text-muted-foreground"
            }`}
          >
            Sign up (Create account)
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={submit} className="mt-6 space-y-4">
          {/* Explicit Role Selection (Shown on both signup AND login for clarity) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {mode === "signup" ? "1. Select your role:" : "Active profile role:"}
              </label>
              <span className="text-[11px] font-semibold text-primary capitalize">
                Selected: {role}
              </span>
            </div>

            <div className="grid gap-2">
              {ROLE_OPTIONS.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                        : "border-border bg-card hover:bg-muted/50"
                    }`}
                  >
                    <div
                      className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm text-foreground">{r.title}</p>
                        {isSelected && <CheckCircle2 className="size-4 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Signup Specific Fields */}
          {mode === "signup" && (
            <div className="space-y-3 border-t border-border/60 pt-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">Your Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <input
                    className="field pl-9"
                    placeholder="e.g. Varis Khan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {role === "donor" && (
                <div>
                  <label className="mb-1 block text-xs font-semibold">Establishment / Kitchen Name (Optional)</label>
                  <div className="relative">
                    <UtensilsCrossed className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <input
                      className="field pl-9"
                      placeholder="e.g. Royal Banquet / Green Garden Restaurant"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {role === "ngo" && (
                <div>
                  <label className="mb-1 block text-xs font-semibold">NGO / Trust Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <input
                      className="field pl-9"
                      placeholder="e.g. Helping Hands Foundation"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <input
                      className="field pl-9"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold">City / Area</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <input
                      className="field pl-9"
                      placeholder="e.g. Mathura / GLA"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {role === "volunteer" && (
                <div>
                  <label className="mb-1 block text-xs font-semibold">Available Pickup Shifts</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SHIFTS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() =>
                          setShifts((prev) => (prev.includes(s.id) ? prev.filter((x) => x !== s.id) : [...prev, s.id]))
                        }
                        className={`rounded-xl border p-2 text-left text-xs font-medium transition-colors ${
                          shifts.includes(s.id)
                            ? "border-primary bg-primary/10 text-primary font-bold"
                            : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Email & Password */}
          <div>
            <label className="mb-1 block text-xs font-semibold">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <input
                className="field pl-9"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold">Password</label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <input
                className="field pl-9 pr-10"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-saffron py-3 font-semibold text-saffron-foreground shadow-warm hover:brightness-105 disabled:opacity-60 transition-all text-sm"
          >
            {busy ? "Please wait…" : mode === "login" ? `Sign in as ${role.toUpperCase()}` : `Create ${role.toUpperCase()} Account`}
          </button>
        </form>

        {/* Forgot Password Modal */}
        {forgotOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl border border-border">
              <h3 className="text-lg font-bold">Reset Password</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Enter your account email to receive a password recovery link.
              </p>
              <form onSubmit={handleForgotPassword} className="mt-4 space-y-3">
                <input
                  type="email"
                  className="field"
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotOpen(false)}
                    className="flex-1 rounded-full border border-border py-2 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingReset}
                    className="flex-1 rounded-full bg-primary py-2 text-xs font-semibold text-primary-foreground shadow-sm"
                  >
                    {sendingReset ? "Sending…" : "Send Link"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
