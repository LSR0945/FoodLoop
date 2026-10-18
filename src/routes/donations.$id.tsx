import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  Flag,
  Heart,
  HeartHandshake,
  Lock,
  MapPin,
  Package,
  Phone,
  QrCode,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Thermometer,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { SafetyNote, StatusBadge, UrgencyBadge } from "@/components/ListingBits";
import { useAuth } from "@/lib/auth";
import {
  assignVolunteer,
  cancelListing,
  completeListing,
  markPickedUp,
  reportListing,
  reserveListing,
  useListing,
  useVolunteers,
} from "@/lib/db";
import { isOpen } from "@/lib/priority";
import { STATUS_LABEL } from "@/lib/types";

export const Route = createFileRoute("/donations/$id")({
  head: () => ({
    meta: [
      { title: "Donation Details — FoodLoop" },
      { name: "description", content: "View surplus food details, portion counts, allergens, and reservation options on FoodLoop." },
      { property: "og:title", content: "Donation Details — FoodLoop" },
      { property: "og:description", content: "View surplus food details, portion counts, allergens, and reservation options on FoodLoop." },
    ],
  }),
  component: DonationDetailPage,
});

const fmt = (ms: number) => new Date(ms).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

function DonationDetailPage() {
  const { id } = Route.useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { data: listing, loading } = useListing(id);
  const { data: volunteers } = useVolunteers();

  // Reservation & Action States
  const [reserveQuantity, setReserveQuantity] = useState<number>(0);
  const [pickupCodeInput, setPickupCodeInput] = useState("");
  const [distributionCount, setDistributionCount] = useState<number>(0);
  const [distributionNote, setDistributionNote] = useState("");
  const [selectedVolunteer, setSelectedVolunteer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [showGuestAuthPrompt, setShowGuestAuthPrompt] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("Hygiene or storage concern");
  const [reportDetails, setReportDetails] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5ED]">
        <header className="border-b border-[#E2DBD0] bg-white p-4">
          <div className="mx-auto max-w-4xl"><Logo /></div>
        </header>
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="aspect-[16/9] w-full animate-pulse rounded-3xl bg-[#EDE8DE]" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#F8F5ED]">
        <header className="border-b border-[#E2DBD0] bg-white p-4">
          <div className="mx-auto max-w-4xl"><Logo /></div>
        </header>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <UtensilsCrossed className="mx-auto size-12 text-[#656C62]/50" />
          <h1 className="mt-3 font-display text-2xl font-bold">Food Donation Not Found</h1>
          <p className="mt-2 text-sm text-[#656C62]">
            This listing may have already been claimed, completed, or withdrawn by the donor.
          </p>
          <Link
            to="/explore"
            className="mt-6 inline-flex rounded-full bg-[#205C43] px-6 py-2.5 text-xs font-bold text-white shadow-xs"
          >
            ← Explore other available food
          </Link>
        </div>
      </div>
    );
  }

  const isDonor = user?.uid === listing.donorId;
  const isReservedByMe = user?.uid === listing.reservedBy;
  const isVolunteerForMe = user?.uid === listing.volunteerId;
  const canSeePrivateDetails = Boolean(user && (isDonor || isReservedByMe || isVolunteerForMe || profile?.role === "admin"));
  const canSeePickupCode = Boolean(user && (isDonor || isReservedByMe || isVolunteerForMe));

  async function handleReserve() {
    if (!listing) return;
    if (!user) {
      // Save pending reservation intent and show modal
      try {
        localStorage.setItem("foodloop_pending_reserve_id", listing.id);
      } catch {}
      setShowGuestAuthPrompt(true);
      return;
    }

    if (!profile) return;
    setIsSubmitting(true);
    try {
      const qty = reserveQuantity > 0 ? reserveQuantity : listing.quantity;
      await reserveListing(listing, profile, qty);
      toast.success("Food reserved successfully! Your pickup code has been generated.");
    } catch (err) {
      toast.error((err as Error).message || "Could not reserve food.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleShare() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard! Share it with local shelters.");
    }
  }

  async function handleReportSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!listing) return;
    if (!reportDetails.trim()) {
      toast.error("Please provide some details for your report.");
      return;
    }
    await reportListing(listing.id, reportReason, reportDetails.trim(), user?.email || "Guest");
    toast.success("Thank you. Your report has been submitted to FoodLoop safety moderators.");
    setShowReportModal(false);
    setReportDetails("");
  }

  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#242923]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-[#E2DBD0] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#656C62] hover:text-[#205C43]"
            >
              <ArrowLeft className="size-3.5" /> Back to Explore
            </Link>
            {user ? (
              <Link
                to="/app"
                className="rounded-full bg-[#205C43] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs"
              >
                My Portal
              </Link>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-[#205C43] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Navigation Breadcrumb & Actions */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD5C8] bg-white px-3.5 py-1.5 text-xs font-bold text-[#205C43] shadow-xs hover:border-[#205C43] hover:bg-[#205C43]/5 transition-all"
          >
            <ArrowLeft className="size-3.5" /> All Food Listings
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD5C8] bg-white px-3.5 py-1.5 text-xs font-bold text-[#242923] shadow-xs hover:border-[#205C43]"
            >
              <Share2 className="size-3.5 text-[#205C43]" /> Share
            </button>
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center gap-1 rounded-full border border-[#DDD5C8] bg-white px-3 py-1.5 text-xs font-medium text-[#656C62] hover:text-destructive"
              title="Report issue"
            >
              <Flag className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Hero Photo & Gallery */}
        <div className="relative overflow-hidden rounded-3xl border border-[#DDD5C8] bg-white shadow-md">
          {listing.photo ? (
            <img
              src={listing.photo}
              alt={listing.title}
              className="h-80 sm:h-96 w-full object-cover"
            />
          ) : (
            <div className="grid h-80 place-items-center bg-[#EDE8DE] text-[#656C62]">
              <Package className="size-16" />
            </div>
          )}

          {/* Badges on Hero */}
          <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
            <StatusBadge status={listing.status} />
            {listing.status === "available" && <UrgencyBadge deadline={listing.pickupDeadline} />}
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#205C43] shadow-xs backdrop-blur-sm">
              {listing.category}
            </span>
          </div>

          <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold shadow-xs backdrop-blur-sm">
            {listing.foodType === "non-veg" ? "🔴 Non-Veg" : listing.foodType === "vegan" ? "🌱 Vegan" : "🟢 Veg"}
          </div>
        </div>

        {/* Food Details Main Body */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Left Column: Food Information */}
          <div className="space-y-6 lg:col-span-7">
            <div>
              <h1 className="font-display text-3xl font-extrabold sm:text-4xl text-[#242923]">
                {listing.title}
              </h1>
              <p className="mt-1 text-lg font-bold text-[#205C43]">
                {listing.quantity} {listing.unit} available
              </p>
              {listing.description && (
                <p className="mt-3 text-sm leading-relaxed text-[#656C62]">
                  {listing.description}
                </p>
              )}
            </div>

            {/* Preparation & Storage Key Details */}
            <div className="rounded-2xl border border-[#DDD5C8] bg-white p-5 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#656C62]">Food Integrity & Shelf-Life</h2>
              <div className="mt-3 grid gap-3.5 sm:grid-cols-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <Clock className="size-4 shrink-0 text-[#205C43]" />
                  <div>
                    <p className="font-bold text-[#242923]">Prepared</p>
                    <p className="text-[#656C62]">{fmt(listing.preparedAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Clock className="size-4 shrink-0 text-[#ED7545]" />
                  <div>
                    <p className="font-bold text-[#242923]">Pickup Deadline</p>
                    <p className="text-[#656C62]">{fmt(listing.pickupDeadline)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Thermometer className="size-4 shrink-0 text-[#205C43]" />
                  <div>
                    <p className="font-bold text-[#242923]">Storage Condition</p>
                    <p className="capitalize text-[#656C62]">
                      {listing.storage === "room" ? "Room Temperature" : `${listing.storage} Holding`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="size-4 shrink-0 text-[#3F8F62]" />
                  <div>
                    <p className="font-bold text-[#242923]">Hygiene Checklist</p>
                    <p className="text-[#3F8F62] font-semibold">100% Passed by Donor</p>
                  </div>
                </div>
              </div>

              {/* Declared Allergens */}
              <div className="mt-4 border-t border-[#DDD5C8] pt-3">
                <p className="text-xs font-bold text-[#242923]">Declared Allergens:</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {listing.allergens && listing.allergens.length > 0 ? (
                    listing.allergens.map((alg) => (
                      <span
                        key={alg}
                        className="rounded-full bg-[#ED7545]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#ED7545]"
                      >
                        ⚠️ {alg}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-[#3F8F62]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#3F8F62]">
                      ✓ No common allergens declared
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Pickup Location & Privacy Note (matching uploaded mobile layout) */}
            <div className="rounded-3xl border border-[#DDD5C8] bg-white p-6 shadow-xs overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#656C62]">Collection & Transit Route</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                  📍 Est. Distance: 2.5 km (8 mins)
                </span>
              </div>

              {/* Visual Route Preview Map Simulation (inspired by user mockup) */}
              <div className="relative h-44 w-full rounded-2xl bg-[#EAF2EC] border border-[#DDD5C8] overflow-hidden mb-4 flex flex-col justify-between p-4">
                {/* SVG Route Map Pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                  <path d="M-20 80 Q 120 40 220 90 T 450 70 T 700 110" fill="none" stroke="#205C43" strokeWidth="4" strokeDasharray="6 6" />
                  <circle cx="220" cy="90" r="7" fill="#ED7545" />
                  <circle cx="450" cy="70" r="7" fill="#205C43" />
                </svg>

                <div className="relative z-10 flex items-center justify-between">
                  <span className="rounded-xl bg-white/95 px-3 py-1 text-[11px] font-bold text-[#205C43] shadow-xs">
                    Dispatch Point
                  </span>
                  <span className="rounded-xl bg-white/95 px-3 py-1 text-[11px] font-bold text-[#ED7545] shadow-xs">
                    Destination Shelter
                  </span>
                </div>

                <div className="relative z-10 rounded-xl bg-white/95 p-3 shadow-sm border border-[#DDD5C8] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid size-7 place-items-center rounded-lg bg-[#205C43] text-white text-xs font-bold">
                      🍲
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#242923]">{listing.locationText}</p>
                      <p className="text-[10px] text-[#656C62]">Ready for immediate volunteer pickup</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-extrabold text-[#205C43]">
                    {listing.quantity} {listing.unit}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="size-5 shrink-0 text-[#205C43] mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#242923]">{listing.locationText}</p>
                  {canSeePrivateDetails ? (
                    <>
                      {listing.pickupInstructions && (
                        <p className="mt-2 text-xs text-[#656C62]">
                          <b>Instructions:</b> {listing.pickupInstructions}
                        </p>
                      )}
                      {listing.donorPhone && (
                        <p className="mt-2 text-xs text-[#205C43] font-bold flex items-center gap-1">
                          <Phone className="size-3.5" /> Direct Line: {listing.donorPhone}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#EDE8DE]/60 p-2.5 text-xs text-[#656C62]">
                      <Lock className="size-4 shrink-0 text-[#205C43]" />
                      <span>
                        Exact address & contact details unlock once your reservation is confirmed.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Donor Profile Card */}
            <div className="rounded-2xl border border-[#DDD5C8] bg-white p-5 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                {listing.donorAvatar ? (
                  <img src={listing.donorAvatar} alt={listing.donorName} className="size-12 rounded-full object-cover" />
                ) : (
                  <div className="grid size-12 place-items-center rounded-full bg-[#205C43]/10 font-bold text-[#205C43]">
                    {listing.donorName?.[0] || "D"}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-[#242923]">{listing.donorName}</p>
                    <span className="rounded-full bg-[#3F8F62]/15 px-2 py-0.2 text-[10px] font-bold text-[#3F8F62]">
                      Verified Donor
                    </span>
                  </div>
                  <p className="text-xs text-[#656C62]">Listed surplus meals on FoodLoop</p>
                </div>
              </div>
              <Link
                to="/people/$userId"
                params={{ userId: listing.donorId }}
                className="rounded-full border border-[#DDD5C8] px-3 py-1.5 text-xs font-bold text-[#205C43] hover:border-[#205C43]"
              >
                View Profile
              </Link>
            </div>

            <SafetyNote />
          </div>

          {/* Right Column: Reservation & Workflow Actions */}
          <div className="space-y-6 lg:col-span-5">
            {/* Primary Action Box */}
            <div className="rounded-3xl border border-[#DDD5C8] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#DDD5C8] pb-4">
                <div>
                  <span className="text-xs font-bold text-[#656C62]">Status</span>
                  <div className="mt-0.5">
                    <StatusBadge status={listing.status} />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#656C62]">Available Quantity</span>
                  <p className="text-lg font-extrabold text-[#205C43]">
                    {listing.quantity} {listing.unit}
                  </p>
                </div>
              </div>

              {/* Status Specific Workflow Controls */}
              <div className="mt-5 space-y-4">
                {/* 1. If Available: Reserve CTA */}
                {isOpen(listing) && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-[#242923]">
                        Portions to Reserve (Max: {listing.quantity})
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={listing.quantity}
                          defaultValue={listing.quantity}
                          onChange={(e) => setReserveQuantity(Number(e.target.value))}
                          className="w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] px-3.5 py-2 text-sm font-bold text-[#242923] focus:border-[#205C43] focus:outline-none"
                        />
                        <span className="text-xs font-semibold text-[#656C62]">{listing.unit}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleReserve}
                      className="w-full rounded-full bg-[#205C43] py-3.5 text-sm font-bold text-white shadow-sm hover:brightness-105 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? "Processing…" : "Reserve Surplus Food"}
                    </button>
                    <p className="text-center text-[11px] text-[#656C62]">
                      Free for verified shelters, orphanages, and community programs.
                    </p>
                  </div>
                )}

                {/* 2. Pickup Code Box (Displayed when Reserved / Assigned) */}
                {canSeePickupCode && listing.pickupCode && ["reserved", "assigned"].includes(listing.status) && (
                  <div className="rounded-2xl border-2 border-dashed border-[#ED7545] bg-[#ED7545]/10 p-5 text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#ED7545]">
                      Verification Pickup Code
                    </span>
                    <p className="my-2 font-display text-4xl font-extrabold tracking-[0.25em] text-[#242923]">
                      {listing.pickupCode}
                    </p>
                    <p className="text-xs text-[#656C62]">
                      {isDonor
                        ? "Ask the collector to show this code before handing over food."
                        : "Show this code to the donor at collection time."}
                    </p>
                  </div>
                )}

                {/* 3. Assign Volunteer (For Recipient) */}
                {isReservedByMe && listing.status === "reserved" && (
                  <div className="rounded-2xl bg-[#F8F5ED] p-4 text-xs space-y-2 border border-[#DDD5C8]">
                    <p className="font-bold text-[#242923]">Assign a Volunteer Courier</p>
                    <div className="flex gap-2">
                      <select
                        value={selectedVolunteer}
                        onChange={(e) => setSelectedVolunteer(e.target.value)}
                        className="w-full rounded-xl border border-[#DDD5C8] bg-white px-3 py-2 text-xs font-semibold"
                      >
                        <option value="">Select available courier…</option>
                        {volunteers.map((v) => (
                          <option key={v.uid} value={v.uid}>
                            {v.name} ({v.area || "City Courier"})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={!selectedVolunteer || isSubmitting}
                        onClick={async () => {
                          const v = volunteers.find((x) => x.uid === selectedVolunteer);
                          if (!v) return;
                          setIsSubmitting(true);
                          await assignVolunteer(listing, { uid: v.uid, name: v.name }, profile?.name || "Recipient");
                          setIsSubmitting(false);
                          toast.success("Volunteer assigned to pickup!");
                        }}
                        className="rounded-xl bg-[#205C43] px-4 py-2 font-bold text-white disabled:opacity-50"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. Volunteer / Recipient Handover Code Input */}
                {(isVolunteerForMe || isReservedByMe) && ["reserved", "assigned"].includes(listing.status) && (
                  <div className="rounded-2xl bg-[#F8F5ED] p-4 space-y-2 border border-[#DDD5C8]">
                    <p className="text-xs font-bold text-[#242923]">Confirm Pickup at Donor Location</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="Enter 4-digit code"
                        value={pickupCodeInput}
                        onChange={(e) => setPickupCodeInput(e.target.value)}
                        className="w-full rounded-xl border border-[#DDD5C8] bg-white px-3 py-2 text-center text-sm font-bold tracking-widest"
                      />
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={async () => {
                          if (pickupCodeInput !== listing.pickupCode) {
                            toast.error("Pickup code does not match donor's code.");
                            return;
                          }
                          setIsSubmitting(true);
                          await markPickedUp(listing, profile?.name || "Courier");
                          setIsSubmitting(false);
                          toast.success("Pickup confirmed!");
                        }}
                        className="rounded-xl bg-[#205C43] px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. Complete Distribution */}
                {(isReservedByMe || isVolunteerForMe) && listing.status === "picked_up" && (
                  <div className="rounded-2xl bg-[#3F8F62]/10 p-4 space-y-2.5 border border-[#3F8F62]/30">
                    <p className="text-xs font-bold text-[#205C43]">Record Successful Meal Distribution</p>
                    <input
                      type="number"
                      placeholder={`How many ${listing.unit} distributed?`}
                      min={1}
                      max={listing.quantity}
                      defaultValue={listing.quantity}
                      onChange={(e) => setDistributionCount(Number(e.target.value))}
                      className="w-full rounded-xl border border-[#DDD5C8] bg-white px-3 py-2 text-xs font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Distribution notes (e.g. served at Asha Shelter)"
                      value={distributionNote}
                      onChange={(e) => setDistributionNote(e.target.value)}
                      className="w-full rounded-xl border border-[#DDD5C8] bg-white px-3 py-2 text-xs"
                    />
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={async () => {
                        const count = distributionCount || listing.quantity;
                        setIsSubmitting(true);
                        await completeListing(listing, count, distributionNote || "Distributed to beneficiaries", profile?.name || "Collector");
                        setIsSubmitting(false);
                        toast.success("Donation completed! Thank you for closing the loop.");
                      }}
                      className="w-full rounded-full bg-[#3F8F62] py-2 text-xs font-bold text-white shadow-xs"
                    >
                      Complete Distribution 🎉
                    </button>
                  </div>
                )}

                {/* 6. Completed Note */}
                {listing.status === "completed" && (
                  <div className="rounded-2xl bg-[#3F8F62]/15 p-4 text-center">
                    <CheckCircle2 className="mx-auto size-8 text-[#3F8F62]" />
                    <p className="mt-1 font-bold text-sm text-[#205C43]">Donation Completed</p>
                    <p className="text-xs text-[#656C62]">
                      {listing.quantityDistributed || listing.quantity} {listing.unit} reached community members.
                    </p>
                  </div>
                )}

                {/* 7. Donor Withdraw Option */}
                {isDonor && ["available", "reserved"].includes(listing.status) && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm("Are you sure you want to withdraw this surplus food donation?")) {
                        await cancelListing(listing, profile?.name || "Donor");
                        toast.info("Donation withdrawn.");
                      }
                    }}
                    className="w-full rounded-full border border-destructive/40 py-2 text-xs font-bold text-destructive hover:bg-destructive/5"
                  >
                    Withdraw Donation
                  </button>
                )}
              </div>
            </div>

            {/* Timeline Log */}
            <div className="rounded-3xl border border-[#DDD5C8] bg-white p-6 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#656C62]">Donation History & Audit</h2>
              <div className="mt-4 space-y-3 border-l-2 border-[#DDD5C8] pl-3 text-xs">
                {listing.history &&
                  [...listing.history].reverse().map((h, i) => (
                    <div key={i} className="relative">
                      <span className="absolute -left-[19px] top-1 size-2 rounded-full bg-[#205C43]" />
                      <p className="font-bold text-[#242923]">{STATUS_LABEL[h.status]}</p>
                      <p className="text-[11px] text-[#656C62]">
                        {fmt(h.at)} · {h.by} {h.note ? `— ${h.note}` : ""}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Guest Authentication Modal */}
      {showGuestAuthPrompt && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-[#DDD5C8] bg-white p-6 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#205C43]/10 text-[#205C43]">
                <HeartHandshake className="size-6 text-[#ED7545]" />
              </div>
              <h3 className="mt-3 font-display text-xl font-bold text-[#242923]">
                Sign in to Reserve this Food
              </h3>
              <p className="mt-1 text-xs text-[#656C62] leading-relaxed">
                To maintain trust and safety for donors and beneficiaries, surplus reservations require a free FoodLoop account. We've saved your listing choice!
              </p>
            </div>

            <div className="mt-6 space-y-2.5">
              <Link
                to="/login"
                className="block w-full rounded-full bg-[#205C43] py-3 text-center text-xs font-bold text-white shadow-xs hover:brightness-105"
              >
                Sign In to Reserve
              </Link>
              <Link
                to="/signup"
                className="block w-full rounded-full border border-[#DDD5C8] py-3 text-center text-xs font-bold text-[#242923] hover:border-[#205C43]"
              >
                Create a Free Shelter / NGO Account
              </Link>
              <button
                type="button"
                onClick={() => setShowGuestAuthPrompt(false)}
                className="w-full rounded-xl py-2 text-center text-xs font-semibold text-[#656C62] hover:bg-black/5 transition-colors"
              >
                Continue browsing as guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleReportSubmit}
            className="w-full max-w-md rounded-3xl border border-[#DDD5C8] bg-white p-6 shadow-2xl space-y-4"
          >
            <div>
              <h3 className="font-display text-lg font-bold text-[#242923]">Report Food Listing</h3>
              <p className="text-xs text-[#656C62]">
                Our safety moderators review all community reports promptly.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#242923]">Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] px-3 py-2 text-xs font-semibold text-[#242923]"
              >
                <option>Hygiene or storage concern</option>
                <option>Inaccurate portions or description</option>
                <option>Unresponsive donor or invalid pickup address</option>
                <option>Food appears expired or spoiled</option>
                <option>Other policy violation</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#242923]">Details</label>
              <textarea
                rows={3}
                required
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Explain the safety or policy concern…"
                className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] p-3 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="rounded-full px-4 py-2 text-xs font-bold text-[#656C62]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-destructive px-5 py-2 text-xs font-bold text-white shadow-xs"
              >
                Submit Report
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
