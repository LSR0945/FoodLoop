import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, QrCode, ShieldAlert, ShieldCheck, Thermometer, Utensils } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/food-safety")({
  head: () => ({
    meta: [
      { title: "Food Safety Standards & Guidelines — FoodLoop" },
      { name: "description", content: "Our comprehensive 4-pillar food safety protocol protecting donors and recipients." },
    ],
  }),
  component: FoodSafetyPage,
});

function FoodSafetyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-semibold text-foreground/80 md:flex">
            <Link to="/explore" className="hover:text-primary transition-colors">Explore Food</Link>
            <Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
            <Link to="/community" className="hover:text-primary transition-colors">Community</Link>
            <Link to="/impact" className="hover:text-primary transition-colors">Impact</Link>
          </nav>
          <Link to="/auth" className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm">
            Sign In
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <ShieldCheck className="size-3.5 text-[#ED7545]" /> Trust & Safety First
          </span>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl text-foreground">
            Food Safety & Hygiene Protocols
          </h1>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
            FoodLoop adheres to rigorous hygiene guidelines aligned with FSSAI regulations and global food-bank safety standards.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-start gap-4">
              <Clock className="size-8 text-[#ED7545] shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg text-foreground">1. Time & Temperature Control (The 8-Hour Rule)</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Cooked meals must have their preparation timestamp explicitly declared. Any cooked meal not collected within 8 hours of cooking is automatically expired and removed from our active feed to prevent bacterial proliferation.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-start gap-4">
              <ShieldAlert className="size-8 text-amber-500 shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg text-foreground">2. Transparent Allergen & Dietary Declarations</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Donors must specify whether food contains common allergens such as dairy, nuts, soy, or gluten. Vegetarian, Vegan, and Non-Vegetarian tags are clearly marked on every listing.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-start gap-4">
              <QrCode className="size-8 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg text-foreground">3. Verified 4-Digit Handover Code</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  No food is handed over without the recipient presenting their system-generated 4-digit code. This prevents impersonation and guarantees that food only reaches verified humanitarian organizations.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-start gap-4">
              <Thermometer className="size-8 text-[#3F8F62] shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg text-foreground">4. Recipient Inspection & Good-Faith Clause</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Recipients and volunteers always conduct a visual and sensory smell check before serving food. Any item displaying signs of deterioration must be safely discarded and reported through the platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
