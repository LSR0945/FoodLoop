import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PlusCircle } from "lucide-react";
import { ListingCard } from "@/components/ListingBits";
import { useAuth } from "@/lib/auth";
import { useListings } from "@/lib/db";
import { isOpen, priorityScore } from "@/lib/priority";
import { CATEGORIES } from "@/lib/types";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Food Feed — FoodLoop" },
      { name: "description", content: "Live surplus food listings near you, sorted by urgency on FoodLoop." },
      { property: "og:title", content: "Food Feed — FoodLoop" },
      { property: "og:description", content: "Live surplus food listings near you, sorted by urgency on FoodLoop." },
    ],
  }),
  component: Feed,
});

function Feed() {
  const { user, profile } = useAuth();
  const { data, loading, error } = useListings();
  const [cat, setCat] = useState<string>("All");
  const role = profile?.role;

  const { open, mine } = useMemo(() => {
    const filtered = data.filter((l) => cat === "All" || l.category === cat);
    const open = filtered.filter((l) => isOpen(l)).sort((a, b) => priorityScore(b) - priorityScore(a));
    const mine = filtered.filter(
      (l) =>
        !isOpen(l) &&
        (l.donorId === user?.uid || l.reservedBy === user?.uid || l.volunteerId === user?.uid),
    );
    return { open, mine };
  }, [data, cat, user?.uid]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Namaste, {profile?.orgName || profile?.name || "friend"} 🙏</p>
          <h1 className="text-3xl font-bold">
            {role === "donor" ? "Your community needs you" : role === "volunteer" ? "Pickups near you" : "Food available now"}
          </h1>
        </div>
        {role === "donor" && (
          <Link to="/app/donate" className="inline-flex items-center gap-2 rounded-full bg-saffron px-5 py-2.5 font-semibold text-saffron-foreground shadow-warm">
            <PlusCircle className="size-4" /> Donate food
          </Link>
        )}
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold ${cat === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />)}
        </div>
      ) : open.length === 0 ? (
        <div className="rounded-2xl bg-card p-10 text-center shadow-card">
          <p className="font-display text-xl font-semibold">No open listings right now</p>
          <p className="mt-1 text-sm text-muted-foreground">New donations will appear here instantly.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {open.map((l) => <ListingCard key={l.id} l={l} />)}
        </div>
      )}

      {mine.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Your activity</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((l) => <ListingCard key={l.id} l={l} />)}
          </div>
        </section>
      )}
    </div>
  );
}
