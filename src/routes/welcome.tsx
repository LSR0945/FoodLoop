import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Plus, ShieldCheck, Sparkles, UtensilsCrossed } from "lucide-react";
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

function WelcomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#081F15] text-white">
      {/* ===== Branded background ===== */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#081F15] via-[#123A2A] to-[#081F15]" />
        <img
          src="/images/hunger/hunger3.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-[0.10]"
        />
        <div className="absolute -top-40 -right-40 size-[26rem] rounded-full bg-[#3F8F62]/25 blur-3xl" />
        <div className="absolute top-1/3 -left-40 size-[30rem] rounded-full bg-[#ED7545]/20 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 size-[22rem] rounded-full bg-[#205C43]/40 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(#F8F5ED 0.7px, transparent 0.7px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(63,143,98,0.22),transparent_60%)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-6 pt-[max(1.25rem,env(safe-area-inset-top,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]">
        {/* ===== Top bar ===== */}
        <header className="flex items-center justify-center">
          <Logo light size="md" showTagline={false} />
        </header>

        {/* ===== Hero ===== */}
        <main className="flex flex-1 flex-col justify-center py-8">
          <span className="animate-in fade-in slide-in-from-bottom-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold tracking-wide backdrop-blur-md duration-500">
            <Sparkles className="size-3 text-[#F59E0B]" /> ZERO HUNGER MOVEMENT
          </span>
          <h1 className="animate-in fade-in slide-in-from-bottom-3 mt-4 font-display text-[2.6rem] font-extrabold leading-[1.06] duration-500">
            Welcome to
            <br />
            <span className="text-[#ED7545]">FoodLoop</span>
          </h1>
          <p className="animate-in fade-in slide-in-from-bottom-3 mt-3 max-w-sm text-[13px] leading-relaxed text-[#F8F5ED]/70 duration-700">
            Share food. Spread hope. Join thousands rescuing surplus meals from kitchens,
            restaurants and events — and getting them to people who need them.
          </p>

          {/* Feature chips */}
          <div className="animate-in fade-in slide-in-from-bottom-4 mt-6 grid grid-cols-3 gap-2 duration-700">
            {[
              { icon: UtensilsCrossed, title: "Rescue", sub: "Surplus food" },
              { icon: Heart, title: "Share", sub: "Nearby shelters" },
              { icon: ShieldCheck, title: "Track", sub: "Live impact" },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/10 bg-white/10 px-2 py-3 text-center backdrop-blur-md"
              >
                <f.icon className="mx-auto size-4 text-[#F59E0B]" />
                <p className="mt-1.5 text-[11px] font-extrabold text-white">{f.title}</p>
                <p className="text-[9px] font-semibold text-[#F8F5ED]/55">{f.sub}</p>
              </div>
            ))}
          </div>

          <p className="animate-in fade-in mt-5 text-[10px] font-semibold tracking-wide text-[#F8F5ED]/45 duration-1000">
            14,250+ meals shared · 48 shelter homes · 2,400+ food heroes
          </p>
        </main>

        {/* ===== Action buttons ===== */}
        <footer className="animate-in fade-in slide-in-from-bottom-6 space-y-3 duration-700">
          <Link
            to="/login"
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ED7545] to-[#F59E0B] py-4 text-sm font-extrabold text-white shadow-[0_14px_34px_-12px_rgba(237,117,69,0.8)] transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_rgba(237,117,69,0.9)] active:translate-y-0.5 active:scale-[0.95] active:shadow-md"
          >
            Login
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1 group-active:translate-x-2" />
          </Link>
          <Link
            to="/signup"
            className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 py-4 text-sm font-extrabold text-white backdrop-blur-md transition-all duration-200 hover:bg-white/15 hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.95] active:bg-white/20"
          >
            <Plus className="size-4 transition-transform duration-300 group-hover:rotate-90 group-active:rotate-180" />
            Create Account
          </Link>
          <p className="pt-1 text-center text-[10px] leading-relaxed text-[#F8F5ED]/40">
            Free to join · Good food. Shared with purpose.
          </p>
        </footer>
      </div>
    </div>
  );
}
