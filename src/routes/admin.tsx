import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Award,
  Ban,
  Bike,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Filter,
  HeartHandshake,
  Lock,
  Package,
  PlusCircle,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  UtensilsCrossed,
  X,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { useListings, generateSupabaseSchema } from "@/lib/db";
import { getLocalSession } from "@/lib/supabase-auth";
import { toast } from "sonner";
import { Database } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal & Operations — FoodLoop" },
      { name: "description", content: "Platform trust, safety, user verification, listing moderation, and operations management." },
      { property: "og:title", content: "Admin Portal & Operations — FoodLoop" },
      { property: "og:description", content: "Platform trust, safety, user verification, listing moderation, and operations management." },
    ],
  }),
  component: AdminPage,
});

interface VerificationItem {
  id: string;
  name: string;
  type: "ngo" | "donor" | "volunteer";
  registrationId: string;
  contactPerson: string;
  area: string;
  date: string;
  status: "pending" | "approved" | "rejected";
}

const INITIAL_VERIFICATIONS: VerificationItem[] = [
  {
    id: "ver-1",
    name: "Feeding Hope Children Trust",
    type: "ngo",
    registrationId: "NGO-UP-2023-8891",
    contactPerson: "Rajesh Kumar",
    area: "Mathura City",
    date: "Today, 11:30 AM",
    status: "pending",
  },
  {
    id: "ver-2",
    name: "Green Garden Banquet & Kitchen",
    type: "donor",
    registrationId: "FSSAI-12723004000192",
    contactPerson: "Varis Khan",
    area: "GLA Road, Mathura",
    date: "Yesterday",
    status: "approved",
  },
  {
    id: "ver-3",
    name: "Aman Sharma (Bike Courier)",
    type: "volunteer",
    registrationId: "DL-UP-85-2022-004",
    contactPerson: "Aman Sharma",
    area: "Campus Region",
    date: "2 days ago",
    status: "approved",
  },
  {
    id: "ver-4",
    name: "Anand Seva Foundation",
    type: "ngo",
    registrationId: "DARPAN-UP-2024-110",
    contactPerson: "Pooja Verma",
    area: "Vrindavan",
    date: "3 days ago",
    status: "pending",
  },
];

interface AuditLog {
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: string;
  type: "security" | "moderation" | "verification";
}

