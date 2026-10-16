import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Award,
  Bike,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Edit3,
  HeartHandshake,
  LogOut,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  PlusCircle,
  Printer,
  Share2,
  ShieldCheck,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge, UrgencyBadge } from "@/components/ListingBits";
import { useAuth } from "@/lib/auth";
import { compressImage, updateProfile, useListings } from "@/lib/db";
import { getFirebase } from "@/lib/firebase";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Donor Profile — BhojanBandhu" },
      { name: "description", content: "Your BhojanBandhu Donor profile, active food donations, and community impact." },
      { property: "og:title", content: "Donor Profile — BhojanBandhu" },
      { property: "og:description", content: "Your BhojanBandhu Donor profile, active food donations, and community impact." },
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

  const [activeTab, setActiveTab] = useState<"donations" | "edit" | "certificate" | "role">("donations");
  const [filter, setFilter] = useState<"all" | "active" | "reserved" | "completed">("all");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPic, setUploadingPic] = useState(false);

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

  const currentRole: Role = profile?.role || "donor";

  // Filter listings based on current user role
  const myDonations = useMemo(() => {
    if (!user) return [];
    if (currentRole === "ngo") return allListings.filter((l) => l.reservedBy === user.uid);
    if (currentRole === "volunteer") return allListings.filter((l) => l.volunteerId === user.uid);
    return allListings.filter((l) => l.donorId === user.uid);
  }, [allListings, user, currentRole]);

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
    const active = myDonations.filter((l) => l.status === "available" || l.status === "reserved" || l.status === "assigned" || l.status === "picked_up");
    const served = completed.reduce((acc, l) => acc + (l.quantityDistributed || l.quantity || 0), 0);
    const wasteSavedKg = Math.round(served * 0.45); // estimated ~450g per meal
    return { total, completed: completed.length, active: active.length, served, wasteSavedKg };
  }, [myDonations]);

  // Profile Picture Upload Handler
  async function handleAvatarUpload(f?: File) {
    if (!f || !user) return;
    setUploadingPic(true);
    try {
      const compressed = await compressImage(f, 400, 0.75);
      await updateProfile(user.uid, { photoURL: compressed });
      toast.success("Profile photo updated successfully!");
    } catch {
      toast.error("Failed to upload photo. Please try a different image.");
    } finally {
      setUploadingPic(false);
    }
  }

  async function handleRemoveAvatar() {
    if (!user) return;
    try {
      await updateProfile(user.uid, { photoURL: "" });
      toast.success("Profile photo removed.");
    } catch {
      toast.error("Could not remove photo.");
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.uid, {
        name: name.trim() || profile?.name || "User",
        orgName: orgName.trim(),
        donorType: donorType as any,
        phone: phone.trim(),
        area: area.trim(),
        defaultPickupAddress: defaultPickupAddress.trim(),
        fssaiNumber: fssaiNumber.trim(),
        bio: bio.trim(),
        role: currentRole,
      });
      toast.success("Profile updated successfully!");
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
    } catch {
      toast.error("Failed to switch role.");
    }
  }

  function shareOnWhatsApp(l: typeof myDonations[0]) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const text = `🚨 *URGENT FOOD DONATION - BhojanBandhu*\n\n🍲 *Item:* ${l.title}\n📦 *Quantity:* ${l.quantity} ${l.unit} (${l.foodType})\n📍 *Location:* ${l.locationText}\n⏰ *Pickup Before:* ${new Date(l.pickupDeadline).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}\n\n👉 *Claim / View Details:* ${origin}/app/listing/${l.id}\n\n_Distributed via BhojanBandhu — Koi Bhookha Na Soye_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  }

  function copyImpactSummary() {
    const text = `🌟 Proud to be a Verified Food Donor on BhojanBandhu!\n\n🍲 Total Meals Served: ${stats.served} plates\n🌱 Food Waste Prevented: ${stats.wasteSavedKg} kg\n🙌 Join us in ending food waste: ${typeof window !== "undefined" ? window.location.origin : ""}`;
    navigator.clipboard.writeText(text);
    toast.success("Impact summary copied to clipboard!");
  }

  async function logout() {
    try {
      const { auth } = await getFirebase();
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
      navigate({ to: "/auth", replace: true });
    } catch {
      toast.error("Logout failed.");
    }
  }

  const displayName = profile?.orgName || profile?.name || user?.displayName || user?.email?.split("@")[0] || "Food Donor";
  const donorTypeLabel = DONOR_TYPES.find((d) => d.id === (profile?.donorType || donorType))?.label || "Food Donor";

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      {/* Hidden File Input for Avatar Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
      />

      {/* Donor Card Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/95 to-hero p-6 text-primary-foreground shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            {/* Clickable Profile Avatar */}
            <div className="group relative shrink-0">
              {profile?.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={displayName}
                  className="size-20 rounded-2xl object-cover ring-2 ring-saffron shadow-md"
                />
              ) : (
                <div className="grid size-20 place-items-center rounded-2xl bg-saffron text-3xl font-bold text-saffron-foreground shadow-md">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPic}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/50 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-xs"
                title="Change Photo"
              >
                <Camera className="size-5 mb-0.5" />
                {uploadingPic ? "Saving…" : "Upload"}
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-saffron/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-saffron">
                  {currentRole === "ngo" ? (
                    <>
                      <Building2 className="size-3.5" /> NGO Partner
                    </>
                  ) : currentRole === "volunteer" ? (
                    <>
                      <Bike className="size-3.5" /> Delivery Volunteer
                    </>
                  ) : (
                    <>
                      <HeartHandshake className="size-3.5" /> Food Donor
                    </>
                  )}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium backdrop-blur">
                  <ShieldCheck className="size-3.5 text-emerald-400" /> BhojanBandhu Verified
                </span>
              </div>

              {/* 1-Click Role Switcher Pill */}
              <div className="mt-2.5 flex items-center gap-1 rounded-full bg-black/25 p-1 backdrop-blur max-w-fit">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 px-2">Role:</span>
                {(["donor", "ngo", "volunteer"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleSwitchRole(r)}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize transition-colors ${
                      currentRole === r
                        ? "bg-saffron text-saffron-foreground shadow-xs"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {r === "donor" ? "🍲 Donor" : r === "ngo" ? "🏢 NGO" : "🚴 Volunteer"}
                  </button>
                ))}
              </div>

              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{displayName}</h1>
              <p className="text-sm text-primary-foreground/80">{currentRole === "donor" ? donorTypeLabel : currentRole === "ngo" ? "Registered NGO Partner" : "Active Community Volunteer"}</p>
              {profile?.email && <p className="text-xs text-primary-foreground/70">{profile.email}</p>}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur hover:bg-white/25"
            >
              <Camera className="size-3.5" />
              Photo
            </button>
            <button
              onClick={() => setActiveTab(activeTab === "edit" ? "donations" : "edit")}
              className="inline-flex items-center gap-1.5 rounded-full bg-saffron px-3.5 py-1.5 text-xs font-semibold text-saffron-foreground shadow-sm hover:brightness-105"
            >
              <Edit3 className="size-3.5" />
              {activeTab === "edit" ? "View" : "Edit Details"}
            </button>
          </div>
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
          <p className="mt-1 text-xs text-muted-foreground">Active Live</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-card">
          <p className="font-display text-3xl font-bold text-emerald-600">{stats.served}</p>
          <p className="mt-1 text-xs text-muted-foreground">Plates Served</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-card">
          <p className="font-display text-3xl font-bold text-amber-600">{stats.wasteSavedKg} kg</p>
          <p className="mt-1 text-xs text-muted-foreground">Waste Prevented</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        <button
          onClick={() => setActiveTab("donations")}
          className={`flex-1 min-w-[110px] border-b-2 py-3 text-sm font-semibold transition-colors ${
            activeTab === "donations" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {currentRole === "donor" ? `My Food (${myDonations.length})` : currentRole === "ngo" ? `Claimed Food (${myDonations.length})` : `My Tasks (${myDonations.length})`}
        </button>
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex-1 min-w-[110px] border-b-2 py-3 text-sm font-semibold transition-colors ${
            activeTab === "edit" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Edit Profile
        </button>
        <button
          onClick={() => setActiveTab("certificate")}
          className={`flex-1 min-w-[120px] border-b-2 py-3 text-sm font-semibold transition-colors ${
            activeTab === "certificate" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Impact Certificate
        </button>
        <button
          onClick={() => setActiveTab("role")}
          className={`flex-1 min-w-[90px] border-b-2 py-3 text-sm font-semibold transition-colors ${
            activeTab === "role" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Settings
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
                  ["reserved", "In Handover"],
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

            {currentRole === "donor" ? (
              <Link
                to="/app/donate"
                className="inline-flex items-center gap-1.5 rounded-full bg-saffron px-4 py-1.5 text-xs font-semibold text-saffron-foreground shadow-warm hover:brightness-105"
              >
                <PlusCircle className="size-3.5" /> Donate food
              </Link>
            ) : (
              <Link
                to="/app"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:brightness-105"
              >
                <PlusCircle className="size-3.5" /> Browse Food Feed
              </Link>
            )}
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

                    <div className="mt-2.5 flex gap-3">
                      {l.photo ? (
                        <img src={l.photo} alt={l.title} className="size-16 shrink-0 rounded-xl object-cover" />
                      ) : (
                        <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                          <Package className="size-6" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-semibold text-foreground">{l.title}</h4>
                        <p className="text-xs font-semibold text-primary">
                          {l.quantity} {l.unit} • <span className="capitalize">{l.foodType}</span>
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="size-3 shrink-0" /> <span className="truncate">{l.locationText}</span>
                        </p>
                      </div>
                    </div>

                    {/* Handover Verification Code */}
                    {l.pickupCode && ["reserved", "assigned"].includes(l.status) && (
                      <div className="mt-3 flex items-center justify-between rounded-xl bg-saffron/15 px-3 py-2 text-xs">
                        <div>
                          <p className="font-semibold text-accent-foreground">Handover Code:</p>
                          <p className="text-[10px] text-muted-foreground">Share with collector at doorstep</p>
                        </div>
                        <span className="font-mono text-base font-extrabold tracking-widest text-primary">{l.pickupCode}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between border-t border-border bg-muted/30 px-3.5 py-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => shareOnWhatsApp(l)}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-600/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-600/20"
                    >
                      <MessageCircle className="size-3" /> WhatsApp
                    </button>

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

          {/* Avatar Upload Card inside Edit Tab */}
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-muted/30 p-4">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="Avatar preview" className="size-16 rounded-2xl object-cover ring-2 ring-saffron" />
            ) : (
              <div className="grid size-16 place-items-center rounded-2xl bg-saffron text-2xl font-bold text-saffron-foreground">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="space-y-1">
              <p className="text-xs font-semibold">Donor Profile Picture / Logo</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm"
                >
                  Upload new photo
                </button>
                {profile?.photoURL && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="inline-flex items-center gap-1 rounded-full border border-destructive/30 px-2.5 py-1 text-xs text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3" /> Remove
                  </button>
                )}
              </div>
            </div>
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

      {/* TAB 3: DIGITAL IMPACT CERTIFICATE */}
      {activeTab === "certificate" && (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl border-4 border-amber-400/60 bg-gradient-to-b from-amber-50 via-card to-amber-50/30 p-8 text-center shadow-xl dark:from-card dark:via-card dark:to-card">
            {/* Ornamental Corners */}
            <div className="absolute left-3 top-3 size-6 border-l-2 border-t-2 border-amber-500" />
            <div className="absolute right-3 top-3 size-6 border-r-2 border-t-2 border-amber-500" />
            <div className="absolute bottom-3 left-3 size-6 border-b-2 border-l-2 border-amber-500" />
            <div className="absolute bottom-3 right-3 size-6 border-b-2 border-r-2 border-amber-500" />

            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-saffron text-white shadow-md">
              <Award className="size-8" />
            </div>

            <p className="mt-3 text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              Certificate of Humanitarian Impact
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Community Hunger Hero</h2>

            <p className="mt-4 text-xs text-muted-foreground">This certificate is proudly awarded to</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-primary underline decoration-saffron underline-offset-4">
              {displayName}
            </p>

            <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-muted-foreground">
              In profound appreciation of their unwavering commitment to bridging surplus food with hungry communities,
              preventing food waste, and championing the mission: <i>“Koi Bhookha Na Soye.”</i>
            </p>

            {/* Impact Metric Chips on Certificate */}
            <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-amber-300/40 bg-card p-3 shadow-sm">
                <p className="font-display text-xl font-bold text-primary">{stats.served}</p>
                <p className="text-[10px] text-muted-foreground">Meals Distributed</p>
              </div>
              <div className="rounded-xl border border-amber-300/40 bg-card p-3 shadow-sm">
                <p className="font-display text-xl font-bold text-saffron">{stats.wasteSavedKg} kg</p>
                <p className="text-[10px] text-muted-foreground">Waste Prevented</p>
              </div>
              <div className="col-span-2 rounded-xl border border-amber-300/40 bg-card p-3 shadow-sm sm:col-span-1">
                <p className="font-display text-xl font-bold text-emerald-600">{stats.total}</p>
                <p className="text-[10px] text-muted-foreground">Donations Listed</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4 text-[11px] text-muted-foreground">
              <div className="text-left">
                <p className="font-semibold text-foreground">BhojanBandhu Foundation</p>
                <p>Verified Community Initiative</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">Date: {new Date().toLocaleDateString()}</p>
                <p className="font-mono text-[10px]">ID: {user?.uid.slice(0, 10).toUpperCase()}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card py-2.5 text-xs font-semibold shadow-card hover:bg-muted"
            >
              <Printer className="size-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={copyImpactSummary}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-saffron py-2.5 text-xs font-semibold text-saffron-foreground shadow-warm hover:brightness-105"
            >
              <Share2 className="size-3.5" /> Share Impact Summary
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: ROLE & SETTINGS */}
      {activeTab === "role" && (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div>
            <h2 className="text-xl font-bold">Account Role & Settings</h2>
            <p className="text-xs text-muted-foreground">
              Your account currently acts as a <b>{profile?.role?.toUpperCase() || "DONOR"}</b> on BhojanBandhu.
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
        <LogOut className="size-4" /> Log out from BhojanBandhu
      </button>
    </div>
  );
}
