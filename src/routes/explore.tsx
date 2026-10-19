import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Clock,
  Filter,
  Grid,
  HeartHandshake,
  LayoutList,
  MapPin,
  Package,
  PlusCircle,
  Search,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { ListingCard, StatusBadge, UrgencyBadge } from "@/components/ListingBits";
import { useListings } from "@/lib/db";
import { isOpen, priorityScore } from "@/lib/priority";
import { CATEGORIES } from "@/lib/types";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore Surplus Food — FoodLoop" },
      { name: "description", content: "Discover and reserve surplus food donations in your neighborhood before the deadline." },
      { property: "og:title", content: "Explore Surplus Food — FoodLoop" },
      { property: "og:description", content: "Discover and reserve surplus food donations in your neighborhood before the deadline." },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const { data: listings, loading, error } = useListings();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFoodType, setSelectedFoodType] = useState<"all" | "veg" | "non-veg" | "vegan">("all");
  const [sortBy, setSortBy] = useState<"urgency" | "newest" | "portions">("urgency");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filtering & Sorting
  const filteredListings = useMemo(() => {
    let result = listings.filter((l) => isOpen(l));

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (l) =>
          (l.title ?? "").toLowerCase().includes(q) ||
          (l.locationText ?? "").toLowerCase().includes(q) ||
          l.donorName?.toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter((l) => l.category === selectedCategory);
    }

    if (selectedFoodType !== "all") {
      result = result.filter((l) => l.foodType === selectedFoodType);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "urgency") {
        return priorityScore(b) - priorityScore(a);
      }
      if (sortBy === "newest") {
        return b.createdAt - a.createdAt;
      }
      if (sortBy === "portions") {
        return b.quantity - a.quantity;
      }
      return 0;
    });

    return result;
  }, [listings, query, selectedCategory, selectedFoodType, sortBy]);

  const activeFilterCount = (selectedCategory !== "All" ? 1 : 0) + (selectedFoodType !== "all" ? 1 : 0) + (query ? 1 : 0);

  function resetFilters() {
    setQuery("");
    setSelectedCategory("All");
    setSelectedFoodType("all");
    setSortBy("urgency");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Global Public Navbar */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-semibold text-foreground/80 md:flex">
            <Link to="/explore" className="text-primary font-bold">
              Explore Food
            </Link>
            <Link to="/how-it-works" className="hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link to="/community" className="hover:text-primary transition-colors">
              Community
            </Link>
            <Link to="/impact" className="hover:text-primary transition-colors">
              Impact
            </Link>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link
              to="/login"
              className="rounded-full px-4 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:brightness-105 transition-all"
            >
              <HeartHandshake className="size-3.5" /> Join FoodLoop
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Title & Introduction */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <Sparkles className="size-3.5 text-[#ED7545]" /> Live Surplus Food Feed
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Explore Available Food
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Rescuing surplus meals from restaurants, hostels, banquets, and households before they go to waste. Free for verified recipients & shelters.
          </p>
        </div>

        {/* Search Bar & Primary Controls */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
            <input
              type="text"
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm font-medium placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Search by meal name, bakery, or locality (e.g. Biryani, GLA Campus, Mathura)…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="urgency">⚡ Sort: Expiring Soonest</option>
              <option value="newest">🕒 Sort: Most Recent</option>
              <option value="portions">📦 Sort: Largest Portion</option>
            </select>

            {/* Grid / List View Toggle */}
            <div className="flex rounded-xl border border-border bg-muted/40 p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-lg p-1.5 transition-colors ${
                  viewMode === "grid" ? "bg-card shadow-xs text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
                title="Grid view"
              >
                <Grid className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`rounded-lg p-1.5 transition-colors ${
                  viewMode === "list" ? "bg-card shadow-xs text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
                title="List view"
              >
                <LayoutList className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          {/* Categories */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
            {["All", ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Diet Preferences & Reset */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-border bg-card p-1 text-[11px] font-semibold">
              {(
                [
                  ["all", "All Diet"],
                  ["veg", "🟢 Veg"],
                  ["non-veg", "🔴 Non-Veg"],
                  ["vegan", "🌱 Vegan"],
                ] as const
              ).map(([t, label]) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedFoodType(t)}
                  className={`rounded-full px-2.5 py-0.5 transition-colors ${
                    selectedFoodType === t ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 rounded-full border border-[#ED7545]/30 bg-[#ED7545]/10 px-2.5 py-1 text-xs font-bold text-[#ED7545] hover:bg-[#ED7545] hover:text-white transition-all shadow-2xs"
              >
                <X className="size-3" /> Clear ({activeFilterCount})
              </button>
            )}
          </div>
        </div>

        {/* Content Listing State */}
        <div className="mt-6">
          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center shadow-card">
              <Utensils className="mx-auto size-12 text-muted-foreground/50" />
              <h3 className="mt-3 text-lg font-bold text-foreground">No available food listings match your filters</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                Try widening your search terms, changing the category, or check back soon as donations are listed around the clock.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm"
                >
                  Reset all filters
                </button>
                <Link
                  to="/auth"
                  className="rounded-full bg-[#ED7545] px-4 py-2 text-xs font-semibold text-white shadow-warm"
                >
                  Donate surplus food
                </Link>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredListings.map((l) => (
                <ListingCard key={l.id} l={l} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredListings.map((l) => (
                <Link
                  key={l.id}
                  to="/app/listing/$id"
                  params={{ id: l.id }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-card hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center gap-4">
                    {l.photo ? (
                      <img src={l.photo} alt={l.title} className="size-20 rounded-xl object-cover" />
                    ) : (
                      <div className="grid size-20 place-items-center rounded-xl bg-muted text-muted-foreground">
                        <Package className="size-8" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                          {l.category}
                        </span>
                        <UrgencyBadge deadline={l.pickupDeadline} />
                        <span className="text-xs font-medium text-muted-foreground">
                          {l.foodType === "non-veg" ? "🔴 Non-veg" : l.foodType === "vegan" ? "🌱 Vegan" : "🟢 Veg"}
                        </span>
                      </div>
                      <h3 className="mt-1 font-bold text-base text-foreground">{l.title}</h3>
                      <p className="text-xs font-semibold text-primary">
                        {l.quantity} {l.unit} • {l.locationText}
                      </p>
                      <p className="text-[11px] text-muted-foreground">Donated by {l.donorName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs">
                      View & Claim →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Guest Exploration Banner */}
      <section className="mt-16 border-t border-border/80 bg-muted/40 py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold">Have surplus food to share?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Donors list surplus in under 60 seconds. Our verified network of NGOs and volunteers collects it quickly and safely.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              to="/auth"
              className="rounded-full bg-[#ED7545] px-6 py-2.5 text-sm font-semibold text-white shadow-warm hover:brightness-105"
            >
              List Surplus Food
            </Link>
            <Link
              to="/how-it-works"
              className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Learn How It Works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