function AdminPage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: listings } = useListings();
  const [activeTab, setActiveTab] = useState<"dashboard" | "verification" | "moderation" | "users" | "audit">("dashboard");
  const [seedingSupabase, setSeedingSupabase] = useState(false);

  async function handleSeedSupabase() {
    setSeedingSupabase(true);
    toast.info("Generating Supabase Schema and seeding tables...");
    try {
      const res = await generateSupabaseSchema();
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.info(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate Supabase schema");
    } finally {
      setSeedingSupabase(false);
    }
  }

  async function handleLogout() {
    await signOut();
    toast.success("Signed out successfully.");
    window.location.href = "/welcome";
  }

  // ── Auth guard: redirect to login when signed out ───────────────────────
  useEffect(() => {
    if (!authLoading && !user && !getLocalSession()) {
      navigate({ to: "/login", replace: true });
    }
  }, [authLoading, user, navigate]);


  // Verification queue state
  const [verifications, setVerifications] = useState<VerificationItem[]>(INITIAL_VERIFICATIONS);
  const [verSearch, setVerSearch] = useState("");

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "log-1",
      action: "Approved NGO verification document",
      actor: "admin.moderator@foodloop.org",
      target: "Feeding Hope Foundation",
      timestamp: "10 mins ago",
      type: "verification",
    },
    {
      id: "log-2",
      action: "Flagged unsafe allergen listing",
      actor: "system_safety_bot",
      target: "Listing #489 (Unlabeled dairy)",
      timestamp: "1 hour ago",
      type: "moderation",
    },
    {
      id: "log-3",
      action: "Privilege elevation verification",
      actor: "superadmin@foodloop.org",
      target: "Role: Admin",
      timestamp: "Yesterday",
      type: "security",
    },
  ]);

  // Actions
  function handleVerifyAction(id: string, newStatus: "approved" | "rejected") {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
    );
    const target = verifications.find((v) => v.id === id)?.name || "User";
    toast.success(`Marked ${target} as ${newStatus.toUpperCase()}`);

    setAuditLogs((prev) => [
      {
        id: "log-" + Date.now(),
        action: `${newStatus === "approved" ? "Approved" : "Rejected"} verification request`,
        actor: "Admin (You)",
        target,
        timestamp: "Just now",
        type: "verification",
      },
      ...prev,
    ]);
  }

  // Listing moderation actions
  function handleHideListing(title: string) {
    toast.info(`Listing "${title}" hidden from public feed for safety inspection.`);
    setAuditLogs((prev) => [
      {
        id: "log-" + Date.now(),
        action: "Hidden listing from feed for review",
        actor: "Admin (You)",
        target: title,
        timestamp: "Just now",
        type: "moderation",
      },
      ...prev,
    ]);
  }

  const pendingCount = verifications.filter((v) => v.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-[#164330] text-[#F8F5ED]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo light size="sm" />
            <span className="rounded-full bg-[#ED7545] px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase text-white shadow-xs">
              Platform Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <button
              onClick={handleSeedSupabase}
              disabled={seedingSupabase}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#ED7545] px-3.5 py-1 text-white hover:bg-[#d96536] transition-colors shadow-xs"
              title="Write full schema rows into Supabase"
            >
              <Database className="size-3.5" />
              <span>{seedingSupabase ? "Generating..." : "Generate Supabase Schema"}</span>
            </button>
            <Link to="/app" className="rounded-full bg-white/10 px-3 py-1 hover:bg-white/20 transition-colors">
              Go to User App →
            </Link>
            <div className="flex items-center gap-1.5 text-emerald-300">
              <ShieldCheck className="size-4" /> Secure Admin Session
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-full bg-red-500/20 px-3 py-1 text-red-200 hover:bg-red-500/30 transition-colors"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-border overflow-x-auto pb-1 gap-2">
          {[
            ["dashboard", "Overview & Metrics", Shield],
            ["verification", `Verification Queue (${pendingCount})`, UserCheck],
            ["moderation", "Donation Moderation", ShieldAlert],
            ["audit", "Audit Logs", FileText],
          ].map(([tabKey, label, Icon]: any) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => setActiveTab(tabKey)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === tabKey
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {/* 1. OVERVIEW DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Food Listings</p>
                <p className="mt-2 text-3xl font-extrabold text-primary">{listings.length}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Live community surplus items</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pending Verifications</p>
                <p className="mt-2 text-3xl font-extrabold text-[#ED7545]">{pendingCount}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">NGO and Donor registration docs</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Registered Users</p>
                <p className="mt-2 text-3xl font-extrabold text-[#3F8F62]">148</p>
                <p className="mt-1 text-[11px] text-muted-foreground">62 Donors • 41 NGOs • 45 Volunteers</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Safety Pass Rate</p>
                <p className="mt-2 text-3xl font-extrabold text-blue-600">99.4%</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Zero verified contamination incidents</p>
              </div>
            </div>

            {/* Interactive Analytics & Trends (Recharts) */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Weekly Surplus Food Rescues (Meals)</h3>
                    <p className="text-xs text-muted-foreground">Real-time redistribution volume trend</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    +18.4% this week
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { day: "Mon", meals: 240, target: 200 },
                      { day: "Tue", meals: 310, target: 250 },
                      { day: "Wed", meals: 290, target: 250 },
                      { day: "Thu", meals: 420, target: 300 },
                      { day: "Fri", meals: 510, target: 350 },
                      { day: "Sat", meals: 680, target: 400 },
                      { day: "Sun", meals: 590, target: 400 },
                    ]}>
                      <defs>
                        <linearGradient id="mealsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#205C43" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#205C43" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="day" stroke="#6b7280" fontSize={11} tickLine={false} />
                      <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                      <Area type="monotone" dataKey="meals" stroke="#205C43" strokeWidth={2.5} fillOpacity={1} fill="url(#mealsGrad)" name="Rescued Meals" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Active Role Distribution</h3>
                    <p className="text-xs text-muted-foreground">Community network composition</p>
                  </div>
                  <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                    148 Active
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { category: "Food Donors", count: 62, fill: "#D97706" },
                      { category: "Recipient NGOs", count: 41, fill: "#0284C7" },
                      { category: "Couriers", count: 45, fill: "#6366F1" },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="category" stroke="#6b7280" fontSize={11} tickLine={false} />
                      <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Active Users" fill="#205C43" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Quick Operations Actions */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-lg font-bold">Platform Quick Actions</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("verification")}
                  className="rounded-xl border border-border p-4 text-left hover:border-primary/50 transition-colors"
                >
                  <UserCheck className="size-5 text-primary mb-2" />
                  <p className="font-bold text-sm">Review Pending NGOs</p>
                  <p className="text-xs text-muted-foreground">Verify NGO Darpan IDs and daily shelter capacity.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("moderation")}
                  className="rounded-xl border border-border p-4 text-left hover:border-primary/50 transition-colors"
                >
                  <ShieldAlert className="size-5 text-[#ED7545] mb-2" />
                  <p className="font-bold text-sm">Inspect Live Listings</p>
                  <p className="text-xs text-muted-foreground">Review allergen labels and preparation timestamp accuracy.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("audit")}
                  className="rounded-xl border border-border p-4 text-left hover:border-primary/50 transition-colors"
                >
                  <FileText className="size-5 text-blue-600 mb-2" />
                  <p className="font-bold text-sm">View System Logs</p>
                  <p className="text-xs text-muted-foreground">Trace administrative changes, role updates, and audit records.</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. VERIFICATION QUEUE */}
        {activeTab === "verification" && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Organization & Volunteer Verification Queue</h2>
                <p className="text-xs text-muted-foreground">
                  Review government registrations, FSSAI certificates, and ID documents before granting verified badge.
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter organizations…"
                  value={verSearch}
                  onChange={(e) => setVerSearch(e.target.value)}
                  className="rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
                  <tr>
                    <th className="p-3.5">Organization / User</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Govt / Reg ID</th>
                    <th className="p-3.5">Area</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {verifications
                    .filter((v) => (v.name ?? "").toLowerCase().includes(verSearch.toLowerCase()))
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-muted/20">
                        <td className="p-3.5 font-semibold text-foreground">
                          {item.name}
                          <span className="block text-[11px] font-normal text-muted-foreground">
                            Rep: {item.contactPerson}
                          </span>
                        </td>
                        <td className="p-3.5 capitalize">
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-bold text-primary">
                            {item.type}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-muted-foreground">{item.registrationId}</td>
                        <td className="p-3.5 text-muted-foreground">{item.area}</td>
                        <td className="p-3.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              item.status === "approved"
                                ? "bg-emerald-500/15 text-emerald-700"
                                : item.status === "rejected"
                                ? "bg-destructive/15 text-destructive"
                                : "bg-amber-500/15 text-amber-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          {item.status === "pending" ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleVerifyAction(item.id, "approved")}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                              >
                                <Check className="size-3" /> Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleVerifyAction(item.id, "rejected")}
                                className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10"
                              >
                                <X className="size-3" /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground font-medium">Reviewed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. DONATION MODERATION */}
        {activeTab === "moderation" && (
          <div className="mt-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold">Live Food Donation Moderation</h2>
              <p className="text-xs text-muted-foreground">
                Inspect active donations for food-safety adherence, accurate portion declarations, and allergen notices.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((l) => (
                <div key={l.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {l.category}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground capitalize">{l.foodType}</span>
                  </div>

                  <h3 className="mt-2 font-bold text-base text-foreground">{l.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {l.quantity} {l.unit} • By {l.donorName}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{l.locationText}</p>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <Link
                      to="/app/listing/$id"
                      params={{ id: l.id }}
                      className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all"
                    >
                      View Live →
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleHideListing(l.title)}
                      className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-2 py-1 text-[11px] font-semibold text-destructive hover:bg-destructive/10"
                    >
                      <Ban className="size-3" /> Flag / Hide
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. AUDIT LOGS */}
        {activeTab === "audit" && (
          <div className="mt-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold">Platform Audit & Security Logs</h2>
              <p className="text-xs text-muted-foreground">
                Immutable trace of sensitive administrative operations, role elevation, and moderation decisions.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="divide-y divide-border">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-3 text-xs">
                    <div>
                      <p className="font-bold text-foreground">{log.action}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Target: <span className="font-medium text-foreground">{log.target}</span> • By {log.actor}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[10px] text-muted-foreground">{log.timestamp}</span>
                      <span className="block capitalize text-[10px] font-bold text-primary">{log.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
