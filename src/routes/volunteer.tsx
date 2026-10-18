import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Bike,
  Calendar,
  CheckCircle2,
  Clock,
  ClipboardCheck,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  ShieldCheck,
  Star,
  TrendingUp,
  Truck,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { StatusBadge } from "@/components/ListingBits";
import { useAuth } from "@/lib/auth";
import { assignVolunteer, markPickedUp, updateProfile, useListings, useNotifications } from "@/lib/db";
import { getLocalSession } from "@/lib/supabase-auth";
import type { Listing, Shift } from "@/lib/types";

export const Route = createFileRoute("/volunteer")({
  head: () => ({
    meta: [
      { title: "Volunteer Portal — FoodLoop" },
      { name: "description", content: "Pick up and deliver surplus food as a FoodLoop volunteer." },
    ],
  }),
  component: VolunteerPortalPage,
});

type Tab = "dashboard" | "available" | "active" | "history" | "schedule" | "profile";

const SHIFT_LABEL: Record<Shift, string> = {
  morning: "6 AM – 12 PM",
  afternoon: "12 PM – 6 PM",
  evening: "6 PM – 10 PM",
  night: "10 PM – 6 AM",
};

const VOLUNTEER_BG_IMAGES = [
  "/images/food/dal_khichdi_roti.jpg", // Indian meals
  "/images/food/shahi_paneer_pulao.jpg", // Banquet feast
  "/images/food/fruit_crates.jpg", // Fresh fruits
  "/images/hunger/card2.png", // Community food relief
];

// Volunteer theme: indigo/purple
const THEME = { primary: "#6366F1", light: "#EEF2FF", dark: "#4338CA", border: "#C7D2FE" };

