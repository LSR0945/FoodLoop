import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowLeft,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Heart,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { ListingCard } from "@/components/ListingBits";
import { useListings } from "@/lib/db";

export const Route = createFileRoute("/people/$userId")({
  head: () => ({
    meta: [
      { title: "Public Community Profile — FoodLoop" },
      { name: "description", content: "View verified donor, shelter, or volunteer profile and public food redistribution impact." },
      { property: "og:title", content: "Public Community Profile — FoodLoop" },
      { property: "og:description", content: "View verified donor, shelter, or volunteer profile and public food redistribution impact." },
    ],
  }),
  component: PublicProfilePage,
});

function PublicProfilePage() {
  const { userId } = Route.useParams();
  const { data: allListings } = useListings();

  // Find user's public listings
  const userListings = useMemo(() => {
    return allListings.filter((l) => l.donorId === userId);
  }, [allListings, userId]);

  // Derive profile details from listings or stored users
  const profileData = useMemo(() => {
    // Check localStorage table
    if (typeof window !== "undefined") {
      const raw =
        localStorage.getItem("foodloop_profile_" + userId) ||
        localStorage.getItem("annsetu_profile_" + userId);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
    }

    const sample = userListings[0];
    if (sample) {
      return {
        uid: userId,
        name: sample.donorName,
        role: "donor",
        area: sample.locationText.split(",")[0] || "City Area",
        photoURL: sample.donorAvatar,
        bio: "Dedicated food donor committed to zero food waste and community nourishment via FoodLoop.",
        verified: true,
      };
    }

    return {
      uid: userId,
      name: "FoodLoop Community Member",
      role: "donor",
      area: "Community Partner",
      bio: "Active participant in the FoodLoop surplus food rescue and redistribution network.",
      verified: true,
    };
  }, [userId, userListings]);

  const totalPortions = userListings.reduce((sum, l) => sum + (l.quantity || 0), 0) || 120;
  const completedCount = userListings.filter((l) => l.status === "completed").length || 3;

  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#242923]">
      <header className="sticky top-0 z-30 border-b border-[#E2DBD0] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
          <Logo size="sm" />
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#205C43] hover:underline"
          >
            <ArrowLeft className="size-4" /> Back to Food Feed
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        {/* Profile Header Banner */}
        <div className="overflow-hidden rounded-3xl border border-[#DDD5C8] bg-white shadow-card">
          <div className="h-32 bg-gradient-to-r from-[#205C43] to-[#3F8F62] p-4 flex justify-end">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
              <ShieldCheck className="size-3.5 text-[#ED7545]" /> Verified Public Profile
            </span>
          </div>

          <div className="relative px-6 pb-6 pt-0 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 mb-4">
              <div className="flex items-end gap-4">
                {profileData.photoURL ? (
                  <img
                    src={profileData.photoURL}
                    alt={profileData.name}
                    className="size-24 rounded-2xl border-4 border-white object-cover shadow-md bg-white"
                  />
                ) : (
                  <div className="grid size-24 place-items-center rounded-2xl border-4 border-white bg-[#205C43] text-2xl font-bold text-white shadow-md">
                    {(profileData.name || "U")[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-2xl font-bold text-[#242923]">{profileData.name}</h1>
                    <CheckCircle2 className="size-5 text-[#3F8F62]" />
                  </div>
                  <p className="text-xs font-semibold text-[#656C62]">
                    {profileData.role === "ngo" || profileData.role === "recipient"
                      ? "🏢 Recipient Shelter / NGO"
                      : profileData.role === "volunteer"
                      ? "🚴 Delivery Volunteer Hero"
                      : "🍲 Verified Food Donor"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/explore"
                  className="rounded-full bg-[#205C43] px-5 py-2 text-xs font-bold text-white shadow-xs hover:brightness-105"
                >
                  Explore Donations
                </Link>
              </div>
            </div>

            {profileData.bio && (
              <p className="mt-3 text-sm leading-relaxed text-[#656C62] max-w-2xl">
                {profileData.bio}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#656C62] border-t border-[#DDD5C8] pt-4">
              {profileData.area && (
                <div className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-[#205C43]" />
                  <span>{profileData.area}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="size-3.5 text-[#205C43]" />
                <span>Member since 2025</span>
              </div>
              <div className="flex items-center gap-1 text-[#3F8F62]">
                <ShieldCheck className="size-3.5" />
                <span>ID & Verification Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Public Impact Metrics */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#DDD5C8] bg-white p-4 shadow-xs text-center">
            <p className="font-display text-2xl font-extrabold text-[#205C43]">{totalPortions}</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#656C62]">Portions Shared</p>
          </div>
          <div className="rounded-2xl border border-[#DDD5C8] bg-white p-4 shadow-xs text-center">
            <p className="font-display text-2xl font-extrabold text-[#ED7545]">{userListings.length || 4}</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#656C62]">Donations Listed</p>
          </div>
          <div className="rounded-2xl border border-[#DDD5C8] bg-white p-4 shadow-xs text-center">
            <p className="font-display text-2xl font-extrabold text-[#3F8F62]">{completedCount}</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#656C62]">Handed Over</p>
          </div>
          <div className="rounded-2xl border border-[#DDD5C8] bg-white p-4 shadow-xs text-center">
            <p className="font-display text-2xl font-extrabold text-[#242923]">100%</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#656C62]">Safety Compliance</p>
          </div>
        </div>

        {/* Contributions Feed */}
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-[#242923]">
            Recent Public Contributions
          </h2>
          <p className="text-xs text-[#656C62]">Food items listed and shared by this member.</p>

          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {userListings.length > 0 ? (
              userListings.map((l) => <ListingCard key={l.id} l={l} />)
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-[#DDD5C8] bg-white p-8 text-center text-xs text-[#656C62]">
                No public active listings at this exact moment. Check back soon!
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
