import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  Leaf,
  MapPin,
  Package,
  Printer,
  Share2,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAuth } from "@/lib/auth";
import { useListings } from "@/lib/db";
import { CATEGORIES } from "@/lib/types";

export const Route = createFileRoute("/app/report")({
  head: () => ({
    meta: [
      { title: "Donation Report — BhojanBandhu" },
      {
        name: "description",
        content: "Complete donation statistics, completed food distributions, and community impact report.",
      },
    ],
  }),
  component: ReportPage,
});

const CATEGORY_COLORS: Record<string, string> = {
  "Cooked meals": "#f59e0b",
  Bakery: "#f97316",
  "Fruits & vegetables": "#22c55e",
  "Packaged food": "#3b82f6",
  Dairy: "#8b5cf6",
  Beverages: "#06b6d4",
};

const PIE_COLORS = ["#f59e0b", "#22c55e", "#3b82f6", "#f97316", "#8b5cf6", "#06b6d4"];

const fmt = (ms: number) =>
  new Date(ms).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-primary",
  bg = "bg-primary/10",
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  bg?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className={`mb-3 grid size-10 place-items-center rounded-xl ${bg} ${color}`}>
        <Icon className="size-5" />
      </div>
      <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function ReportPage() {
  const { user, profile } = useAuth();
  const { data: allListings, loading } = useListings();
  const [period, setPeriod] = useState<"all" | "7d" | "30d">("all");

  const now = Date.now();
  const periodMs = period === "7d" ? 7 * 86400_000 : period === "30d" ? 30 * 86400_000 : Infinity;

  const filtered = useMemo(() => {
    return allListings.filter((l) => {
      if (period !== "all" && l.createdAt < now - periodMs) return false;
      return true;
    });
  }, [allListings, period]);

  // Global stats
  const stats = useMemo(() => {
    const completed = filtered.filter((l) => l.status === "completed");
    const active = filtered.filter((l) => ["available", "reserved", "assigned", "picked_up"].includes(l.status));
    const cancelled = filtered.filter((l) => l.status === "cancelled");
    const totalMeals = completed.reduce((a, l) => a + (l.quantityDistributed || l.quantity || 0), 0);
    const wasteSavedKg = Math.round(totalMeals * 0.45);
    const uniqueDonors = new Set(completed.map((l) => l.donorId)).size;
    const uniqueNgos = new Set(completed.map((l) => l.reservedBy).filter(Boolean)).size;
    return { total: filtered.length, completed: completed.length, active: active.length, cancelled: cancelled.length, totalMeals, wasteSavedKg, uniqueDonors, uniqueNgos };
  }, [filtered]);

  // Category breakdown for Pie chart
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.filter((l) => l.status === "completed").forEach((l) => {
      map[l.category] = (map[l.category] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  // Status distribution for Bar chart
  const statusData = [
    { name: "Available", count: filtered.filter((l) => l.status === "available").length, fill: "#22c55e" },
    { name: "Reserved", count: filtered.filter((l) => l.status === "reserved").length, fill: "#3b82f6" },
    { name: "Assigned", count: filtered.filter((l) => l.status === "assigned").length, fill: "#8b5cf6" },
    { name: "Picked up", count: filtered.filter((l) => l.status === "picked_up").length, fill: "#f97316" },
    { name: "Completed", count: filtered.filter((l) => l.status === "completed").length, fill: "#f59e0b" },
    { name: "Cancelled", count: filtered.filter((l) => l.status === "cancelled").length, fill: "#ef4444" },
  ].filter((s) => s.count > 0);

  // Food type breakdown
  const foodTypeData = useMemo(() => {
    const map: Record<string, number> = { veg: 0, "non-veg": 0, vegan: 0 };
    filtered.forEach((l) => { if (l.foodType && map[l.foodType] !== undefined) map[l.foodType] = (map[l.foodType] ?? 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [filtered]);

  // Completed donations list
  const completedList = useMemo(() =>
    filtered.filter((l) => l.status === "completed").sort((a, b) => (b.completedAt || b.createdAt) - (a.completedAt || a.createdAt)),
    [filtered]
  );

  function handlePrint() { window.print(); }

  function handleShareSummary() {
    const text = `🌟 BhojanBandhu Community Impact Report\n\n🍱 Total Donations: ${stats.total}\n✅ Successfully Completed: ${stats.completed}\n🍽️ Meals Distributed: ${stats.totalMeals.toLocaleString("en-IN")}\n🌱 Food Waste Prevented: ${stats.wasteSavedKg} kg\n👨‍🍳 Active Donors: ${stats.uniqueDonors}\n🏢 NGO Partners: ${stats.uniqueNgos}\n\nJoin us at BhojanBandhu — Koi Bhookha Na Soye! 🙏`;
    navigator.clipboard.writeText(text);
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />)}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="size-7 text-primary" />
            <h1 className="text-3xl font-bold">Donation Report</h1>
          </div>
          <p className="mt-1 text-muted-foreground">
            Complete food donation lifecycle — from listing to distribution
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handlePrint}
            id="report-print-btn"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold shadow-card hover:bg-muted"
          >
            <Printer className="size-4" /> Print / PDF
          </button>
          <button
            onClick={handleShareSummary}
            id="report-share-btn"
            className="inline-flex items-center gap-2 rounded-full bg-saffron px-4 py-2 text-sm font-semibold text-saffron-foreground shadow-warm hover:brightness-105"
          >
            <Share2 className="size-4" /> Copy Summary
          </button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex gap-1.5 rounded-full bg-muted p-1 max-w-xs">
        {(["all", "30d", "7d"] as const).map((p) => (
          <button
            key={p}
            id={`period-${p}`}
            onClick={() => setPeriod(p)}
            className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition-all ${period === p ? "bg-card text-foreground shadow-card" : "text-muted-foreground"}`}
          >
            {p === "all" ? "All Time" : p === "30d" ? "Last 30 Days" : "Last 7 Days"}
          </button>
        ))}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Package} label="Total Donations" value={stats.total} sub="Listings created" color="text-primary" bg="bg-primary/10" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} sub={`${stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}% success rate`} color="text-emerald-600" bg="bg-emerald-100" />
        <StatCard icon={UtensilsCrossed} label="Meals Served" value={stats.totalMeals.toLocaleString("en-IN")} sub="People fed" color="text-saffron" bg="bg-saffron/15" />
        <StatCard icon={Leaf} label="Waste Saved" value={`${stats.wasteSavedKg} kg`} sub="~450g × meals served" color="text-green-700" bg="bg-green-100" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Users} label="Active Donors" value={stats.uniqueDonors} sub="Unique contributors" color="text-amber-700" bg="bg-amber-100" />
        <StatCard icon={Award} label="NGO Partners" value={stats.uniqueNgos} sub="Community recipients" color="text-blue-700" bg="bg-blue-100" />
        <StatCard icon={TrendingUp} label="In Progress" value={stats.active} sub="Awaiting handover" color="text-violet-700" bg="bg-violet-100" />
        <StatCard icon={Clock} label="Cancelled" value={stats.cancelled} sub="Withdrawn or expired" color="text-rose-700" bg="bg-rose-100" />
      </div>

      {/* Charts Row */}
      {allListings.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Status Bar Chart */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-4 font-bold">Donation Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid var(--color-border)", fontSize: "12px" }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Pie Chart */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-4 font-bold">Category Distribution (Completed)</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid var(--color-border)", fontSize: "12px" }}
                  />
                  <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-[220px] place-items-center text-muted-foreground">
                <p className="text-sm">No completed donations yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Food Type Breakdown */}
      {allListings.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-4 font-bold">Food Type Distribution</h3>
          <div className="grid grid-cols-3 gap-4">
            {foodTypeData.map((ft) => {
              const pct = stats.total ? Math.round((ft.value / stats.total) * 100) : 0;
              const color = ft.name === "Veg" ? "bg-emerald-500" : ft.name === "Non-veg" ? "bg-red-500" : "bg-lime-500";
              return (
                <div key={ft.name} className="text-center">
                  <div className="mx-auto mb-2 h-2 w-full rounded-full bg-muted">
                    <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xl font-bold">{pct}%</p>
                  <p className="text-xs text-muted-foreground">{ft.name} ({ft.value})</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Donations Table */}
      <div className="rounded-2xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="font-bold text-lg">Completed Donations ({completedList.length})</h3>
          <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-700">
            {stats.totalMeals} total meals
          </span>
        </div>

        {completedList.length === 0 ? (
          <div className="p-10 text-center">
            <UtensilsCrossed className="mx-auto size-12 text-muted-foreground/40" />
            <p className="mt-3 text-muted-foreground">No completed donations in this period.</p>
            <Link to="/app" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
              Browse available food →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {completedList.map((l) => (
              <Link
                key={l.id}
                to="/app/listing/$id"
                params={{ id: l.id }}
                className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors"
              >
                {/* Thumbnail */}
                {l.photo ? (
                  <img src={l.photo} alt={l.title} className="size-14 shrink-0 rounded-xl object-cover" />
                ) : (
                  <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                    <Package className="size-6" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                      style={{ backgroundColor: CATEGORY_COLORS[l.category] || "#6b7280" }}
                    >
                      {l.category}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">{l.foodType}</span>
                  </div>
                  <h4 className="mt-1 truncate font-semibold">{l.title}</h4>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <UtensilsCrossed className="size-3 text-saffron" />
                      {l.quantityDistributed || l.quantity} {l.unit} distributed
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-primary" />
                      {l.locationText}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {l.completedAt ? fmt(l.completedAt) : fmt(l.createdAt)}
                    </span>
                  </div>
                  {l.completionNote && (
                    <p className="mt-1 text-xs text-emerald-700 font-medium">
                      ✅ {l.completionNote}
                    </p>
                  )}
                </div>

                {/* Donor */}
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-xs font-semibold text-foreground">{l.donorName}</p>
                  {l.reservedByName && (
                    <p className="text-[11px] text-muted-foreground">→ {l.reservedByName}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Print Impact Summary Card */}
      <div className="relative overflow-hidden rounded-3xl border-4 border-amber-400/50 bg-gradient-to-b from-amber-50/80 to-card p-8 text-center shadow-xl print:block">
        <div className="absolute left-3 top-3 size-6 border-l-2 border-t-2 border-amber-500" />
        <div className="absolute right-3 top-3 size-6 border-r-2 border-t-2 border-amber-500" />
        <div className="absolute bottom-3 left-3 size-6 border-b-2 border-l-2 border-amber-500" />
        <div className="absolute bottom-3 right-3 size-6 border-b-2 border-r-2 border-amber-500" />

        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-saffron text-white shadow">
          <Award className="size-8" />
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-amber-700">
          BhojanBandhu Community Impact Report
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold">
          {stats.totalMeals.toLocaleString("en-IN")} Meals Served
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Across {stats.completed} completed donations by {stats.uniqueDonors} donors and {stats.uniqueNgos} NGO partners —
          preventing <strong>{stats.wasteSavedKg} kg</strong> of food waste.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { v: stats.total, l: "Donations Listed" },
            { v: stats.completed, l: "Distributed" },
            { v: `${stats.wasteSavedKg}kg`, l: "Waste Prevented" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-amber-200 bg-card p-3">
              <p className="font-display text-2xl font-bold text-primary">{s.v}</p>
              <p className="text-xs text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          Generated: {new Date().toLocaleDateString("en-IN", { dateStyle: "full" })} · BhojanBandhu — Koi Bhookha Na Soye
        </p>
      </div>
    </div>
  );
}
