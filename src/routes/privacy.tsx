import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — FoodLoop" },
      { name: "description", content: "FoodLoop's privacy practices, data protection principles, and location policies." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-bold text-primary shadow-xs hover:bg-primary hover:text-white transition-all"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-extrabold text-foreground">FoodLoop Privacy Policy</h1>
        <p className="mt-1 text-xs text-muted-foreground">Last updated: October 2026</p>

        <div className="mt-6 space-y-6 text-sm text-foreground/90 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">1. Commitment to User Privacy</h2>
            <p className="text-xs text-muted-foreground">
              FoodLoop collects only the minimal information strictly required to coordinate safe, verified food donations. We never sell or monetize user data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">2. Information We Collect</h2>
            <p className="text-xs text-muted-foreground">
              - Account Information: Name, email address, role, and contact phone number.<br />
              - Donation Data: Food title, portion count, allergens, pickup time, and general locality.<br />
              - Exact Pickup Address: Private addresses are NEVER shown publicly to unauthenticated guests; they are only revealed to verified recipients upon confirmed reservation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">3. Security & Access</h2>
            <p className="text-xs text-muted-foreground">
              All credentials are secure through Supabase Authentication and Row Level Security policies. Users can request data deletion at any time by contacting privacy@foodloop.org.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
