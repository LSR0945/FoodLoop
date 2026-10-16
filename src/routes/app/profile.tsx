import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useListings } from "@/lib/db";
import { getFirebase } from "@/lib/firebase";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — AnnSetu" },
      { name: "description", content: "Your AnnSetu account and impact so far." },
      { property: "og:title", content: "Your profile — AnnSetu" },
      { property: "og:description", content: "Your AnnSetu account and impact so far." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { data } = useListings();

  const stats = useMemo(() => {
    const mine = data.filter((l) => [l.donorId, l.reservedBy, l.volunteerId].includes(user?.uid));
    const done = mine.filter((l) => l.status === "completed");
    return { total: mine.length, done: done.length, served: done.reduce((s, l) => s + (l.quantityDistributed ?? 0), 0) };
  }, [data, user?.uid]);

  async function logout() {
    const { auth } = await getFirebase();
    const { signOut } = await import("firebase/auth");
    await signOut(auth);
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="rounded-2xl bg-hero p-6 text-hero-foreground">
        <p className="text-xs font-bold uppercase tracking-widest text-saffron">{profile?.role}</p>
        <h1 className="mt-1 text-3xl font-bold">{profile?.orgName || profile?.name}</h1>
        <p className="text-sm text-hero-foreground/75">{profile?.email}</p>
        {profile?.area && <p className="text-sm text-hero-foreground/75">{profile.area}</p>}
        {profile?.shifts?.length ? <p className="mt-2 text-sm capitalize">Shifts: {profile.shifts.join(", ")}</p> : null}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[["Donations", stats.total], ["Completed", stats.done], ["Served", stats.served]].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-card p-4 text-center shadow-card">
            <p className="font-display text-3xl font-bold text-primary">{v}</p>
            <p className="text-xs text-muted-foreground">{k}</p>
          </div>
        ))}
      </div>
      <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card py-3 font-semibold">
        <LogOut className="size-4" /> Log out
      </button>
    </div>
  );
}
