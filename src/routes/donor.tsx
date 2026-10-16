import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  PlusCircle,
  QrCode,
  ShieldCheck,
  TrendingUp,
  User,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { ListingCard, StatusBadge, UrgencyBadge } from "@/components/ListingBits";
import { useAuth } from "@/lib/auth";
import { cancelListing, createListing, updateProfile, useListings, useNotifications } from "@/lib/db";
import { isOpen } from "@/lib/priority";
import type { Category, Listing } from "@/lib/types";

export const Route = createFileRoute("/donor")({
  head: () => ({
    meta: [
      { title: "Donor Portal — FoodLoop" },
      { name: "description", content: "Manage your surplus food donations on FoodLoop." },
    ],
  }),
  component: DonorPortalPage,
});

type Tab = "dashboard" | "donations" | "new" | "reservations" | "impact" | "profile";

// ─── Hero food images for donor (warm amber palette) ──────────────────────────
const DONOR_BG_IMAGES = [
  "https://images.unsplash.com/photo-1544717305-2782549b5136?w=1400&auto=format&fit=crop&q=80", // Indian children meal
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1400&auto=format&fit=crop&q=80", // Slum children hunger relief
  "https://images.unsplash.com/photo-1578357078586-491adf1aa5c7?w=1400&auto=format&fit=crop&q=80", // Child eating meal
  "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1400&auto=format&fit=crop&q=80", // Community food relief
];

