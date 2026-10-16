import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  Edit3,
  HeartHandshake,
  LogOut,
  MapPin,
  Package,
  Phone,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge, UrgencyBadge } from "@/components/ListingBits";
import { useAuth } from "@/lib/auth";
import { updateProfile, useListings } from "@/lib/db";
import { getFirebase } from "@/lib/firebase";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Donor Profile — AnnSetu" },
      { name: "description", content: "Your AnnSetu Donor profile, active food donations, and community impact." },
      { property: "og:title", content: "Donor Profile — AnnSetu" },
      { property: "og:description", content: "Your AnnSetu Donor profile, active food donations, and community impact." },
    ],
  }),
  component: ProfilePage,
});

const DONOR_TYPES = [
  { id: "restaurant", label: "Restaurant / Cafe" },
  { id: "hostel", label: "Hostel / College Mess" },
  { id: "catering", label: "Catering & Banquet" },
  { id: "event", label: "Wedding / Event Organizer" },
  { id: "household", label: "Home / Individual Donor" },
  { id: "other", label: "Corporate / Other" },
] as const;

function ProfilePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { data: allListings } = useListings();

  const [activeTab, setActiveTab] = useState<"donations" | "edit" | "role">("donations");
  const [filter, setFilter] = useState<"all" | "active" | "reserved" | "completed">("all");

  // Edit form states
  const [name, setName] = useState(profile?.name || user?.displayName || "");
  const [orgName, setOrgName] = useState(profile?.orgName || "");
  const [donorType, setDonorType] = useState<string>(profile?.donorType || "restaurant");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [area, setArea] = useState(profile?.area || "");
  const [defaultPickupAddress, setDefaultPickupAddress] = useState(profile?.defaultPickupAddress || "");
  const [fssaiNumber, setFssaiNumber] = useState(profile?.fssaiNumber || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);

  // Filter listings belonging to this donor
  const myDonations = useMemo(() => {
    if (!user) return [];
    return allListings.filter((l) => l.donorId === user.uid);
  }, [allListings, user]);

  const filteredDonations = useMemo(() => {
    if (filter === "all") return myDonations;
    if (filter === "active") return myDonations.filter((l) => l.status === "available");
    if (filter === "reserved") return myDonations.filter((l) => ["reserved", "assigned", "picked_up"].includes(l.status));
    if (filter === "completed") return myDonations.filter((l) => l.status === "completed");
    return myDonations;
  }, [myDonations, filter]);

  // Statistics
  const stats = useMemo(() => {
    const total = myDonations.length;
    const completed = myDonations.filter((l) => l.status === "completed");
    const active = myDonations.filter((l) => l.status === "available" || l.status === "reserved" || l.status === "assigned");
    const served = completed.reduce((acc, l) => acc + (l.quantityDistributed || l.quantity || 0), 0);
    const wasteSavedKg = Math.round(served * 0.45); // estimated ~450g per meal
    return { total, completed: completed.length, active: active.length, served, wasteSavedKg };
  }, [myDonations]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.uid, {
        name: name.trim() || profile?.name || "Donor",
        orgName: orgName.trim(),
        donorType: donorType as any,
        phone: phone.trim(),
        area: area.trim(),
        defaultPickupAddress: defaultPickupAddress.trim(),
        fssaiNumber: fssaiNumber.trim(),
        bio: bio.trim(),
        role: "donor",
      });
      toast.success("Donor profile updated successfully!");
      setActiveTab("donations");
    } catch (err) {
      toast.error((err as Error).message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSwitchRole(newRole: Role) {
    if (!user) return;
    try {
      await updateProfile(user.uid, { role: newRole });
      toast.success(`Role changed to ${newRole}!`);
    } catch (err) {
      toast.error("Failed to switch role.");
    }
  }

  async function logout() {
    try {
      const { auth } = await getFirebase();
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
      navigate({ to: "/auth", replace: true });
    } catch (err) {
      toast.error("Logout failed.");
    }
  }

  const displayName = profile?.orgName || profile?.name || user?.displayName || user?.email?.split("@")[0] || "Food Donor";
  const donorTypeLabel = DONOR_TYPES.find((d) => d.id === (profile?.donorType || donorType))?.label || "Food Donor";

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      {/* Donor Card Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/95 to-hero p-6 text-primary-foreground shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-saffron text-2xl font-bold text-saffron-foreground shadow-md">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-saffron/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-saffron">
                  <HeartHandshake className="size-3.5" /> Donor Profile
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium backdrop-blur">
                  <ShieldCheck className="size-3.5 text-success" /> Verified Partner
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{displayName}</h1>
              <p className="text-sm text-primary-foreground/80">{donorTypeLabel}</p>
              {profile?.email && <p className="text-xs text-primary-foreground/70">{profile.email}</p>}
            </div>
          </div>

          <button
            onClick={() => setActiveTab(activeTab === "edit" ? "donations" : "edit")}
            className="inline-flex items-center gap-1.5 self-start rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold backdrop-blur hover:bg-white/25"
          >
            <Edit3 className="size-3.5" />
            {activeTab === "edit" ? "View Profile" : "Edit Profile"}
          </button>
        </div>

        {/* Quick Contact & Location Tags */}
        <div className="mt-5 flex flex-wrap gap-2 border-t border-white/15 pt-4 text-xs text-primary-foreground/85">
          {(profile?.phone || phone) && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-black/15 px-2.5 py-1">
              <Phone className="size-3 text-saffron" /> {profile?.phone || phone}
            </span>
          )}
          {(profile?.area || area) && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-black/15 px-2.5 py-1">
              <MapPin className="size-3 text-saffron" /> {profile?.area || area}
            </span>
          )}
          {(profile?.fssaiNumber || fssaiNumber) && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-black/15 px-2.5 py-1">
              <ShieldCheck className="size-3 text-saffron" /> FSSAI: {profile?.fssaiNumber || fssaiNumber}
            </span>
          )}
        </div>
      </div>

      {/* Impact Statistics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-card">
          <p className="font-display text-3xl font-bold text-primary">{stats.total}</p>
          <p className="mt-1 text-xs text-muted-foreground">Total Listings</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-card">
          <p className="font-display text-3xl font-bold text-saffron">{stats.active}</p>
          <p className="mt-1 text-xs text-muted-foreground">Active Now</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-card">
          <p className="font-display text-3xl font-bold text-success">{stats.served}</p>
          <p className="mt-1 text-xs text-muted-foreground">Plates Served</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-card">
          <p className="font-display text-3xl font-bold text-chart-4">{stats.wasteSavedKg} kg</p>
          <p className="mt-1 text-xs text-muted-foreground">Waste Saved</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("donations")}
          className={`flex-1 border-b-2 py-3 text-sm font-semibold transition-colors ${
            activeTab === "donations" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          My Donations ({myDonations.length})
        </button>
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex-1 border-b-2 py-3 text-sm font-semibold transition-colors ${
            activeTab === "edit" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Donor Details
        </button>
        <button
          onClick={() => setActiveTab("role")}
          className={`flex-1 border-b-2 py-3 text-sm font-semibold transition-colors ${
            activeTab === "role" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Role & Settings
        </button>
      </div>

      {/* TAB 1: DONATIONS LIST */}
      {activeTab === "donations" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1.5 overflow-x-auto py-1">
              {(
                [
                  ["all", "All"],
                  ["active", "Live / Available"],
                  ["reserved", "In Progress"],
                  ["completed", "Completed"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    filter === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <Link
              to="/app/donate"
              className="inline-flex items-center gap-1.5 rounded-full bg-saffron px-4 py-1.5 text-xs font-semibold text-saffron-foreground shadow-warm hover:brightness-105"
            >
              <PlusCircle className="size-3.5" /> Donate food
            </Link>
          </div>

          {filteredDonations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <UtensilsCrossed className="mx-auto size-12 text-muted-foreground/60" />
              <h3 className="mt-3 text-lg font-bold">No food donations here yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Got surplus meals, bakery items, or cooked food? List them in under a minute!
              </p>
              <Link
                to="/app/donate"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-saffron px-5 py-2.5 text-sm font-semibold text-saffron-foreground shadow-warm"
              >
                <PlusCircle className="size-4" /> Publish your first donation
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredDonations.map((l) => (
                <div
                  key={l.id}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-card"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-full bg-saffron/15 px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
                        {l.category}
                      </span>
                      <StatusBadge status={l.status} />
                    </div>

                    <div className="mt-2 flex gap-3">
                      {l.photo ? (
                        <img src={l.photo} alt={l.title} className="size-16 shrink-0 rounded-xl object-cover" />
                      ) : (
                        <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                          <Package className="size-6" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-semibold text-foreground">{l.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {l.quantity} {l.unit} • <span className="capitalize">{l.foodType}</span>
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="size-3 shrink-0" /> <span className="truncate">{l.locationText}</span>
                        </p>
                      </div>
                    </div>

                    {/* Handover Code if reserved */}
                    {l.pickupCode && ["reserved", "assigned"].includes(l.status) && (
                      <div className="mt-3 flex items-center justify-between rounded-xl bg-saffron/15 px-3 py-2 text-xs">
                        <span className="font-medium text-accent-foreground">Pickup Code for Handover:</span>
                        <span className="font-mono text-sm font-bold tracking-widest text-primary">{l.pickupCode}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2.5 text-xs">
                    <UrgencyBadge deadline={l.pickupDeadline} />
                    <Link
                      to="/app/listing/$id"
                      params={{ id: l.id }}
                      className="font-semibold text-primary hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EDIT PROFILE */}
      {activeTab === "edit" && (
        <form onSubmit={handleSaveProfile} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div>
            <h2 className="text-xl font-bold">Donor Details & Kitchen Info</h2>
            <p className="text-xs text-muted-foreground">
              These details help NGOs and volunteers coordinate food pickups smoothly.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold">Contact Person Name</label>
              <input
                className="field"
                placeholder="e.g. Varis Khan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">Establishment / Kitchen Name</label>
              <input
                className="field"
                placeholder="e.g. Green Garden Restaurant"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold">Donor Category</label>
              <select
                className="field"
                value={donorType}
                onChange={(e) => setDonorType(e.target.value)}
              >
                {DONOR_TYPES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">Phone / WhatsApp Number</label>
              <input
                className="field"
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold">City / Locality</label>
              <input
                className="field"
                placeholder="e.g. GLA Campus, Mathura"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">FSSAI Registration No. (Optional)</label>
              <input
                className="field"
                placeholder="14-digit FSSAI number"
                value={fssaiNumber}
                onChange={(e) => setFssaiNumber(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold">Default Pickup Address & Landmark</label>
            <input
              className="field"
              placeholder="e.g. Kitchen Back Door, Gate No. 2, Campus"
              value={defaultPickupAddress}
              onChange={(e) => setDefaultPickupAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold">About your kitchen / Food policy (Bio)</label>
            <textarea
              className="field h-20 py-2 text-xs"
              placeholder="e.g. We prepare fresh buffet food daily and want surplus meals collected within 3 hours."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-saffron py-3 font-semibold text-saffron-foreground shadow-warm disabled:opacity-60"
          >
            {saving ? "Saving Profile…" : "Save Donor Profile"}
          </button>
        </form>
      )}

      {/* TAB 3: ROLE & SETTINGS */}
      {activeTab === "role" && (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div>
            <h2 className="text-xl font-bold">Account Role & Settings</h2>
            <p className="text-xs text-muted-foreground">
              Your account currently acts as a <b>{profile?.role?.toUpperCase() || "DONOR"}</b>.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold">Change Role</label>
            <div className="grid gap-2 sm:grid-cols-3">
              {(
                [
                  ["donor", "Food Donor", "Restaurants, hosts, mess"],
                  ["ngo", "NGO / Charity", "Distributes to hungry"],
                  ["volunteer", "Volunteer", "Picks up and delivers"],
                ] as const
              ).map(([r, title, desc]) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleSwitchRole(r)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    (profile?.role || "donor") === r
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <p className="text-sm font-bold">{title}</p>
                  <p className="text-[11px] text-muted-foreground">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              Email: <b>{profile?.email || user?.email}</b>
            </p>
            <p className="text-xs text-muted-foreground">
              User ID: <span className="font-mono text-[11px]">{user?.uid}</span>
            </p>
          </div>
        </div>
      )}

      {/* Logout button */}
      <button
        onClick={logout}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card py-3 font-semibold text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="size-4" /> Log out
      </button>
    </div>
  );
}
