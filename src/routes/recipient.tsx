import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  CheckCircle2,
  Clock,
  ClipboardList,
  ExternalLink,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  TrendingUp,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { ListingCard, StatusBadge } from "@/components/ListingBits";
import { useAuth } from "@/lib/auth";
import { reserveListing, updateProfile, useListings, useNotifications } from "@/lib/db";
import type { Listing, Profile } from "@/lib/types";

export const Route = createFileRoute("/recipient")({
  head: () => ({
    meta: [
      { title: "Recipient Portal — FoodLoop" },
      { name: "description", content: "Find and reserve surplus food donations near you on FoodLoop." },
    ],
  }),
  component: RecipientPortalPage,
});

type Tab = "dashboard" | "explore" | "reservations" | "history" | "saved" | "profile";

const RECIPIENT_BG_IMAGES = [
  "/images/hunger/hunger3.png", // Indian children meal
  "/images/hunger/hunger5.png", // Slum children hunger relief
  "/images/hunger/ground4.jpg", // Child eating meal
  "/images/hunger/card2.png", // Community food relief
];

function RecipientPortalPage() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    toast.success("Signed out successfully.");
    window.location.href = "/login";
  }

  // ── Auth guard: redirect to login when signed out ───────────────────────
  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login", replace: true });
    }
  }, [authLoading, user, navigate]);

  const { data: listings } = useListings();
  const { data: notifs } = useNotifications(user?.uid);

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterFoodType, setFilterFoodType] = useState("all");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [heroBgIdx] = useState(() => Math.floor(Math.random() * RECIPIENT_BG_IMAGES.length));

  // ── Role guard ────────────────────────────────────────────────────────────
  const currentRole = profile?.role as string | undefined;
  if (!authLoading && profile && currentRole !== "recipient" && currentRole !== "ngo" && currentRole !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8" style={{ background: "var(--color-cream)" }}>
        <Logo size="lg" />
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm text-center border" style={{ borderColor: "var(--color-border)" }}>
          <UtensilsCrossed size={48} className="mx-auto mb-4" style={{ color: "#0284C7" }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-ink)" }}>Recipient Portal</h2>
          <p className="text-gray-500 mb-6 text-sm">This portal is for Food Recipients and NGOs only. Your role is <strong className="capitalize">{profile.role}</strong>.</p>
          <button
            onClick={() => navigate({ to: currentRole === "volunteer" ? "/volunteer" : currentRole === "admin" ? "/admin" : "/donor" })}
            className="w-full py-3 rounded-xl font-bold text-white"
            style={{ background: "var(--color-forest)" }}>
            Go to {currentRole === "volunteer" ? "Volunteer" : currentRole === "admin" ? "Admin" : "Donor"} Portal
          </button>
        </div>
      </div>
    );
  }

  // ── Derived data ─────────────────────────────────────────────────────────
  const availableListings = useMemo(() => listings.filter((l) => l.status === "available"), [listings]);

  const myReservations = useMemo(() => {
    if (!user) return [];
    return listings.filter((l) => l.reservedBy === user.uid && ["reserved", "assigned", "picked_up"].includes(l.status));
  }, [listings, user]);

  const myHistory = useMemo(() => {
    if (!user) return listings.filter((l) => l.status === "completed").slice(0, 6);
    return listings.filter((l) => l.reservedBy === user.uid && ["completed", "cancelled"].includes(l.status));
  }, [listings, user]);

  const savedListings = useMemo(() => listings.filter((l) => savedIds.includes(l.id)), [listings, savedIds]);

  const filteredExplore = useMemo(() => {
    let arr = availableListings;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      arr = arr.filter((l) =>
        l.title.toLowerCase().includes(q) || l.locationText.toLowerCase().includes(q) ||
        l.donorName.toLowerCase().includes(q) || l.category.toLowerCase().includes(q),
      );
    }
    if (filterCategory !== "all") arr = arr.filter((l) => l.category === filterCategory);
    if (filterFoodType !== "all") arr = arr.filter((l) => l.foodType === filterFoodType);
    return arr;
  }, [availableListings, searchQuery, filterCategory, filterFoodType]);

  const unreadCount = notifs.filter((n) => !n.read).length;
  const mealsReceived = (myHistory.filter((l) => l.status === "completed").length * 15) || 120;
  const impactBeneficiaries = Math.round(mealsReceived * 1.3) || 156;

  async function handleReserve(listing: Listing) {
    if (!user || !profile) {
      toast.info("Please sign in to reserve food.");
      navigate({ to: "/login" });
      return;
    }
    setBusy(listing.id);
    try {
      await reserveListing(listing, profile as Profile);
      toast.success("Reserved! Check your Reservations tab for the pickup code.", { duration: 6000 });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not reserve.");
    } finally {
      setBusy(null);
    }
  }

  function toggleSave(id: string) {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  // Profile edit
  const [profileName, setProfileName] = useState(profile?.name || "");
  const [profilePhone, setProfilePhone] = useState(profile?.phone || "");
  const [profileArea, setProfileArea] = useState(profile?.area || "");
  const [profileOrg, setProfileOrg] = useState(profile?.orgName || "");
  const [profileCapacity, setProfileCapacity] = useState(profile?.dailyCapacity?.toString() || "");
  const [profileBusy, setProfileBusy] = useState(false);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setProfileBusy(true);
    try {
      const cap = Number(profileCapacity) || 0;
      await updateProfile(user.uid, { name: profileName, phone: profilePhone, area: profileArea, orgName: profileOrg, ...(cap > 0 ? { dailyCapacity: cap } : {}) });
      toast.success("Profile updated!");
    } catch { toast.error("Could not save profile."); }
    finally { setProfileBusy(false); }
  }

  if (authLoading) return <PortalLoader />;

  const navItems: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "explore", label: "Explore Food", icon: <Search size={20} />, badge: availableListings.length },
    { id: "reservations", label: "My Reservations", icon: <ClipboardList size={20} />, badge: myReservations.length },
    { id: "history", label: "Collection History", icon: <BookOpen size={20} /> },
    { id: "saved", label: "Saved", icon: <Heart size={20} />, badge: savedIds.length },
    { id: "profile", label: "Profile", icon: <User size={20} /> },
  ];

  // ── Theme: Sky Blue ───────────────────────────────────────────────────────
  const THEME = { primary: "#0284C7", light: "#E0F2FE", dark: "#075985", border: "#BAE6FD" };

  return (
    <div className="flex min-h-screen" style={{ background: "#F0F9FF" }}>
      {/* ── Desktop Sidebar (Blue Recipient theme) ───────────────────────── */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-white shadow-sm" style={{ borderColor: THEME.border }}>
        <div className="px-6 py-5 border-b" style={{ borderColor: THEME.border }}>
          <Logo size="sm" />
        </div>
        <div className="mx-4 mt-4 rounded-xl px-4 py-3 text-white" style={{ background: `linear-gradient(135deg,${THEME.dark},${THEME.primary})` }}>
          <p className="text-xs font-semibold text-sky-100 uppercase tracking-widest">🤲 Recipient Portal</p>
          <p className="text-sm font-bold mt-0.5 truncate">{profile?.orgName || profile?.name || "Food Recipient"}</p>
          {profile?.verified && <span className="mt-1 inline-flex items-center gap-1 text-xs text-sky-100"><ShieldCheck size={12} /> Verified NGO</span>}
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? "text-white shadow-sm" : "text-gray-600 hover:bg-sky-50"}`}
              style={activeTab === item.id ? { background: THEME.primary } : {}}>
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="rounded-full px-2 py-0.5 text-xs font-bold"
                  style={activeTab === item.id ? { background: "rgba(255,255,255,0.25)", color: "white" } : { background: "#ED7545", color: "white" }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t space-y-2" style={{ borderColor: THEME.border }}>
          <button onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm" style={{ borderColor: THEME.border }}>
          <div>
            <h1 className="text-lg font-bold" style={{ color: "var(--color-ink)" }}>{navItems.find(n => n.id === activeTab)?.label}</h1>
            <p className="text-xs text-gray-500">FoodLoop — Recipient Portal 🤲</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-100">
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full" style={{ background: "#ED7545" }} />}
            </button>
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: THEME.primary }}>
              {(profile?.name?.[0] || "R").toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/60 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
            >
              <LogOut size={14} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
          {/* ── DASHBOARD ─────────────────────────────────────────── */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Food imagery hero */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl h-56">
                <img src={RECIPIENT_BG_IMAGES[heroBgIdx]} alt="Delicious food" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg,${THEME.dark}E0 0%,${THEME.primary}B0 100%)` }} />
                <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                  <div>
                    <p className="text-sky-100 text-sm font-medium">Welcome back 🤲</p>
                    <h2 className="text-3xl font-bold mt-1">{profile?.orgName || profile?.name || "Food Recipient"}</h2>
                    <p className="text-sky-100 text-sm mt-1">Helping <strong>{impactBeneficiaries}</strong> people access surplus food.</p>
                  </div>
                  <button onClick={() => setActiveTab("explore")}
                    className="self-start flex items-center gap-2 bg-white font-bold px-5 py-2 rounded-xl shadow-lg hover:bg-sky-50 transition-all"
                    style={{ color: THEME.primary }}>
                    <Search size={18} /> Find Food Now
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Available Now", value: availableListings.length, icon: <UtensilsCrossed size={22} />, color: THEME.primary },
                  { label: "My Reservations", value: myReservations.length, icon: <ClipboardList size={22} />, color: "#ED7545" },
                  { label: "Meals Collected", value: mealsReceived, icon: <Package size={22} />, color: "#205C43" },
                  { label: "People Helped", value: impactBeneficiaries, icon: <TrendingUp size={22} />, color: "#3F8F62" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border" style={{ borderColor: THEME.border }}>
                    <div className="flex items-start justify-between">
                      <div><p className="text-xs text-gray-500 font-medium">{stat.label}</p><p className="text-3xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p></div>
                      <div className="rounded-xl p-2" style={{ background: stat.color + "15", color: stat.color }}>{stat.icon}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active reservations inline */}
              {myReservations.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg" style={{ color: "var(--color-ink)" }}>Active Reservations</h3>
                    <button
                      onClick={() => setActiveTab("reservations")}
                      className="rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800 hover:bg-sky-100 transition-all shadow-2xs"
                    >
                      View all reservations →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {myReservations.slice(0, 3).map((listing) => (
                      <ReservationCard key={listing.id} listing={listing} theme={THEME.primary} />
                    ))}
                  </div>
                </section>
              )}

              {/* Quick food grid */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg" style={{ color: "var(--color-ink)" }}>Available Near You</h3>
                  <button
                    onClick={() => setActiveTab("explore")}
                    className="rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800 hover:bg-sky-100 transition-all shadow-2xs"
                  >
                    Explore all available food →
                  </button>
                </div>
                {availableListings.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <UtensilsCrossed size={40} className="mx-auto mb-3 opacity-40" />
                    <p>No food available right now — check back soon.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {availableListings.slice(0, 6).map((l) => (
                      <div key={l.id} className="relative group">
                        <ListingCard l={l} />
                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => toggleSave(l.id)} className="p-2 bg-white rounded-xl shadow border" style={{ borderColor: THEME.border }}>
                            <Heart size={16} fill={savedIds.includes(l.id) ? "#ED7545" : "none"} stroke={savedIds.includes(l.id) ? "#ED7545" : "#666"} />
                          </button>
                          <button onClick={() => handleReserve(l)} disabled={busy === l.id}
                            className="px-4 py-2 rounded-xl text-sm font-bold text-white shadow transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: THEME.primary }}>
                            {busy === l.id ? "…" : "Reserve"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ── EXPLORE ───────────────────────────────────────────── */}
          {activeTab === "explore" && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-4 shadow-sm border space-y-3" style={{ borderColor: THEME.border }}>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search food, location, donor name…"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: THEME.border }} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {["all", "Cooked meals", "Bakery", "Fruits & vegetables", "Packaged food", "Dairy", "Beverages"].map(cat => (
                    <button key={cat} onClick={() => setFilterCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all`}
                      style={filterCategory === cat ? { background: THEME.primary, borderColor: THEME.primary, color: "white" } : { borderColor: THEME.border, color: "#666" }}>
                      {cat === "all" ? "All categories" : cat}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {(["all", "veg", "non-veg", "vegan"] as const).map(ft => (
                    <button key={ft} onClick={() => setFilterFoodType(ft)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all`}
                      style={filterFoodType === ft ? { background: "#ED7545", borderColor: "#ED7545", color: "white" } : { borderColor: THEME.border, color: "#666" }}>
                      {ft === "all" ? "All types" : ft}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500">{filteredExplore.length} listings found</p>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredExplore.map(l => (
                  <div key={l.id} className="relative group">
                    <ListingCard l={l} />
                    <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toggleSave(l.id)} className="p-2 bg-white rounded-xl shadow border" style={{ borderColor: THEME.border }}>
                        <Heart size={16} fill={savedIds.includes(l.id) ? "#ED7545" : "none"} stroke={savedIds.includes(l.id) ? "#ED7545" : "#666"} />
                      </button>
                      <button onClick={() => handleReserve(l)} disabled={busy === l.id}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-white shadow disabled:opacity-50"
                        style={{ background: THEME.primary }}>
                        {busy === l.id ? "…" : "Reserve"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {filteredExplore.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                  <Search size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-lg">No results found</p>
                  <p className="text-sm">Try different search terms or check all categories.</p>
                </div>
              )}
            </div>
          )}

          {/* ── RESERVATIONS ──────────────────────────────────────── */}
          {activeTab === "reservations" && (
            <div className="space-y-4">
              {myReservations.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <ClipboardList size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-lg">No active reservations</p>
                  <button onClick={() => setActiveTab("explore")} className="mt-4 px-6 py-2 rounded-xl font-bold text-white" style={{ background: THEME.primary }}>
                    Explore Food
                  </button>
                </div>
              ) : (
                myReservations.map(listing => <ReservationCard key={listing.id} listing={listing} theme={THEME.primary} detailed />)
              )}
            </div>
          )}

          {/* ── HISTORY ───────────────────────────────────────────── */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {[
                  { label: "Completed Collections", value: myHistory.filter(l => l.status === "completed").length, icon: <CheckCircle2 size={20} /> },
                  { label: "Meals Distributed", value: mealsReceived, icon: <Package size={20} /> },
                  { label: "People Helped", value: impactBeneficiaries, icon: <TrendingUp size={20} /> },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl p-4 border shadow-sm flex items-center gap-3" style={{ borderColor: THEME.border }}>
                    <div className="rounded-xl p-2" style={{ background: THEME.primary, color: "white" }}>{stat.icon}</div>
                    <div><p className="text-xs text-gray-500">{stat.label}</p><p className="text-2xl font-bold" style={{ color: THEME.primary }}>{stat.value}</p></div>
                  </div>
                ))}
              </div>
              {myHistory.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <BookOpen size={48} className="mx-auto mb-4 opacity-30" /><p>No collection history yet</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: THEME.border }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left" style={{ borderColor: THEME.border, background: "#F0F9FF" }}>
                        <th className="px-4 py-3 font-semibold text-gray-600">Food Item</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Donor</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Qty</th>
                        <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myHistory.map((l, i) => (
                        <tr key={l.id} className={`border-b hover:bg-sky-50/40 ${i % 2 === 0 ? "" : "bg-sky-50/20"}`} style={{ borderColor: "#E0F2FE" }}>
                          <td className="px-4 py-3 font-medium" style={{ color: "var(--color-ink)" }}>{l.title}</td>
                          <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{l.donorName}</td>
                          <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{l.quantity} {l.unit}</td>
                          <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── SAVED ─────────────────────────────────────────────── */}
          {activeTab === "saved" && (
            <div className="space-y-4">
              {savedListings.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <Heart size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-lg">No saved listings</p>
                  <p className="text-sm mb-4">Tap the heart icon on any listing to save it.</p>
                  <button onClick={() => setActiveTab("explore")} className="px-6 py-2 rounded-xl font-bold text-white" style={{ background: THEME.primary }}>Browse Food</button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {savedListings.map(l => (
                    <div key={l.id} className="relative">
                      <ListingCard l={l} />
                      <button onClick={() => toggleSave(l.id)} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow">
                        <Heart size={16} fill="#ED7545" stroke="#ED7545" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE ───────────────────────────────────────────── */}
          {activeTab === "profile" && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-white rounded-2xl border p-6 shadow-sm flex items-center gap-5" style={{ borderColor: THEME.border }}>
                <div className="h-20 w-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg" style={{ background: `linear-gradient(135deg,${THEME.dark},${THEME.primary})` }}>
                  {(profile?.name?.[0] || "R").toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: "var(--color-ink)" }}>{profile?.orgName || profile?.name || "Food Recipient"}</h3>
                  <p className="text-gray-500 text-sm">{profile?.email}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: THEME.primary }}>🤲 Recipient</span>
                    {profile?.verified && <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: "#205C43" }}><ShieldCheck size={12} /> Verified NGO</span>}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border p-6 shadow-sm" style={{ borderColor: THEME.border }}>
                <h3 className="font-bold text-lg mb-4" style={{ color: "var(--color-ink)" }}>Edit Profile</h3>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  {[
                    { label: "Contact Person Name", value: profileName, setter: setProfileName, placeholder: "Your name" },
                    { label: "Organisation / NGO Name", value: profileOrg, setter: setProfileOrg, placeholder: "e.g. Hope Foundation" },
                    { label: "Phone Number", value: profilePhone, setter: setProfilePhone, placeholder: "+91 98765 43210" },
                    { label: "Service Area", value: profileArea, setter: setProfileArea, placeholder: "e.g. Sector 62, Noida" },
                    { label: "Daily Beneficiary Capacity", value: profileCapacity, setter: setProfileCapacity, placeholder: "e.g. 150" },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                      <input value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2" style={{ borderColor: THEME.border }} />
                    </div>
                  ))}
                  <button type="submit" disabled={profileBusy} className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-60" style={{ background: THEME.primary }}>
                    {profileBusy ? "Saving…" : "Save Changes"}
                  </button>
                </form>
              </div>
              {!profile?.verified && (
                <div className="rounded-2xl border p-5 flex gap-4" style={{ borderColor: "#FED7AA", background: "#FFF7ED" }}>
                  <AlertTriangle size={24} className="text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-700">Organisation not verified</p>
                    <p className="text-sm text-orange-600 mt-1">Verify your NGO registration to access priority reservations and larger quantities.</p>
                    <Link to="/verification" className="mt-3 inline-block text-sm font-bold underline" style={{ color: "#D97706" }}>Submit verification →</Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Mobile Bottom Nav (Blue) ───────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t z-40 flex" style={{ borderColor: THEME.border }}>
        {navItems.slice(0, 5).map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors`}
            style={activeTab === item.id ? { color: THEME.primary } : { color: "#9CA3AF" }}>
            {item.icon}
            <span>{item.label.split(" ")[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function ReservationCard({ listing, theme, detailed }: { listing: Listing; theme: string; detailed?: boolean }) {
  const cfg: Record<string, { label: string; icon: string }> = {
    reserved: { label: "Awaiting volunteer", icon: "⏳" },
    assigned: { label: "Volunteer on the way", icon: "🚴" },
    picked_up: { label: "Ready for handover", icon: "✅" },
  };
  const s = cfg[listing.status] ?? { label: listing.status, icon: "📦" };

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "#BAE6FD" }}>
      <div className="flex gap-4 p-4">
        {listing.photo && <img src={listing.photo} alt={listing.title} className="h-20 w-24 rounded-xl object-cover shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold truncate" style={{ color: "var(--color-ink)" }}>{listing.title}</h4>
            <span className="text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap" style={{ background: theme + "15", color: theme }}>
              {s.icon} {s.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin size={12} />{listing.locationText}</p>
          {listing.pickupCode && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm font-bold" style={{ background: "#E0F2FE", color: "#075985" }}>
              🔑 Pickup Code: <span className="font-mono text-lg">{listing.pickupCode}</span>
            </div>
          )}
          {detailed && (
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Package size={12} />{listing.quantity} {listing.unit}</span>
              <span className="flex items-center gap-1"><Clock size={12} />By {new Date(listing.pickupDeadline).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          )}
        </div>
      </div>
      <div className="px-4 pb-3 flex gap-2">
        <Link to="/donations/$id" params={{ id: listing.id }}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border hover:bg-gray-50"
          style={{ borderColor: "#BAE6FD", color: theme }}>
          <ExternalLink size={12} /> View Details
        </Link>
      </div>
    </div>
  );
}

function PortalLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "#F0F9FF" }}>
      <div className="flex flex-col items-center gap-4">
        <Logo size="lg" />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
      </div>
    </div>
  );
}
