import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, HandHeart, MapPin, ShieldCheck, Users } from "lucide-react";
import { Logo } from "@/components/Logo";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AnnSetu — Koi bhooke na soye" },
      { name: "description", content: "AnnSetu connects surplus food from events, hostels, restaurants and homes with nearby NGOs and volunteers — before it goes to waste." },
      { property: "og:title", content: "AnnSetu — Koi bhooke na soye" },
      { property: "og:description", content: "Surplus food, shared fast. Donors list food in seconds; NGOs and volunteers collect it before the clock runs out." },
    ],
  }),
  component: Landing,
});

const steps = [
  { icon: HandHeart, title: "Donor lists food", text: "Photo khicho, quantity aur pickup time daalo — 60 seconds mein listing live." },
  { icon: Users, title: "NGO reserves it", text: "Nearby registered NGOs aur community groups ko turant alert milta hai." },
  { icon: Clock, title: "Volunteer collects", text: "Pickup code se verified handover — food reaches people, not the dustbin." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Logo />
        <div className="flex items-center gap-2">
          <Link to="/auth" className="rounded-full px-4 py-2 text-sm font-semibold text-primary">
            Log in
          </Link>
          <Link to="/auth" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card">
            Join
          </Link>
        </div>
      </header>

      <section className="relative">
        <img src={hero} alt="Shared meal" className="h-[70vh] w-full object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-6xl px-4 pb-14 text-hero-foreground">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-hero-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur">
              <MapPin className="size-3" /> Your city, your community
            </p>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-6xl">
              Koi bhooke na soye, koi anna barbaad na ho.
            </h1>
            <p className="mt-4 max-w-xl text-base text-hero-foreground/85 sm:text-lg">
              Every night, tonnes of good food is thrown away while someone nearby sleeps hungry.
              AnnSetu bridges that gap — connecting surplus food from events, hostels, restaurants
              and homes with the people who need it, before the clock runs out.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-full bg-saffron px-6 py-3 font-semibold text-saffron-foreground shadow-warm">
                Donate food <ArrowRight className="size-4" />
              </Link>
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-full border border-hero-foreground/40 px-6 py-3 font-semibold">
                Register your NGO
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold">How AnnSetu works</h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-muted-foreground">
          From surplus to served in three simple steps — with safety checks at every stage.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-2xl bg-card p-6 shadow-card">
              <div className="mb-4 grid size-12 place-items-center rounded-full bg-saffron/20 text-accent-foreground">
                <s.icon className="size-6" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Step {i + 1}</p>
              <h3 className="mt-1 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-hero py-16 text-hero-foreground">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 size-8 shrink-0 text-saffron" />
            <div>
              <h2 className="text-3xl font-bold">Safety first, always</h2>
              <p className="mt-3 max-w-2xl text-hero-foreground/80">
                Every donation passes a food-handling checklist, cooked meals must be collected
                within 8 hours of preparation, and handovers are verified with a pickup code.
                Food is shared on a good-faith basis — recipients always inspect before serving.
              </p>
            </div>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["8 hrs", "max window for cooked meals"],
              ["4-digit", "verified pickup code at handover"],
              ["100%", "of listings carry an allergen note"],
            ].map(([big, small]) => (
              <div key={small} className="rounded-2xl bg-hero-foreground/10 p-5 backdrop-blur">
                <p className="font-display text-3xl font-bold text-saffron">{big}</p>
                <p className="mt-1 text-sm text-hero-foreground/80">{small}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-10 text-center">
        <Logo />
        <p className="text-sm text-muted-foreground">Surplus food, shared fast. Built for communities that care.</p>
      </footer>
    </div>
  );
}
