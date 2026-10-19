import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Bike,
  Building2,
  Heart,
  MapPin,
  PlusCircle,
  Search,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import type { AuthUser } from "@/lib/supabase-auth";
import type { Listing, Profile } from "@/lib/types";

type Props = {
  user: AuthUser | null;
  profile: Profile | null;
  listings: Listing[];
  totalMeals: number;
};

export function MobileHome({ user, profile, listings, totalMeals }: Props) {
  const firstName = (profile?.name || user?.displayName || "").split(" ")[0];
  const portal =
    profile?.role === "donor"
      ? "/donor"
      : profile?.role === "volunteer"
        ? "/volunteer"
        : profile?.role === "admin"
          ? "/admin"
          : "/recipient";

  const livePortions = listings.reduce((sum, l) => sum + (l.quantity || 0), 0);

  const quickActions = [
    { label: "Donate", icon: PlusCircle, to: user ? portal : "/login" },
    { label: "Request", icon: Building2, to: user ? "/recipient" : "/login" },
    { label: "Volunteer", icon: Bike, to: user ? "/volunteer" : "/login" },
    { label: "Community", icon: Users, to: "/community" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#242923]">
      {/* ===== Native app bar ===== */}
      <header className="sticky top-0 z-40 border-b border-[#E2DBD0]/70 bg-[#F8F5ED]/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-2.5">
          <Logo size="sm" showTagline={false} />
          <div className="flex items-center gap-2">
            <Link
              to="/community"
              aria-label="Community"
              className="grid size-9 place-items-center rounded-full border border-[#E2DBD0] bg-white text-[#205C43] shadow-xs transition-transform active:scale-90"
            >
              <Bell className="size-4" />
            </Link>
            {user ? (
              <Link
                to={portal}
                aria-label="My portal"
                className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-[#164330] to-[#3F8F62] text-xs font-extrabold text-white shadow-md transition-transform active:scale-90"
              >
                {(firstName?.[0] || "U").toUpperCase()}
              </Link>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-[#205C43] px-3.5 py-1.5 text-[11px] font-bold text-white shadow-xs transition-transform active:scale-95"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ===== Greeting + hero ===== */}
      <section className="px-4 pt-5">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#3F8F62]">
          🙏 Namaste{firstName ? `, ${firstName}` : ""}
        </p>
        <h1 className="mt-1.5 font-display text-[26px] font-extrabold leading-[1.15] text-[#164330]">
          Rescue surplus food.
          <br />
          <span className="text-[#ED7545]">Fight hunger together.</span>
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-[#656C62]">
          Fresh surplus meals from kitchens near you — claim, pick up and share.
        </p>

        {/* Search pill → Explore */}
        <Link
          to="/explore"
          className="mt-4 flex items-center gap-2.5 rounded-2xl border border-[#E2DBD0] bg-white px-4 py-3 shadow-xs transition-transform active:scale-[0.98]"
        >
          <Search className="size-4 shrink-0 text-[#3F8F62]" />
          <span className="text-xs font-semibold text-[#656C62]">Search meals, categories, donors…</span>
        </Link>

        {/* Primary CTA duo */}
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <Link
            to={user ? portal : "/login"}
            className="rounded-2xl bg-gradient-to-br from-[#164330] to-[#205C43] p-3.5 text-white shadow-md transition-transform active:scale-[0.97]"
          >
            <span className="grid size-8 place-items-center rounded-xl bg-white/15">
              <UtensilsCrossed className="size-4" />
            </span>
            <p className="mt-2 text-sm font-extrabold">Donate Food</p>
            <p className="text-[10px] text-white/70">List surplus in 60 sec</p>
          </Link>
          <Link
            to="/explore"
            className="rounded-2xl bg-gradient-to-br from-[#ED7545] to-[#F59E0B] p-3.5 text-white shadow-md transition-transform active:scale-[0.97]"
          >
            <span className="grid size-8 place-items-center rounded-xl bg-white/20">
              <Heart className="size-4" />
            </span>
            <p className="mt-2 text-sm font-extrabold">Find Food</p>
            <p className="text-[10px] text-white/75">Claim nearby meals</p>
          </Link>
        </div>

        {/* Live impact strip */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-[#E2DBD0] bg-white px-2 py-2.5 text-center shadow-xs">
            <p className="text-base font-extrabold leading-none text-[#205C43]">{listings.length}</p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-[#656C62]">Live Now</p>
          </div>
          <div className="rounded-2xl border border-[#E2DBD0] bg-white px-2 py-2.5 text-center shadow-xs">
            <p className="text-base font-extrabold leading-none text-[#ED7545]">{livePortions.toLocaleString()}</p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-[#656C62]">Portions</p>
          </div>
          <div className="rounded-2xl border border-[#E2DBD0] bg-white px-2 py-2.5 text-center shadow-xs">
            <p className="text-base font-extrabold leading-none text-[#3F8F62]">{totalMeals.toLocaleString()}</p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-[#656C62]">Meals Shared</p>
          </div>
        </div>
      </section>

      {/* ===== Live donations carousel ===== */}
      <section className="mt-5">
        <div className="flex items-center justify-between px-4">
          <h2 className="font-display text-base font-extrabold text-[#242923]">Live near you</h2>
          <Link to="/explore" className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#205C43] transition-transform active:scale-95">
            See all <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="no-scrollbar mt-2.5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
          {listings.map((l) => (
            <Link
              key={l.id}
              to="/donations/$id"
              params={{ id: l.id }}
              className="w-[215px] shrink-0 snap-start overflow-hidden rounded-2xl border border-[#E2DBD0] bg-white shadow-xs transition-transform active:scale-[0.97]"
            >
              <div className="relative h-28 w-full overflow-hidden bg-[#EDE8DE]">
                {l.photo && <img src={l.photo} alt={l.title} loading="lazy" className="h-full w-full object-cover" />}
                <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[#205C43] backdrop-blur-sm">
                  Live
                </span>
                <span className="absolute right-2 top-2 rounded-full bg-[#164330]/85 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                  {l.quantity} {l.unit}
                </span>
              </div>
              <div className="p-2.5">
                <p className="truncate text-xs font-extrabold text-[#242923]">{l.title}</p>
                <p className="mt-1 flex items-center gap-1 truncate text-[10px] text-[#656C62]">
                  <MapPin className="size-3 shrink-0 text-[#3F8F62]" />
                  {l.donorName}
                </p>
              </div>
            </Link>
          ))}
          {listings.length === 0 && (
            <div className="w-full rounded-2xl border border-dashed border-[#DDD5C8] bg-white/60 px-4 py-6 text-center">
              <p className="text-xs font-bold text-[#656C62]">No live donations right now.</p>
              <p className="mt-1 text-[10px] text-[#656C62]/80">Check back soon or explore nearby areas.</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== Quick actions ===== */}
      <section className="mt-5 px-4">
        <h2 className="font-display text-base font-extrabold text-[#242923]">Quick actions</h2>
        <div className="mt-2.5 grid grid-cols-4 gap-2">
          {quickActions.map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-[#E2DBD0] bg-white px-1 py-3 shadow-xs transition-transform active:scale-95"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-[#205C43]/10 text-[#205C43]">
                <a.icon className="size-4" />
              </span>
              <span className="text-[10px] font-bold text-[#242923]">{a.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="mt-5 px-4">
        <div className="rounded-3xl bg-gradient-to-br from-[#164330] to-[#205C43] p-4 text-white shadow-lg">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#F59E0B]">How it works</p>
          <div className="mt-3 space-y-2.5">
            {[
              "Snap & list surplus food in under 60 seconds",
              "Nearby verified shelters claim and reserve it",
              "A volunteer delivers — good food never wasted",
            ].map((step, i) => (
              <div key={step} className="flex items-center gap-2.5">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/15 text-[10px] font-extrabold">
                  {i + 1}
                </span>
                <p className="text-[11px] font-semibold leading-snug text-white/90">{step}</p>
              </div>
            ))}
          </div>
          <Link
            to="/how-it-works"
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold text-[#F59E0B] transition-transform active:scale-95"
          >
            Learn more <ArrowRight className="size-3" />
          </Link>
        </div>
      </section>

      {/* ===== Join banner ===== */}
      <section className="mt-4 px-4 pb-6">
        <div className="flex items-center gap-3 rounded-3xl border border-[#205C43]/15 bg-[#205C43]/5 p-3.5">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-xl shadow-xs">🍲</div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold text-[#164330]">Become a Food Hero</p>
            <p className="text-[10px] leading-snug text-[#656C62]">Join 2,400+ members rescuing meals daily.</p>
          </div>
          <Link
            to={user ? portal : "/signup"}
            className="shrink-0 rounded-full bg-[#ED7545] px-3.5 py-2 text-[10px] font-extrabold text-white shadow-sm transition-transform active:scale-95"
          >
            Join
          </Link>
        </div>
      </section>
    </div>
  );
}
