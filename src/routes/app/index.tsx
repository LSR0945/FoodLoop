import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, Filter, PlusCircle, Search, Sparkles, TrendingUp } from "lucide-react";
import { ListingCard } from "@/components/ListingBits";
import { useAuth } from "@/lib/auth";
import { useListings } from "@/lib/db";
import { isOpen, priorityScore, timeLeft, urgencyOf } from "@/lib/priority";
import { CATEGORIES } from "@/lib/types";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Food Feed — BhojanBandhu" },
      { name: "description", content: "Live surplus food listings near you, sorted by urgency." },
    ],
  }),
  component: Feed,
});

function Feed() {
  const { user, profile } = useAuth();
  const { data, loading, error } = useListings();
  const [cat, setCat] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const role = profile?.role;

  const { open, mine, expiringSoon } = useMemo(() => {
    const q = search.toLowerCase().trim();
    const filtered = data.filter((l) => {
      const matchCat = cat === "All" || l.category === cat;
      const matchSearch =
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.locationText.toLowerCase().includes(q) ||
        l.donorName.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    const open = filtered
      .filter((l) => isOpen(l))
      .sort((a, b) => priorityScore(b) - priorityScore(a));

    const mine = filtered.filter(
      (l) =>
        !isOpen(l) &&
        (l.donorId === user?.uid || l.reservedBy === user?.uid || l.volunteerId === user?.uid)
    );

    const expiringSoon = open.filter((l) => urgencyOf(l.pickupDeadline) === "critical").length;

    return { open, mine, expiringSoon };
  }, [data, cat, user?.uid, search]);

  const greeting = profile?.orgName || profile?.name || "friend";

  const roleEmoji = role === "donor" ? "🍲" : role === "ngo" ? "🏢" : "🚴";
  const roleHeading =
    role === "donor"
      ? "Share your surplus food today"
      : role === "volunteer"
      ? "Pickups waiting near you"
      : "Food available for your community";

  return (
    <div className="space-y-5">
      {/* Dashboard Header */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">
              Namaste, <span className="font-semibold text-foreground">{greeting}</span> {roleEmoji} 🙏
            </p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{roleHeading}</h1>
            {expiringSoon > 0 && (
              <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-0.5 text-xs font-semibold text-destructive">
                <Sparkles className="size-3" />
                {expiringSoon} listing{expiringSoon !== 1 ? "s" : ""} expiring within 1 hour!
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {role === "donor" && (
              <Link
                to="/app/donate"
                className="inline-flex items-center gap-2 rounded-full bg-saffron px-5 py-2.5 text-sm font-semibold text-saffron-foreground shadow-warm hover:brightness-105"
              >
                <PlusCircle className="size-4" /> Donate food
              </Link>
            )}
            {role === "ngo" && (
              <Link
                to="/app/report"
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20"
              >
                <TrendingUp className="size-4" /> View Report
              </Link>
            )}
          </div>
        </div>

        {/* Quick Stats for role */}
        {data.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-card p-3 text-center shadow-card">
              <p className="text-xl font-bold text-primary">{open.length}</p>
              <p className="text-[11px] text-muted-foreground">Available now</p>
            </div>
            <div className="rounded-xl bg-card p-3 text-center shadow-card">
              <p className="text-xl font-bold text-saffron">
                {data.filter((l) => l.status === "completed").length}
              </p>
              <p className="text-[11px] text-muted-foreground">Completed</p>
            </div>
            <div className="rounded-xl bg-card p-3 text-center shadow-card">
              <p className="text-xl font-bold text-emerald-600">
                {data.filter((l) => l.status === "completed").reduce((a, l) => a + (l.quantityDistributed || 0), 0)}
              </p>
              <p className="text-[11px] text-muted-foreground">Meals served</p>
            </div>
          </div>
        )}
      </div>

      {/* Search + Filter Bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="feed-search"
              className="field pl-9 pr-4"
              placeholder="Search by food name, location, or donor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilter((v) => !v)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition-colors ${showFilter ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"}`}
          >
            <Filter className="size-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>

        {showFilter && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 pt-1">
            {["All", ...CATEGORIES].map((c) => (
              <button
                key={c}
                id={`cat-filter-${c.replace(/\s+/g, "-").toLowerCase()}`}
                onClick={() => setCat(c)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  cat === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search result info */}
      {search && (
        <p className="text-sm text-muted-foreground">
          {open.length} result{open.length !== 1 ? "s" : ""} for <strong>"{search}"</strong>
          {cat !== "All" && ` in ${cat}`}
          <button onClick={() => { setSearch(""); setCat("All"); }} className="ml-2 text-primary hover:underline">
            Clear
          </button>
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      {/* Volunteer Task Alert */}
      {role === "volunteer" && mine.filter((l) => ["assigned", "reserved"].includes(l.status)).length > 0 && (
        <div className="rounded-2xl border border-blue-400/30 bg-blue-50/50 p-4">
          <p className="text-sm font-bold text-blue-800">
            🚴 You have {mine.filter((l) => ["assigned", "reserved"].includes(l.status)).length} active pickup{mine.filter((l) => ["assigned", "reserved"].includes(l.status)).length !== 1 ? "s" : ""}!
          </p>
          <p className="mt-0.5 text-xs text-blue-700">Check your assigned tasks below — don't miss the pickup window.</p>
        </div>
      )}

      {/* NGO Reserved Food Alert */}
      {role === "ngo" && mine.filter((l) => l.status === "reserved").length > 0 && (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-50/50 p-4">
          <p className="text-sm font-bold text-emerald-800">
            🏢 You have {mine.filter((l) => l.status === "reserved").length} reserved donation{mine.filter((l) => l.status === "reserved").length !== 1 ? "s" : ""} awaiting volunteer assignment.
          </p>
        </div>
      )}

      {/* Open Listings */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : open.length === 0 && !search ? (
        <div className="rounded-2xl bg-card p-10 text-center shadow-card">
          <div className="mx-auto mb-4 grid size-20 place-items-center rounded-full bg-muted text-4xl">🍱</div>
          <p className="font-display text-xl font-semibold">No open listings right now</p>
          <p className="mt-1 text-sm text-muted-foreground">New donations appear here instantly. Check back soon!</p>
          {role === "donor" && (
            <Link
              to="/app/donate"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-saffron px-6 py-2.5 text-sm font-semibold text-saffron-foreground shadow-warm"
            >
              <PlusCircle className="size-4" /> Be the first to donate
            </Link>
          )}
        </div>
      ) : open.length === 0 && search ? (
        <div className="rounded-2xl bg-card p-8 text-center shadow-card">
          <p className="text-lg font-semibold">No results found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different keyword or clear the filter.</p>
          <button onClick={() => { setSearch(""); setCat("All"); }} className="mt-3 text-sm font-semibold text-primary hover:underline">
            Clear search
          </button>
        </div>
      ) : (
        <>
          {/* Priority indicator */}
          {open.some((l) => urgencyOf(l.pickupDeadline) === "critical") && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
              <Sparkles className="size-3.5 animate-pulse" />
              🔴 Critical items shown first — must be collected NOW
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {open.map((l) => <ListingCard key={l.id} l={l} />)}
          </div>
        </>
      )}

      {/* My Activity */}
      {mine.length > 0 && (
        <section className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {role === "donor" ? "Your donations" : role === "ngo" ? "Your reserved food" : "Your assigned pickups"}
            </h2>
            <Link to="/app/profile" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              View all <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mine.slice(0, 6).map((l) => <ListingCard key={l.id} l={l} />)}
          </div>
        </section>
      )}
    </div>
  );
}