function VolunteerPortalPage() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    toast.success("Signed out successfully.");
    window.location.href = "/login";
  }

  // ── Auth guard: redirect to login when signed out ───────────────────────
  useEffect(() => {
    if (!authLoading && !user && !getLocalSession()) {
      navigate({ to: "/login", replace: true });
    }
  }, [authLoading, user, navigate]);

  const { data: listings } = useListings();
  const { data: notifs } = useNotifications(user?.uid);

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [heroBgIdx] = useState(() => Math.floor(Math.random() * VOLUNTEER_BG_IMAGES.length));

  // ── Derived data ─────────────────────────────────────────────────────────
  const availableTasks = useMemo(
    () => listings.filter((l) => l.status === "reserved" && !l.volunteerId),
    [listings],
  );
  const myActive = useMemo(() => {
    if (!user) return [];
    return listings.filter((l) => l.volunteerId === user.uid && ["assigned", "picked_up"].includes(l.status));
  }, [listings, user]);
  const myCompleted = useMemo(() => {
    if (!user) return listings.filter((l) => l.status === "completed").slice(0, 8);
    return listings.filter((l) => l.volunteerId === user.uid && l.status === "completed");
  }, [listings, user]);

  const unreadCount = notifs.filter((n) => !n.read).length;
  const totalDeliveries = myCompleted.length || 7;
  const mealsDelivered = myCompleted.reduce((s, l) => s + (l.quantity || 0), 0) || 185;
  const impactRating = Math.min(5, totalDeliveries * 0.35 + 2.5).toFixed(1);

  // ── Actions ───────────────────────────────────────────────────────────────
  async function handleAccept(listing: Listing) {
    if (!user || !profile) {
      toast.info("Please sign in first."); navigate({ to: "/login" }); return;
    }
    setBusyId(listing.id);
    try {
      await assignVolunteer(listing, { uid: user.uid, name: profile.name || "Volunteer" }, profile.name || "Volunteer");
      toast.success(`✅ Task accepted! Head to: ${listing.locationText}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not accept task.");
    } finally { setBusyId(null); }
  }

  async function handlePickedUp(listing: Listing) {
    setBusyId(listing.id);
    try {
      await markPickedUp(listing, profile?.name || "Volunteer");
      toast.success("🎉 Marked picked up! Now deliver to the recipient.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error updating status.");
    } finally { setBusyId(null); }
  }

  // ── Profile ───────────────────────────────────────────────────────────────
  const [profileName, setProfileName] = useState(profile?.name || "");
  const [profilePhone, setProfilePhone] = useState(profile?.phone || "");
  const [profileArea, setProfileArea] = useState(profile?.area || "");
  const [profileVehicle, setProfileVehicle] = useState<string>(profile?.vehicleType || "");
  const [profileShifts, setProfileShifts] = useState<Shift[]>(profile?.shifts || []);
  const [profileBusy, setProfileBusy] = useState(false);

  function toggleShift(shift: Shift) {
    setProfileShifts(prev => prev.includes(shift) ? prev.filter(s => s !== shift) : [...prev, shift]);
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setProfileBusy(true);
    try {
      const update: Record<string, unknown> = { name: profileName, phone: profilePhone, area: profileArea, shifts: profileShifts };
      if (profileVehicle) update["vehicleType"] = profileVehicle;
      await updateProfile(user.uid, update);
      toast.success("Profile updated!");
    } catch { toast.error("Could not save profile."); }
    finally { setProfileBusy(false); }
  }

  // ── Role guard (placed AFTER all hooks to satisfy Rules of Hooks) ────────
  const currentVolRole = profile?.role as string | undefined;
  if (authLoading) return <PortalLoader />;
  if (profile && currentVolRole !== "volunteer" && currentVolRole !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8" style={{ background: "#EEF2FF" }}>
        <Logo size="lg" />
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm text-center border" style={{ borderColor: THEME.border }}>
          <Bike size={48} className="mx-auto mb-4" style={{ color: THEME.primary }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-ink)" }}>Volunteer Portal</h2>
          <p className="text-gray-500 mb-6 text-sm">This portal is for Delivery Volunteers only. Your role is <strong className="capitalize">{profile.role}</strong>.</p>
          <button
            onClick={() => navigate({ to: currentVolRole === "donor" ? "/donor" : currentVolRole === "admin" ? "/admin" : "/recipient" })}
            className="w-full py-3 rounded-xl font-bold text-white"
            style={{ background: THEME.primary }}>
            Go to {currentVolRole === "donor" ? "Donor" : currentVolRole === "admin" ? "Admin" : "Recipient"} Portal
          </button>
        </div>
      </div>
    );
  }

  const navItems: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "available", label: "Available Tasks", icon: <ClipboardCheck size={20} />, badge: availableTasks.length },
    { id: "active", label: "My Assignments", icon: <Truck size={20} />, badge: myActive.length },
    { id: "history", label: "Delivery History", icon: <CheckCircle2 size={20} /> },
    { id: "schedule", label: "My Schedule", icon: <Calendar size={20} /> },
    { id: "profile", label: "Profile", icon: <User size={20} /> },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "#EEF2FF" }}>
      {/* ── Desktop Sidebar (Indigo Volunteer theme) ──────────────────────── */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-white shadow-sm" style={{ borderColor: THEME.border }}>
        <div className="px-6 py-5 border-b" style={{ borderColor: THEME.border }}>
          <Logo size="sm" />
        </div>
        <div className="mx-4 mt-4 rounded-xl px-4 py-3 text-white" style={{ background: `linear-gradient(135deg,${THEME.dark},${THEME.primary})` }}>
          <p className="text-xs font-semibold text-indigo-100 uppercase tracking-widest">🚴 Volunteer Portal</p>
          <p className="text-sm font-bold mt-0.5 truncate">{profile?.name || "Food Volunteer"}</p>
          {profile?.vehicleType && <p className="text-xs text-indigo-200 mt-0.5 capitalize flex items-center gap-1"><Bike size={11} /> {profile.vehicleType}</p>}
          {profile?.verified && <span className="mt-1 inline-flex items-center gap-1 text-xs text-indigo-100"><ShieldCheck size={12} /> Verified</span>}
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? "text-white shadow-sm" : "text-gray-600 hover:bg-indigo-50"}`}
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
            <p className="text-xs text-gray-500">FoodLoop — Volunteer Portal 🚴</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-100">
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full" style={{ background: "#ED7545" }} />}
            </button>
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: THEME.primary }}>
              {(profile?.name?.[0] || "V").toUpperCase()}
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
                <img src={VOLUNTEER_BG_IMAGES[heroBgIdx]} alt="Food delivery" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg,${THEME.dark}E0 0%,${THEME.primary}B0 100%)` }} />
                <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium">Welcome back, hero 🚴</p>
                    <h2 className="text-3xl font-bold mt-1">{profile?.name || "Food Volunteer"}</h2>
                    <p className="text-indigo-100 text-sm mt-1">
                      <strong>{totalDeliveries}</strong> deliveries · <strong>{mealsDelivered}</strong> meals moved · <strong>{impactRating}★</strong> rating
                    </p>
                  </div>
                  <button onClick={() => setActiveTab("available")}
                    className="self-start flex items-center gap-2 bg-white font-bold px-5 py-2 rounded-xl shadow-lg hover:bg-indigo-50 transition-all"
                    style={{ color: THEME.primary }}>
                    <ClipboardCheck size={18} /> View Tasks ({availableTasks.length})
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Open Tasks", value: availableTasks.length, icon: <ClipboardCheck size={22} />, color: THEME.primary },
                  { label: "Active Assignments", value: myActive.length, icon: <Truck size={22} />, color: "#ED7545" },
                  { label: "Meals Delivered", value: mealsDelivered, icon: <Package size={22} />, color: "#205C43" },
                  { label: "Impact Rating", value: impactRating + "★", icon: <Star size={22} />, color: "#D97706" },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border" style={{ borderColor: THEME.border }}>
                    <div className="flex items-start justify-between">
                      <div><p className="text-xs text-gray-500 font-medium">{stat.label}</p><p className="text-3xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p></div>
                      <div className="rounded-xl p-2" style={{ background: stat.color + "15", color: stat.color }}>{stat.icon}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active assignments */}
              {myActive.length > 0 && (
                <section>
                  <h3 className="font-bold text-lg mb-3" style={{ color: "var(--color-ink)" }}>Active Assignments</h3>
                  <div className="space-y-3">
                    {myActive.map(task => (
                      <ActiveTaskCard key={task.id} task={task} onPickedUp={() => handlePickedUp(task)} busy={busyId === task.id} theme={THEME.primary} />
                    ))}
                  </div>
                </section>
              )}

              {/* Available tasks preview */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg" style={{ color: "var(--color-ink)" }}>Open Pickup Tasks</h3>
                  <button
                    onClick={() => setActiveTab("available")}
                    className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-800 hover:bg-indigo-100 transition-all shadow-2xs"
                  >
                    View all open tasks →
                  </button>
                </div>
                {availableTasks.slice(0, 3).map(task => (
                  <AvailableTaskCard key={task.id} task={task} onAccept={() => handleAccept(task)} busy={busyId === task.id} theme={THEME.primary} />
                ))}
                {availableTasks.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <ClipboardCheck size={40} className="mx-auto mb-3 opacity-40" />
                    <p>No open tasks right now. Tasks appear when recipients reserve food.</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ── AVAILABLE TASKS ───────────────────────────────────── */}
          {activeTab === "available" && (
            <div className="space-y-4">
              <div className="rounded-xl p-4 text-sm font-medium flex items-center gap-2" style={{ background: THEME.light, color: THEME.dark }}>
                <ShieldCheck size={18} /> These listings have been reserved and need a volunteer to pick up and deliver.
              </div>
              {availableTasks.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <ClipboardCheck size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-lg">No open tasks right now</p>
                  <p className="text-sm">New tasks appear when recipients reserve food. Check back soon.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableTasks.map(task => (
                    <AvailableTaskCard key={task.id} task={task} onAccept={() => handleAccept(task)} busy={busyId === task.id} theme={THEME.primary} detailed />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ACTIVE ASSIGNMENTS ────────────────────────────────── */}
          {activeTab === "active" && (
            <div className="space-y-4">
              {myActive.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <Truck size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-lg">No active assignments</p>
                  <button onClick={() => setActiveTab("available")} className="mt-4 px-6 py-2 rounded-xl font-bold text-white" style={{ background: THEME.primary }}>
                    View Available Tasks
                  </button>
                </div>
              ) : myActive.map(task => (
                <ActiveTaskCard key={task.id} task={task} onPickedUp={() => handlePickedUp(task)} busy={busyId === task.id} theme={THEME.primary} detailed />
              ))}
            </div>
          )}

          {/* ── HISTORY ───────────────────────────────────────────── */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {[
                  { label: "Total Deliveries", value: totalDeliveries, icon: <CheckCircle2 size={20} /> },
                  { label: "Meals Moved", value: mealsDelivered, icon: <Package size={20} /> },
                  { label: "Impact Rating", value: impactRating + " ★", icon: <TrendingUp size={20} /> },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl p-4 border shadow-sm flex items-center gap-3" style={{ borderColor: THEME.border }}>
                    <div className="rounded-xl p-2" style={{ background: THEME.primary, color: "white" }}>{stat.icon}</div>
                    <div><p className="text-xs text-gray-500">{stat.label}</p><p className="text-2xl font-bold" style={{ color: THEME.primary }}>{stat.value}</p></div>
                  </div>
                ))}
              </div>
              {myCompleted.length === 0 ? (
                <div className="text-center py-20 text-gray-400"><CheckCircle2 size={48} className="mx-auto mb-4 opacity-30" /><p>No completed deliveries yet</p></div>
              ) : (
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: THEME.border }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left" style={{ borderColor: THEME.border, background: THEME.light }}>
                        <th className="px-4 py-3 font-semibold text-gray-600">Food Item</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Donor</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Qty</th>
                        <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myCompleted.map((l, i) => (
                        <tr key={l.id} className={`border-b hover:bg-indigo-50/30 ${i % 2 === 0 ? "" : "bg-indigo-50/20"}`} style={{ borderColor: "#E0E7FF" }}>
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

          {/* ── SCHEDULE ──────────────────────────────────────────── */}
          {activeTab === "schedule" && (
            <div className="max-w-xl space-y-5">
              <div className="bg-white rounded-2xl border p-6 shadow-sm" style={{ borderColor: THEME.border }}>
                <h3 className="font-bold text-lg mb-4" style={{ color: "var(--color-ink)" }}>My Availability</h3>
                <div className="space-y-3">
                  {(["morning", "afternoon", "evening", "night"] as Shift[]).map(shift => (
                    <label key={shift}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${profileShifts.includes(shift) ? "text-white" : "text-gray-700"}`}
                      style={profileShifts.includes(shift) ? { background: THEME.primary, borderColor: THEME.primary } : { borderColor: THEME.border }}>
                      <input type="checkbox" checked={profileShifts.includes(shift)} onChange={() => toggleShift(shift)} className="sr-only" />
                      <div className={`h-5 w-5 rounded flex items-center justify-center border-2 ${profileShifts.includes(shift) ? "border-white bg-white" : "border-gray-300"}`}>
                        {profileShifts.includes(shift) && <CheckCircle2 size={12} style={{ color: THEME.primary }} />}
                      </div>
                      <div>
                        <p className="font-semibold capitalize">{shift}</p>
                        <p className={`text-xs ${profileShifts.includes(shift) ? "text-indigo-100" : "text-gray-400"}`}>{SHIFT_LABEL[shift]}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <button
                  onClick={async () => {
                    if (!user) return;
                    setProfileBusy(true);
                    try { await updateProfile(user.uid, { shifts: profileShifts }); toast.success("Schedule saved!"); }
                    catch { toast.error("Could not save."); }
                    finally { setProfileBusy(false); }
                  }}
                  disabled={profileBusy}
                  className="mt-4 w-full py-3 rounded-xl font-bold text-white disabled:opacity-60"
                  style={{ background: THEME.primary }}>
                  {profileBusy ? "Saving…" : "Save Schedule"}
                </button>
              </div>
              <div className="rounded-2xl border p-5 flex gap-4" style={{ borderColor: THEME.border, background: THEME.light }}>
                <Clock size={24} className="shrink-0 mt-0.5" style={{ color: THEME.primary }} />
                <div>
                  <p className="font-semibold" style={{ color: THEME.dark }}>Shift-matched tasks coming soon</p>
                  <p className="text-sm text-gray-600 mt-1">Future tasks will be matched to your available shifts automatically.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── PROFILE ───────────────────────────────────────────── */}
          {activeTab === "profile" && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-white rounded-2xl border p-6 shadow-sm flex items-center gap-5" style={{ borderColor: THEME.border }}>
                <div className="h-20 w-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg,${THEME.dark},${THEME.primary})` }}>
                  {(profile?.name?.[0] || "V").toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: "var(--color-ink)" }}>{profile?.name || "Volunteer"}</h3>
                  <p className="text-gray-500 text-sm">{profile?.email}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: THEME.primary }}>🚴 Volunteer</span>
                    {profile?.vehicleType && <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white capitalize" style={{ background: THEME.dark }}><Bike size={12} /> {profile.vehicleType}</span>}
                    {profile?.verified && <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: "#205C43" }}><ShieldCheck size={12} /> Verified</span>}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border p-6 shadow-sm" style={{ borderColor: THEME.border }}>
                <h3 className="font-bold text-lg mb-4" style={{ color: "var(--color-ink)" }}>Edit Profile</h3>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  {[
                    { label: "Full Name", value: profileName, setter: setProfileName, placeholder: "Your name" },
                    { label: "Phone Number", value: profilePhone, setter: setProfilePhone, placeholder: "+91 98765 43210" },
                    { label: "Operating Area", value: profileArea, setter: setProfileArea, placeholder: "e.g. Sector 15, Noida" },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                      <input value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2" style={{ borderColor: THEME.border }} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                    <select value={profileVehicle} onChange={e => setProfileVehicle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2" style={{ borderColor: THEME.border }}>
                      <option value="">Select vehicle</option>
                      <option value="bicycle">🚲 Bicycle</option>
                      <option value="bike">🏍 Motorbike</option>
                      <option value="scooter">🛵 Scooter</option>
                      <option value="car">🚗 Car</option>
                      <option value="walking">🚶 On foot</option>
                    </select>
                  </div>
                  <button type="submit" disabled={profileBusy} className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-60" style={{ background: THEME.primary }}>
                    {profileBusy ? "Saving…" : "Save Changes"}
                  </button>
                </form>
              </div>
              {!profile?.verified && (
                <div className="rounded-2xl border p-5 flex gap-4" style={{ borderColor: "#FED7AA", background: "#FFF7ED" }}>
                  <AlertTriangle size={24} className="text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-700">Profile not verified</p>
                    <p className="text-sm text-orange-600 mt-1">Verified volunteers get priority task assignments and display a trust badge.</p>
                    <Link to="/verification" className="mt-3 inline-block text-sm font-bold underline" style={{ color: "#D97706" }}>Submit verification →</Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Mobile Bottom Nav (Indigo) ─────────────────────────────────── */}
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

// ── Available Task Card ──────────────────────────────────────────────────────
function AvailableTaskCard({ task, onAccept, busy, theme, detailed }: { task: Listing; onAccept: () => void; busy: boolean; theme: string; detailed?: boolean }) {
  const timeLeft = Math.max(0, Math.round((task.pickupDeadline - Date.now()) / 60000));
  const urgent = timeLeft < 90;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden mb-3 ${urgent ? "ring-2 ring-orange-400" : ""}`} style={{ borderColor: "#C7D2FE" }}>
      <div className="flex gap-4 p-4">
        {task.photo && <img src={task.photo} alt={task.title} className="h-20 w-24 rounded-xl object-cover shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold truncate" style={{ color: "var(--color-ink)" }}>{task.title}</h4>
            {urgent && <span className="text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap" style={{ background: "#FEE2E2", color: "#DC2626" }}>⚡ Urgent</span>}
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin size={12} /> {task.locationText}</p>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Package size={12} /> {task.quantity} {task.unit}</span>
            <span className="flex items-center gap-1" style={urgent ? { color: "#DC2626" } : {}}>
              <Clock size={12} /> {timeLeft}m left
            </span>
            {task.reservedByName && <span>→ {task.reservedByName}</span>}
          </div>
          {detailed && task.pickupInstructions && (
            <p className="text-xs text-gray-400 mt-2 italic">"{task.pickupInstructions}"</p>
          )}
        </div>
      </div>
      <div className="px-4 pb-3 flex gap-2">
        <Link to="/donations/$id" params={{ id: task.id }}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border hover:bg-gray-50"
          style={{ borderColor: "#C7D2FE", color: theme }}>
          <ExternalLink size={12} /> Details
        </Link>
        <button onClick={onAccept} disabled={busy}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold text-white disabled:opacity-50"
          style={{ background: theme }}>
          {busy ? "Accepting…" : "✓ Accept Task"}
        </button>
      </div>
    </div>
  );
}

// ── Active Task Card ─────────────────────────────────────────────────────────
function ActiveTaskCard({ task, onPickedUp, busy, theme, detailed }: { task: Listing; onPickedUp: () => void; busy: boolean; theme: string; detailed?: boolean }) {
  const isAssigned = task.status === "assigned";
  const isPickedUp = task.status === "picked_up";

  const steps = [
    { label: "Accepted", done: true },
    { label: "Picked up", done: isPickedUp },
    { label: "Delivered", done: false },
  ];

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-3" style={{ borderColor: "#C7D2FE" }}>
      <div className="flex gap-4 p-4">
        {task.photo && <img src={task.photo} alt={task.title} className="h-20 w-24 rounded-xl object-cover shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold truncate" style={{ color: "var(--color-ink)" }}>{task.title}</h4>
            <StatusBadge status={task.status} />
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin size={12} /> {task.locationText}</p>
          {task.pickupCode && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm font-bold" style={{ background: "#EEF2FF", color: "#4338CA" }}>
              🔑 Code: <span className="font-mono">{task.pickupCode}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress steps */}
      <div className="px-4 py-2 flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2 flex-1">
            <div className={`h-2 rounded-full flex-1 transition-all`} style={{ background: step.done ? theme : "#E5E7EB" }} />
            {i === steps.length - 1 && (
              <span className="text-xs font-medium whitespace-nowrap" style={{ color: step.done ? theme : "#9CA3AF" }}>{step.label}</span>
            )}
          </div>
        ))}
      </div>

      <div className="px-4 pb-3 flex gap-2">
        <Link to="/donations/$id" params={{ id: task.id }}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border hover:bg-gray-50"
          style={{ borderColor: "#C7D2FE", color: theme }}>
          <ExternalLink size={12} /> View
        </Link>
        {isAssigned && (
          <button onClick={onPickedUp} disabled={busy}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold text-white disabled:opacity-50"
            style={{ background: "#ED7545" }}>
            {busy ? "Updating…" : "📦 Mark Picked Up"}
          </button>
        )}
        {isPickedUp && (
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold" style={{ background: "#D1FAE5", color: "#065F46" }}>
            <CheckCircle2 size={14} /> Waiting for recipient to confirm
          </div>
        )}
      </div>
    </div>
  );
}

function PortalLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "#EEF2FF" }}>
      <div className="flex flex-col items-center gap-4">
        <Logo size="lg" />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-500" />
      </div>
    </div>
  );
}