function DonorPortalPage() {
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
  const [heroBgIdx] = useState(() => Math.floor(Math.random() * DONOR_BG_IMAGES.length));

  // ── New listing form ─────────────────────────────────────────────────────
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("Cooked meals");
  const [newQuantity, setNewQuantity] = useState(25);
  const [newUnit, setNewUnit] = useState("plates");
  const [newFoodType, setNewFoodType] = useState<"veg" | "non-veg" | "vegan">("veg");
  const [newLocation, setNewLocation] = useState(profile?.defaultPickupAddress || profile?.area || "");
  const [newInstructions, setNewInstructions] = useState("");
  const [newStorage, setNewStorage] = useState<"hot" | "chilled" | "room">("hot");
  const [newAllergens, setNewAllergens] = useState<string[]>([]);
  const [newPhoto, setNewPhoto] = useState("https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80");
  const [newDeadlineHours, setNewDeadlineHours] = useState(4);
  const [newChecklist, setNewChecklist] = useState({ covered: false, temperature: false, hygienic: false, notExpired: false });
  const [busy, setBusy] = useState(false);

  // ── Profile edit ─────────────────────────────────────────────────────────
  const [profileName, setProfileName] = useState(profile?.name || "");
  const [profileOrg, setProfileOrg] = useState(profile?.orgName || "");
  const [profilePhone, setProfilePhone] = useState(profile?.phone || "");
  const [profileArea, setProfileArea] = useState(profile?.area || "");
  const [profileBio, setProfileBio] = useState(profile?.bio || "");
  const [profileBusy, setProfileBusy] = useState(false);

  // ── Derived data ─────────────────────────────────────────────────────────
  const myDonations = useMemo(() => {
    if (!user) return listings.slice(0, 6);
    return listings.filter((l) => l.donorId === user.uid);
  }, [listings, user]);

  const activeDonations = myDonations.filter((l) => isOpen(l));
  const reservedDonations = myDonations.filter((l) => ["reserved", "assigned"].includes(l.status));
  const completedDonations = myDonations.filter((l) => l.status === "completed");
  const totalPortions = myDonations.reduce((s, l) => s + (l.quantity || 0), 0) || 185;
  const unreadCount = notifs.filter((n) => !n.read).length;

  // ── Role guard ────────────────────────────────────────────────────────────
  const nonDonorRole = profile?.role as string | undefined;
  if (!authLoading && profile && nonDonorRole !== "donor" && nonDonorRole !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8" style={{ background: "var(--color-cream)" }}>
        <Logo size="lg" />
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm text-center border" style={{ borderColor: "var(--color-border)" }}>
          <UtensilsCrossed size={48} className="mx-auto mb-4" style={{ color: "#ED7545" }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-ink)" }}>Donor Portal</h2>
          <p className="text-gray-500 mb-6 text-sm">This portal is for Food Donors only. Your role is <strong className="capitalize">{profile.role}</strong>.</p>
          <button
            onClick={() => navigate({ to: nonDonorRole === "volunteer" ? "/volunteer" : nonDonorRole === "admin" ? "/admin" : "/recipient" })}
            className="w-full py-3 rounded-xl font-bold text-white"
            style={{ background: "var(--color-forest)" }}
          >
            Go to {nonDonorRole === "volunteer" ? "Volunteer" : nonDonorRole === "admin" ? "Admin" : "Recipient"} Portal
          </button>
        </div>
      </div>
    );
  }

  if (authLoading) return <PortalLoader />;

  // ── Create listing ────────────────────────────────────────────────────────
  async function handleCreateDonation(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) { toast.error("Please enter what food you are donating."); return; }
    if (!newChecklist.covered || !newChecklist.hygienic || !newChecklist.notExpired) {
      toast.error("Please confirm the food safety checklist before listing."); return;
    }
    setBusy(true);
    try {
      const now = Date.now();
      const donorName = profile?.orgName || profile?.name || "Food Donor";
      const data = {
        donorId: user?.uid || "donor_default",
        donorName,
        ...(profile?.photoURL ? { donorAvatar: profile.photoURL } : {}),
        donorPhone: profile?.phone || "+91 98765 43210",
        title: newTitle.trim(),
        ...(newDesc.trim() ? { description: newDesc.trim() } : {}),
        category: newCategory,
        foodType: newFoodType,
        quantity: newQuantity,
        unit: newUnit,
        preparedAt: now - 3600_000,
        pickupDeadline: now + newDeadlineHours * 3600_000,
        locationText: newLocation.trim() || "Main Kitchen Dispatch",
        pickupInstructions: newInstructions.trim() || "Collect at side entrance",
        storage: newStorage,
        allergens: newAllergens,
        checklist: newChecklist,
        photo: newPhoto,
      };
      await createListing(data, donorName);
      toast.success("🎉 Donation listed! Recipients can now reserve it.");
      setNewTitle(""); setNewDesc(""); setNewQuantity(25); setNewLocation(""); setNewInstructions("");
      setNewAllergens([]); setNewChecklist({ covered: false, temperature: false, hygienic: false, notExpired: false });
      setActiveTab("donations");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not create listing.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel(listing: Listing) {
    try {
      await cancelListing(listing, profile?.name || "Donor");
      toast.success("Listing cancelled.");
    } catch { toast.error("Could not cancel."); }
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setProfileBusy(true);
    try {
      await updateProfile(user.uid, { name: profileName, orgName: profileOrg, phone: profilePhone, area: profileArea, bio: profileBio });
      toast.success("Profile saved!");
    } catch { toast.error("Could not save profile."); }
    finally { setProfileBusy(false); }
  }

  const navItems: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "donations", label: "My Donations", icon: <UtensilsCrossed size={20} />, badge: activeDonations.length },
    { id: "new", label: "List Surplus Food", icon: <PlusCircle size={20} /> },
    { id: "reservations", label: "Reservations", icon: <QrCode size={20} />, badge: reservedDonations.length },
    { id: "impact", label: "Impact Report", icon: <Award size={20} /> },
    { id: "profile", label: "Profile", icon: <User size={20} /> },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-cream)" }}>
      {/* ── Desktop Sidebar (Amber/Donor theme) ───────────────────────────── */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-white shadow-sm" style={{ borderColor: "#F59E0B30" }}>
        <div className="px-6 py-5 border-b" style={{ borderColor: "#F59E0B30" }}>
          <Logo size="sm" />
        </div>
        <div className="mx-4 mt-4 rounded-xl px-4 py-3 text-white" style={{ background: "linear-gradient(135deg,#D97706,#F59E0B)" }}>
          <p className="text-xs font-semibold text-amber-100 uppercase tracking-widest">🍲 Donor Portal</p>
          <p className="text-sm font-bold mt-0.5 truncate">{profile?.orgName || profile?.name || "Food Donor"}</p>
          {profile?.verified && <span className="mt-1 inline-flex items-center gap-1 text-xs text-amber-100"><ShieldCheck size={12} /> Verified</span>}
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? "text-white shadow-sm" : "text-gray-600 hover:bg-amber-50"}`}
              style={activeTab === item.id ? { background: "#D97706" } : {}}>
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
        <div className="p-4 border-t space-y-2" style={{ borderColor: "#F59E0B30" }}>
          <button onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm" style={{ borderColor: "#F59E0B30" }}>
          <div>
            <h1 className="text-lg font-bold" style={{ color: "var(--color-ink)" }}>{navItems.find(n => n.id === activeTab)?.label}</h1>
            <p className="text-xs text-gray-500">FoodLoop — Donor Portal 🍲</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-100">
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-500" />}
            </button>
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: "#D97706" }}>
              {(profile?.name?.[0] || "D").toUpperCase()}
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
          {/* ── DASHBOARD ────────────────────────────────────────────── */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Hero with food background */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl h-56">
                <img src={DONOR_BG_IMAGES[heroBgIdx]} alt="Delicious food" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(217,119,6,0.88) 0%,rgba(245,158,11,0.75) 100%)" }} />
                <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                  <div>
                    <p className="text-amber-100 text-sm font-medium">Welcome back 🍲</p>
                    <h2 className="text-3xl font-bold mt-1">{profile?.orgName || profile?.name || "Food Donor"}</h2>
                    <p className="text-amber-100 text-sm mt-1">Your generosity has fed <strong>{totalPortions}</strong> people so far.</p>
                  </div>
                  <button onClick={() => setActiveTab("new")}
                    className="self-start flex items-center gap-2 bg-white text-amber-700 font-bold px-5 py-2 rounded-xl shadow-lg hover:bg-amber-50 transition-all">
                    <PlusCircle size={18} /> List Surplus Food
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Active Listings", value: activeDonations.length, icon: <UtensilsCrossed size={22} />, color: "#D97706" },
                  { label: "Awaiting Pickup", value: reservedDonations.length, icon: <QrCode size={22} />, color: "#ED7545" },
                  { label: "Completed", value: completedDonations.length, icon: <CheckCircle2 size={22} />, color: "#205C43" },
                  { label: "Portions Shared", value: totalPortions, icon: <TrendingUp size={22} />, color: "#3F8F62" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border" style={{ borderColor: "#F59E0B20" }}>
                    <div className="flex items-start justify-between">
                      <div><p className="text-xs text-gray-500 font-medium">{s.label}</p><p className="text-3xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p></div>
                      <div className="rounded-xl p-2" style={{ background: s.color + "15", color: s.color }}>{s.icon}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Donations */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg" style={{ color: "var(--color-ink)" }}>Recent Donations</h3>
                  <button
                    onClick={() => setActiveTab("donations")}
                    className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-all shadow-2xs"
                  >
                    View all donations →
                  </button>
                </div>
                {myDonations.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <UtensilsCrossed size={40} className="mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No donations yet</p>
                    <button onClick={() => setActiveTab("new")} className="mt-4 px-5 py-2 rounded-xl text-sm font-bold text-white" style={{ background: "#D97706" }}>Create your first listing</button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {myDonations.slice(0, 6).map((l) => <ListingCard key={l.id} l={l} />)}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ── MY DONATIONS ──────────────────────────────────────── */}
          {activeTab === "donations" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {(["all", "available", "reserved", "assigned", "picked_up", "completed", "cancelled"] as const).map((s) => (
                  <span key={s} className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer`} style={{ borderColor: "#F59E0B40" }}>
                    {s === "all" ? "All" : s}
                  </span>
                ))}
              </div>
              {myDonations.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <UtensilsCrossed size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-lg">No donations yet</p>
                  <button onClick={() => setActiveTab("new")} className="mt-4 px-6 py-2 rounded-xl font-bold text-white" style={{ background: "#D97706" }}>List Surplus Food</button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "#F59E0B20" }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left" style={{ borderColor: "#F59E0B20", background: "#FFFBEB" }}>
                        <th className="px-4 py-3 font-semibold text-gray-600">Food Item</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Qty</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Deadline</th>
                        <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                        <th className="px-4 py-3 font-semibold text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myDonations.map((l, i) => (
                        <tr key={l.id} className={`border-b hover:bg-amber-50/40 transition-colors ${i % 2 === 0 ? "" : "bg-amber-50/20"}`} style={{ borderColor: "#F59E0B15" }}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {l.photo && <img src={l.photo} alt={l.title} className="h-10 w-12 rounded-lg object-cover" />}
                              <div>
                                <p className="font-medium" style={{ color: "var(--color-ink)" }}>{l.title}</p>
                                <p className="text-xs text-gray-400">{l.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{l.quantity} {l.unit}</td>
                          <td className="px-4 py-3 text-gray-500 hidden sm:table-cell text-xs">{new Date(l.pickupDeadline).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                          <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Link to="/donations/$id" params={{ id: l.id }} className="text-xs font-semibold px-2 py-1 rounded-lg border hover:bg-gray-50 flex items-center gap-1" style={{ borderColor: "#F59E0B40", color: "#D97706" }}>
                                <ExternalLink size={11} /> View
                              </Link>
                              {l.status === "available" && (
                                <button onClick={() => handleCancel(l)} className="text-xs font-semibold px-2 py-1 rounded-lg border hover:bg-red-50 flex items-center gap-1 text-red-500 border-red-200">
                                  <XCircle size={11} /> Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── LIST NEW FOOD ──────────────────────────────────────── */}
          {activeTab === "new" && (
            <div className="max-w-2xl">
              <div className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: "#F59E0B30" }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl" style={{ background: "#FEF3C7" }}><PlusCircle size={24} style={{ color: "#D97706" }} /></div>
                  <div><h2 className="font-bold text-xl" style={{ color: "var(--color-ink)" }}>List Surplus Food</h2><p className="text-sm text-gray-500">Fill in the details so recipients can find and reserve it quickly.</p></div>
                </div>
                <form onSubmit={handleCreateDonation} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Food name *</label>
                    <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Vegetable Pulao, Chole Kulche, Pizza" required
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" style={{ borderColor: "#F59E0B40" }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                    <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} placeholder="Freshly prepared, packed in containers…"
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" style={{ borderColor: "#F59E0B40" }} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                      <select value={newCategory} onChange={e => setNewCategory(e.target.value as Category)}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" style={{ borderColor: "#F59E0B40" }}>
                        {["Cooked meals", "Bakery", "Fruits & vegetables", "Packaged food", "Dairy", "Beverages"].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Food type</label>
                      <select value={newFoodType} onChange={e => setNewFoodType(e.target.value as "veg" | "non-veg" | "vegan")}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" style={{ borderColor: "#F59E0B40" }}>
                        <option value="veg">🟢 Veg</option>
                        <option value="non-veg">🔴 Non-veg</option>
                        <option value="vegan">🌿 Vegan</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantity</label>
                      <input type="number" value={newQuantity} onChange={e => setNewQuantity(Number(e.target.value))} min={1}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" style={{ borderColor: "#F59E0B40" }} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Unit</label>
                      <select value={newUnit} onChange={e => setNewUnit(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" style={{ borderColor: "#F59E0B40" }}>
                        {["plates", "portions", "kg", "pieces", "loaves", "packs", "litres"].map(u => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Storage</label>
                      <select value={newStorage} onChange={e => setNewStorage(e.target.value as "hot" | "chilled" | "room")}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" style={{ borderColor: "#F59E0B40" }}>
                        <option value="hot">🌡 Hot (Keep warm)</option>
                        <option value="chilled">❄ Chilled</option>
                        <option value="room">🌤 Room temperature</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pickup deadline</label>
                      <select value={newDeadlineHours} onChange={e => setNewDeadlineHours(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" style={{ borderColor: "#F59E0B40" }}>
                        {[1, 2, 3, 4, 6, 8, 12].map(h => <option key={h} value={h}>{h} hour{h > 1 ? "s" : ""} from now</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pickup location *</label>
                    <input value={newLocation} onChange={e => setNewLocation(e.target.value)} placeholder="e.g. Gate 2, GLA University Cafeteria, Mathura" required
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" style={{ borderColor: "#F59E0B40" }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pickup instructions</label>
                    <textarea value={newInstructions} onChange={e => setNewInstructions(e.target.value)} rows={2} placeholder="Ask for Chef Ramesh at service dock…"
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" style={{ borderColor: "#F59E0B40" }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Allergens</label>
                    <div className="flex flex-wrap gap-2">
                      {["Gluten", "Dairy", "Nuts", "Peanuts", "Soy", "Egg", "Fish", "Sesame"].map(a => (
                        <button key={a} type="button"
                          onClick={() => setNewAllergens(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${newAllergens.includes(a) ? "text-white" : "text-gray-600"}`}
                          style={newAllergens.includes(a) ? { background: "#D97706", borderColor: "#D97706" } : { borderColor: "#F59E0B40" }}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Food Safety Checklist */}
                  <div className="rounded-xl border p-4" style={{ borderColor: "#F59E0B40", background: "#FFFBEB" }}>
                    <p className="text-sm font-bold mb-3" style={{ color: "#92400E" }}>⚠️ Food Safety Checklist (required)</p>
                    <p className="text-xs text-amber-700 mb-3">Please confirm the following before listing. FoodLoop does not guarantee food safety — donors are responsible.</p>
                    {[
                      { key: "covered", label: "Food is properly covered and protected from contamination" },
                      { key: "temperature", label: "Temperature-sensitive food is stored correctly (hot/chilled)" },
                      { key: "hygienic", label: "Food was prepared in hygienic conditions" },
                      { key: "notExpired", label: "Food has not passed its safe consumption window" },
                    ].map(item => (
                      <label key={item.key} className="flex items-start gap-3 mb-2 cursor-pointer">
                        <input type="checkbox" checked={newChecklist[item.key as keyof typeof newChecklist]}
                          onChange={() => setNewChecklist(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof newChecklist] }))}
                          className="mt-0.5 h-4 w-4 accent-amber-600" />
                        <span className="text-xs text-amber-800">{item.label}</span>
                      </label>
                    ))}
                  </div>

                  <button type="submit" disabled={busy}
                    className="w-full py-3 rounded-xl font-bold text-white transition-all disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#D97706,#F59E0B)" }}>
                    {busy ? "Creating listing…" : "🚀 List Donation Now"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── RESERVATIONS ──────────────────────────────────────── */}
          {activeTab === "reservations" && (
            <div className="space-y-4">
              {reservedDonations.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <QrCode size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-lg">No active reservations</p>
                  <p className="text-sm">When recipients reserve your food, they'll appear here with their pickup code.</p>
                </div>
              ) : (
                reservedDonations.map(listing => (
                  <div key={listing.id} className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: "#F59E0B30" }}>
                    <div className="flex gap-4">
                      {listing.photo && <img src={listing.photo} alt={listing.title} className="h-20 w-24 rounded-xl object-cover shrink-0" />}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold" style={{ color: "var(--color-ink)" }}>{listing.title}</h4>
                          <StatusBadge status={listing.status} />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{listing.quantity} {listing.unit} • {listing.category}</p>
                        {listing.reservedByName && <p className="text-sm font-medium mt-1" style={{ color: "#D97706" }}>Reserved by: {listing.reservedByName}</p>}
                        {listing.pickupCode && (
                          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold" style={{ background: "#FEF3C7", color: "#92400E" }}>
                            <QrCode size={16} /> Pickup Code: <span className="font-mono text-lg">{listing.pickupCode}</span>
                          </div>
                        )}
                        {listing.volunteerName && <p className="text-xs text-gray-500 mt-2">🚴 Volunteer: {listing.volunteerName}</p>}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t flex gap-2" style={{ borderColor: "#F59E0B20" }}>
                      <Link to="/donations/$id" params={{ id: listing.id }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1"
                        style={{ borderColor: "#F59E0B40", color: "#D97706" }}>
                        <ExternalLink size={12} /> Full Details
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── IMPACT REPORT ──────────────────────────────────────── */}
          {activeTab === "impact" && (
            <div className="max-w-2xl space-y-6">
              <div className="relative rounded-2xl overflow-hidden h-40">
                <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80" className="absolute inset-0 w-full h-full object-cover" alt="impact" />
                <div className="absolute inset-0 flex flex-col justify-center p-6" style={{ background: "rgba(217,119,6,0.85)" }}>
                  <p className="text-amber-100 text-sm">Your FoodLoop Impact</p>
                  <p className="text-4xl font-black text-white">{totalPortions} portions</p>
                  <p className="text-amber-100 text-sm">shared with {Math.round(totalPortions * 0.8)} people</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Total Listings", value: myDonations.length, icon: <FileText size={20} />, color: "#D97706" },
                  { label: "Completed", value: completedDonations.length, icon: <CheckCircle2 size={20} />, color: "#205C43" },
                  { label: "Active Now", value: activeDonations.length, icon: <Clock size={20} />, color: "#3F8F62" },
                  { label: "People Fed", value: Math.round(totalPortions * 0.8), icon: <HeartHandshake size={20} />, color: "#ED7545" },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-2xl p-4 border shadow-sm" style={{ borderColor: "#F59E0B20" }}>
                    <div className="rounded-xl p-2 w-fit mb-2" style={{ background: s.color + "15", color: s.color }}>{s.icon}</div>
                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border p-5 shadow-sm text-center" style={{ borderColor: "#F59E0B30" }}>
                <Award size={32} className="mx-auto mb-2" style={{ color: "#D97706" }} />
                <p className="font-bold text-lg" style={{ color: "var(--color-ink)" }}>
                  {completedDonations.length >= 10 ? "🥇 Gold Donor" : completedDonations.length >= 5 ? "🥈 Silver Donor" : "🥉 Bronze Donor"}
                </p>
                <p className="text-sm text-gray-500 mt-1">Thank you for fighting food waste in your community.</p>
              </div>
            </div>
          )}

          {/* ── PROFILE ──────────────────────────────────────────── */}
          {activeTab === "profile" && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-white rounded-2xl border p-6 shadow-sm flex items-center gap-5" style={{ borderColor: "#F59E0B20" }}>
                <div className="h-20 w-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg" style={{ background: "linear-gradient(135deg,#D97706,#F59E0B)" }}>
                  {(profile?.name?.[0] || "D").toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: "var(--color-ink)" }}>{profile?.orgName || profile?.name}</h3>
                  <p className="text-gray-500 text-sm">{profile?.email}</p>
                  <span className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: "#D97706" }}>🍲 Food Donor</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl border p-6 shadow-sm" style={{ borderColor: "#F59E0B20" }}>
                <h3 className="font-bold text-lg mb-4" style={{ color: "var(--color-ink)" }}>Edit Profile</h3>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  {[
                    { label: "Your Name", value: profileName, setter: setProfileName, placeholder: "Full name" },
                    { label: "Organisation / Restaurant", value: profileOrg, setter: setProfileOrg, placeholder: "e.g. GLA University Dining" },
                    { label: "Phone Number", value: profilePhone, setter: setProfilePhone, placeholder: "+91 98765 43210" },
                    { label: "Area / City", value: profileArea, setter: setProfileArea, placeholder: "e.g. Mathura, UP" },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                      <input value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" style={{ borderColor: "#F59E0B40" }} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">About / Bio</label>
                    <textarea value={profileBio} onChange={e => setProfileBio(e.target.value)} rows={2} placeholder="We prepare 200+ meals daily for the campus…"
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" style={{ borderColor: "#F59E0B40" }} />
                  </div>
                  <button type="submit" disabled={profileBusy} className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-60" style={{ background: "#D97706" }}>
                    {profileBusy ? "Saving…" : "Save Changes"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Mobile Bottom Nav (Amber) ─────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t z-40 flex" style={{ borderColor: "#F59E0B30" }}>
        {navItems.slice(0, 5).map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${activeTab === item.id ? "" : "text-gray-400"}`}
            style={activeTab === item.id ? { color: "#D97706" } : {}}>
            {item.icon}
            <span>{item.label.split(" ")[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function PortalLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--color-cream)" }}>
      <div className="flex flex-col items-center gap-4">
        <Logo size="lg" />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
      </div>
    </div>
  );
}
