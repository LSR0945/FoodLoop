import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Bike,
  Building2,
  CheckCircle2,
  Clock,
  HeartHandshake,
  MapPin,
  Package,
  QrCode,
  ShieldCheck,
  Sparkles,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — FoodLoop" },
      { name: "description", content: "Learn how FoodLoop connects food donors, recipients, and volunteer couriers to prevent hunger and waste." },
      { property: "og:title", content: "How It Works — FoodLoop" },
      { property: "og:description", content: "Learn how FoodLoop connects food donors, recipients, and volunteer couriers to prevent hunger and waste." },
    ],
  }),
  component: HowItWorksPage,
});

function HowItWorksPage() {
  const [activeRoleTab, setActiveRoleTab] = useState<"donor" | "recipient" | "volunteer">("donor");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-semibold text-foreground/80 md:flex">
            <Link to="/explore" className="hover:text-primary transition-colors">
              Explore Food
            </Link>
            <Link to="/how-it-works" className="text-primary font-bold">
              How It Works
            </Link>
            <Link to="/community" className="hover:text-primary transition-colors">
              Community
            </Link>
            <Link to="/impact" className="hover:text-primary transition-colors">
              Impact
            </Link>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link
              to="/auth"
              className="rounded-full px-4 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:brightness-105 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12">
        {/* Hero Section */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5 text-[#ED7545]" /> Transparent & Verified Food Rescue
          </span>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl text-foreground">
            How FoodLoop Works
          </h1>
          <p className="mt-3 text-base text-muted-foreground max-w-xl mx-auto">
            From surplus kitchens to community tables in minutes — powered by real-time alerts, safety guidelines, and verified handovers.
          </p>
        </div>

        {/* 3 Role Switcher Tabs */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex rounded-full border border-border bg-card p-1.5 shadow-sm">
            {(
              [
                ["donor", "🍲 For Food Donors", UtensilsCrossed],
                ["recipient", "🏢 For Recipient Shelters", Building2],
                ["volunteer", "🚴 For Delivery Heroes", Bike],
              ] as const
            ).map(([role, label, Icon]) => (
              <button
                key={role}
                type="button"
                onClick={() => setActiveRoleTab(role)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all ${
                  activeRoleTab === role
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Workflow Content */}
        <div className="mt-10">
          {activeRoleTab === "donor" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
                <div className="max-w-2xl">
                  <span className="rounded-full bg-[#ED7545]/15 px-3 py-1 text-xs font-bold text-[#ED7545]">
                    Food Donors Workflow
                  </span>
                  <h2 className="mt-2 text-2xl font-bold text-foreground">Turn excess meals into community nourishment</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Whether you are a restaurant, hostel mess, banquet organizer, or household with excess prepared meals:
                  </p>
                </div>

                <div className="mt-8 grid gap-6 sm:grid-cols-3">
                  {[
                    {
                      step: "01",
                      title: "Snap & List in 60s",
                      desc: "Take a photo, enter portion count, meal type (veg/non-veg), allergens, and pickup deadline.",
                      icon: Utensils,
                    },
                    {
                      step: "02",
                      title: "Instant Match",
                      desc: "Nearby registered NGOs and shelters receive live push alerts and reserve the meal batch immediately.",
                      icon: Building2,
                    },
                    {
                      step: "03",
                      title: "Doorstep 4-Digit Code",
                      desc: "When the collector arrives, verify their 4-digit code to complete handover safely and receive impact points.",
                      icon: ShieldCheck,
                    },
                  ].map((s) => (
                    <div key={s.step} className="rounded-2xl border border-border/70 bg-background p-5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xl font-extrabold text-[#ED7545]">{s.step}</span>
                        <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                          <s.icon className="size-4" />
                        </div>
                      </div>
                      <h3 className="mt-3 font-bold text-foreground">{s.title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 border-t border-border pt-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-4 text-[#3F8F62]" /> Tax-free charitable contribution • Real-time impact certificate
                  </div>
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-2 rounded-full bg-[#ED7545] px-6 py-2.5 text-xs font-bold text-white shadow-warm hover:brightness-105"
                  >
                    Register as Food Donor <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === "recipient" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
                <div className="max-w-2xl">
                  <span className="rounded-full bg-[#3F8F62]/15 px-3 py-1 text-xs font-bold text-[#3F8F62]">
                    Recipients & Food Banks Workflow
                  </span>
                  <h2 className="mt-2 text-2xl font-bold text-foreground">Secure nutritious food for your shelter</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Charities, orphanages, day-shelters, and verified food banks can claim batches of wholesome cooked food with zero cost:
                  </p>
                </div>

                <div className="mt-8 grid gap-6 sm:grid-cols-3">
                  {[
                    {
                      step: "01",
                      title: "Discover Food Live",
                      desc: "Explore fresh surplus food listed nearby with allergen notes and verified preparation times.",
                      icon: Package,
                    },
                    {
                      step: "02",
                      title: "Claim with 1-Click",
                      desc: "Reserve portions needed for your beneficiaries. You immediately get a secure 4-digit pickup code.",
                      icon: QrCode,
                    },
                    {
                      step: "03",
                      title: "Pickup or Delivery",
                      desc: "Pick up directly or match with an active FoodLoop delivery volunteer to transport meals to your doors.",
                      icon: Bike,
                    },
                  ].map((s) => (
                    <div key={s.step} className="rounded-2xl border border-border/70 bg-background p-5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xl font-extrabold text-[#3F8F62]">{s.step}</span>
                        <div className="grid size-9 place-items-center rounded-xl bg-[#3F8F62]/10 text-[#3F8F62]">
                          <s.icon className="size-4" />
                        </div>
                      </div>
                      <h3 className="mt-3 font-bold text-foreground">{s.title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 border-t border-border pt-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-4 text-[#3F8F62]" /> Verified NGO status • Safe food handling checklist
                  </div>
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:brightness-105"
                  >
                    Register Your NGO / Shelter <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === "volunteer" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
                <div className="max-w-2xl">
                  <span className="rounded-full bg-blue-600/15 px-3 py-1 text-xs font-bold text-blue-600">
                    Delivery Volunteers Workflow
                  </span>
                  <h2 className="mt-2 text-2xl font-bold text-foreground">Be the bridge between surplus and hunger</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    On-ground students, cyclists, riders, and community volunteers transport food from donor kitchens to recipient shelters:
                  </p>
                </div>

                <div className="mt-8 grid gap-6 sm:grid-cols-3">
                  {[
                    {
                      step: "01",
                      title: "View Nearby Tasks",
                      desc: "Check available pickup tasks along your regular commute route or near your college campus.",
                      icon: MapPin,
                    },
                    {
                      step: "02",
                      title: "Accept & Pickup",
                      desc: "Accept the route, collect the food packages from the donor, and verify quality and safety.",
                      icon: Package,
                    },
                    {
                      step: "03",
                      title: "Drop at Shelter",
                      desc: "Deliver to the shelter, confirm handover with the recipient, and log volunteer service hours.",
                      icon: HeartHandshake,
                    },
                  ].map((s) => (
                    <div key={s.step} className="rounded-2xl border border-border/70 bg-background p-5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xl font-extrabold text-blue-600">{s.step}</span>
                        <div className="grid size-9 place-items-center rounded-xl bg-blue-600/10 text-blue-600">
                          <s.icon className="size-4" />
                        </div>
                      </div>
                      <h3 className="mt-3 font-bold text-foreground">{s.title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 border-t border-border pt-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-4 text-[#3F8F62]" /> Flexible shifts • Certified volunteer service credits
                  </div>
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:brightness-105"
                  >
                    Join as Delivery Volunteer <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4 Pillars of Food Safety Section */}
        <section className="mt-16 rounded-3xl bg-[#164330] p-8 text-[#F8F5ED] shadow-xl">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-8 text-[#ED7545]" />
            <div>
              <h2 className="text-2xl font-bold">Food Safety & Quality Commitment</h2>
              <p className="text-xs text-[#F8F5ED]/80">Strict operational guidelines ensuring only fresh, hygienic food is distributed.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <Clock className="size-5 text-[#ED7545]" />
              <h3 className="mt-2 font-bold text-sm">8-Hour Maximum Window</h3>
              <p className="mt-1 text-xs text-[#F8F5ED]/80">Prepared food must be collected within 8 hours of cooking to preserve nutritional integrity.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <QrCode className="size-5 text-[#3F8F62]" />
              <h3 className="mt-2 font-bold text-sm">Doorstep Verification</h3>
              <p className="mt-1 text-xs text-[#F8F5ED]/80">Unique 4-digit code ensures food only exchanges hands with verified registered members.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <ShieldCheck className="size-5 text-amber-300" />
              <h3 className="mt-2 font-bold text-sm">Allergen Transparency</h3>
              <p className="mt-1 text-xs text-[#F8F5ED]/80">All items declare allergens (nuts, dairy, gluten) so recipients can distribute responsibly.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
