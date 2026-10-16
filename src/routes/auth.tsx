import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { getFirebase } from "@/lib/firebase";
import type { Role, Shift } from "@/lib/types";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in or join — AnnSetu" },
      { name: "description", content: "Sign in as a donor, NGO or volunteer to share and collect surplus food." },
      { property: "og:title", content: "Log in or join — AnnSetu" },
      { property: "og:description", content: "Sign in as a donor, NGO or volunteer to share and collect surplus food." },
    ],
  }),
  component: AuthPage,
});

const ROLES: { id: Role; label: string; hint: string }[] = [
  { id: "donor", label: "Donor", hint: "Restaurant, hostel, event, household" },
  { id: "ngo", label: "NGO / Community group", hint: "Registered organisation that distributes food" },
  { id: "volunteer", label: "Volunteer", hint: "Collects and delivers pickups" },
];

const SHIFTS: Shift[] = ["morning", "afternoon", "evening", "night"];

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<Role>("donor");
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [busy, setBusy] = useState(false);

  if (!loading && user) {
    navigate({ to: "/app", replace: true });
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { auth, db } = await getFirebase();
      const { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        const { doc, setDoc } = await import("firebase/firestore");
        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          name,
          email,
          role,
          ...(orgName ? { orgName } : {}),
          ...(phone ? { phone } : {}),
          ...(area ? { area } : {}),
          ...(role === "volunteer" ? { shifts } : {}),
          createdAt: Date.now(),
        });
      }
      toast.success(mode === "login" ? "Welcome back!" : "Account created — welcome to AnnSetu!");
      navigate({ to: "/app" });
    } catch (err) {
      toast.error((err as Error).message.replace("Firebase: ", ""));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto w-full max-w-md px-4 py-4">
        <Logo />
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-10">
        <h1 className="text-3xl font-bold">{mode === "login" ? "Welcome back" : "Join AnnSetu"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login" ? "Log in to continue sharing food." : "Create your account — it takes a minute."}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-full bg-muted p-1">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full py-2 text-sm font-semibold ${mode === m ? "bg-card shadow-card" : "text-muted-foreground"}`}
            >
              {m === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <>
              <div>
                <label className="mb-2 block text-sm font-semibold">I am a…</label>
                <div className="grid gap-2">
                  {ROLES.map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`rounded-xl border p-3 text-left ${role === r.id ? "border-primary bg-primary/5" : "border-border bg-card"}`}
                    >
                      <p className="font-semibold">{r.label}</p>
                      <p className="text-xs text-muted-foreground">{r.hint}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold">Your name</label>
                <input className="field" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              {role === "ngo" && (
                <div>
                  <label className="mb-1 block text-sm font-semibold">Organisation name</label>
                  <input className="field" value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-semibold">Phone</label>
                <input className="field" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold">Area / locality</label>
                <input className="field" placeholder="e.g. Andheri West" value={area} onChange={(e) => setArea(e.target.value)} />
              </div>
              {role === "volunteer" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold">Available shifts</label>
                  <div className="flex flex-wrap gap-2">
                    {SHIFTS.map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setShifts((v) => (v.includes(s) ? v.filter((x) => x !== s) : [...v, s]))}
                        className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize ${shifts.includes(s) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          <div>
            <label className="mb-1 block text-sm font-semibold">Email</label>
            <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Password</label>
            <input className="field" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button
            disabled={busy}
            className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground shadow-card disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="font-semibold text-primary">← Back to home</Link>
        </p>
      </main>
    </div>
  );
}
