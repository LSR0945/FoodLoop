import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Heart,
  Leaf,
  MapPin,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome — FoodLoop" },
      {
        name: "description",
        content: "Join FoodLoop — rescue surplus food and get it to people who need it.",
      },
    ],
  }),
  component: WelcomePage,
});

const FEATURES = [
  { icon: UtensilsCrossed, title: "Rescue", sub: "Surplus food" },
  { icon: Heart, title: "Share", sub: "Nearby shelters" },
  { icon: ShieldCheck, title: "Track", sub: "Live impact" },
];

const STATS = [
  { value: "14,250+", label: "Meals shared" },
  { value: "48", label: "Shelter homes" },
  { value: "2,400+", label: "Food heroes" },
];

const AVATARS = [
  { initial: "A", gradient: "from-[#ED7545] to-[#F59E0B]" },
  { initial: "R", gradient: "from-[#3F8F62] to-[#205C43]" },
  { initial: "S", gradient: "from-[#F59E0B] to-[#ED7545]" },
  { initial: "M", gradient: "from-[#6366F1] to-[#4338CA]" },
];

function WelcomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#071B12] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#06170F] via-[#0C2C1E] to-[#071B12]" />
        <img
          src="/images/food/dal_khichdi_roti.jpg"
          alt=""
          className="absolute -right-32 top-1/4 h-[42rem] w-[42rem] object-cover opacity-[0.07] blur-[2px]"
        />
        <img
          src="/images/food/wheat_bread_buns.jpg"
          alt=""
          className="absolute -left-40 bottom-0 h-[30rem] w-[30rem] object-cover opacity-[0.05] blur-[2px]"
        />
        <div className="absolute -top-40 right-1/4 size-[30rem] rounded-full bg-[#3F8F62]/20 blur-3xl" />
        <div className="absolute top-1/3 -left-40 size-[26rem] rounded-full bg-[#ED7545]/15 blur-3xl" />
        <div className="absolute -bottom-32 right-0 size-[24rem] rounded-full bg-[#205C43]/40 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(#F8F5ED 0.7px, transparent 0.7px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(63,143,98,0.18),transparent_60%)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-[max(1.25rem,env(safe-area-inset-top,0px))] sm:px-8 lg:px-12">
        <header className="animate-in fade-in flex items-center justify-between py-2 duration-500">
          <Logo light size="md" showTagline={false} />
          <Link
            to="/login"
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[11px] font-bold text-white/80 backdrop-blur-md transition-all duration-200 hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-95"
          >
            Sign in
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </header>

        <main className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-10">
          <div className="max-w-xl">
            <span className="animate-in fade-in slide-in-from-bottom-2 inline-flex items-center gap-2 rounded-full border border-[#3F8F62]/40 bg-[#3F8F62]/15 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.18em] text-[#9FE3BC] backdrop-blur-md duration-500">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#7FE0A8] opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-[#7FE0A8]" />
              </span>
              ZERO HUNGER MOVEMENT
            </span>

            <h1 className="animate-in fade-in slide-in-from-bottom-3 mt-5 font-display text-[2.9rem] font-extrabold leading-[1.02] tracking-tight duration-500 sm:text-6xl lg:text-[4.6rem]">
              Welcome to
              <br />
              <span className="relative inline-block bg-gradient-to-r from-[#FF9A6B] via-[#ED7545] to-[#F5B942] bg-clip-text text-transparent">
                FoodLoop
                <svg
                  aria-hidden="true"
                  viewBox="0 0 220 12"
                  className="absolute -bottom-2 left-0 h-2.5 w-[72%] text-[#ED7545]/70"
                  fill="none"
                >
                  <path
                    d="M2 8.5C42 2.5 90 1.5 218 5.5"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="animate-in fade-in slide-in-from-bottom-3 mt-6 max-w-md text-[13.5px] leading-relaxed text-[#F8F5ED]/65 duration-700 sm:text-[15px]">
              Every day, good food goes to waste while people go hungry. FoodLoop connects surplus
              meals from kitchens, restaurants and events to nearby shelters and volunteers —{" "}
              <span className="font-semibold text-[#F8F5ED]/90">in minutes, not days.</span>
            </p>

            <div className="animate-in fade-in slide-in-from-bottom-4 mt-7 flex flex-col gap-2.5 duration-700 sm:flex-row">
              <Link
                to="/login"
                className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#ED7545] to-[#F59E0B] px-6 py-4 text-sm font-extrabold text-white shadow-[0_16px_38px_-14px_rgba(237,117,69,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0.5 active:scale-[0.97]"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                Login
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/signup"
                className="group flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/[0.07] px-6 py-4 text-sm font-extrabold text-white backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.12] active:translate-y-0.5 active:scale-[0.97]"
              >
                <Plus className="size-4 transition-transform duration-300 group-hover:rotate-90" />
                Create Account
              </Link>
            </div>

            <div className="animate-in fade-in mt-5 flex items-center gap-3 duration-1000">
              <div className="flex -space-x-2">
                {AVATARS.map((a) => (
                  <span
                    key={a.initial}
                    className={`grid size-7 place-items-center rounded-full bg-gradient-to-br ${a.gradient} text-[10px] font-extrabold text-white ring-2 ring-[#0A2418]`}
                  >
                    {a.initial}
                  </span>
                ))}
                <span className="grid size-7 place-items-center rounded-full bg-white/10 text-[8px] font-extrabold text-white ring-2 ring-[#0A2418]">
                  +2k
                </span>
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-[#F5B942]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3 fill-current" />
                  ))}
                </div>
                <p className="mt-0.5 text-[10px] font-semibold text-white/50">
                  Join 2,400+ food heroes already sharing
                </p>
              </div>
            </div>

            <div className="animate-in fade-in mt-7 grid grid-cols-3 gap-2 duration-1000">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#3F8F62]/45 hover:bg-white/[0.09]"
                >
                  <span className="inline-grid size-8 place-items-center rounded-xl bg-gradient-to-br from-[#ED7545]/25 to-[#F59E0B]/20 text-[#F5B942] transition-transform duration-300 group-hover:scale-110">
                    <f.icon className="size-4" />
                  </span>
                  <p className="mt-2 text-[11px] font-extrabold text-white">{f.title}</p>
                  <p className="text-[9.5px] font-semibold text-[#F8F5ED]/45">{f.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-[#ED7545]/20 via-transparent to-[#3F8F62]/25 blur-2xl" />
            <div
              aria-hidden="true"
              className="absolute -left-10 -top-8 size-40 opacity-20"
              style={{
                backgroundImage: "radial-gradient(#F8F5ED 1px, transparent 1px)",
                backgroundSize: "14px 14px",
              }}
            />

            <div className="relative mx-auto w-full max-w-[26rem]">
              <div className="rounded-[2rem] border border-white/15 bg-white/[0.06] p-2.5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                <div className="relative overflow-hidden rounded-[1.55rem]">
                  <img
                    src="/images/food/dal_khichdi_roti.jpg"
                    alt="A freshly prepared surplus meal ready for rescue"
                    className="h-[27rem] w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04120B] via-[#04120B]/20 to-transparent" />

                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md">
                    <span className="size-1.5 animate-pulse rounded-full bg-[#7FE0A8]" />
                    Live rescue
                  </span>
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[9px] font-bold text-white/90 backdrop-blur-md">
                    <Clock className="size-3" />
                    Pickup 8:30 PM
                  </span>

                  <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/15 bg-[#071B12]/80 p-3.5 backdrop-blur-md">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#9FE3BC]">
                      Tonight&apos;s rescue
                    </p>
                    <div className="mt-1 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg font-extrabold leading-tight text-white">
                          Dal Khichdi &amp; Roti
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-white/55">
                          <MapPin className="size-3 text-[#ED7545]" />
                          Andheri West · 6.2 km away
                        </p>
                      </div>
                      <span className="rounded-lg bg-[#3F8F62]/25 px-2 py-1 text-[9px] font-extrabold text-[#9FE3BC]">
                        40 plates
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[9px] font-bold">
                        <span className="text-white/45">Claimed by shelters</span>
                        <span className="text-[#F5B942]">78%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-[#3F8F62] to-[#7FE0A8]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-6 top-16 animate-[floaty_7s_ease-in-out_infinite] rounded-2xl border border-white/15 bg-[#0C2C1E]/90 px-3.5 py-2.5 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-xl bg-[#3F8F62]/25 text-[#7FE0A8]">
                    <Leaf className="size-4" />
                  </span>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-wider text-white/40">
                      Today
                    </p>
                    <p className="text-[11px] font-extrabold text-white">+320 meals rescued</p>
                  </div>
                </div>
              </div>

              <div className="absolute -left-9 bottom-44 animate-[floaty_6s_ease-in-out_infinite] rounded-2xl border border-white/15 bg-[#0C2C1E]/90 px-3.5 py-2.5 shadow-xl backdrop-blur-md [animation-delay:1.4s]">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-xl bg-[#ED7545]/20 text-[#FF9A6B]">
                    <CheckCircle2 className="size-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-extrabold text-white">Pickup accepted</p>
                    <p className="text-[9px] font-semibold text-white/45">
                      Shelter home · 4 min ago
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <section className="animate-in fade-in grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-4 backdrop-blur-md duration-1000 sm:gap-4 sm:px-6">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`text-center ${i > 0 ? "border-l border-white/10" : ""}`}
            >
              <p className="font-display text-xl font-extrabold tracking-tight text-white sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-white/40 sm:text-[10px]">
                {s.label}
              </p>
            </div>
          ))}
        </section>

        <footer className="flex flex-col items-center justify-between gap-2 py-4 text-[10px] text-white/35 sm:flex-row">
          <p className="flex items-center gap-1.5">
            <Sparkles className="size-3 text-[#F5B942]/70" />
            Free to join · Good food. Shared with purpose.
          </p>
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="size-3 text-[#7FE0A8]/70" />
            Verified NGOs · Live tracking · Secure pickups
          </p>
        </footer>
      </div>
    </div>
  );
}
