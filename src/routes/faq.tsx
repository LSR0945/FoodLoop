import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — FoodLoop" },
      { name: "description", content: "Common questions about donating food, claiming meals, and volunteering with FoodLoop." },
    ],
  }),
  component: FAQPage,
});

const FAQS = [
  {
    q: "Is food on FoodLoop completely free for recipients?",
    a: "Yes, 100%. FoodLoop is a humanitarian redistribution platform. Donors contribute surplus meals without charging, and registered charities or shelters receive them for free.",
  },
  {
    q: "How does FoodLoop ensure the food is safe to eat?",
    a: "We implement an 8-hour maximum collection window for cooked foods, require explicit allergen and dietary labeling, verify recipient organizations, and mandate 4-digit code handovers at the doorstep.",
  },
  {
    q: "Can individuals or households donate food?",
    a: "Absolutely! While many donors are banquet halls, restaurants, and hostels, individual home donors with fresh surplus meals from gatherings or family functions are warmly welcomed.",
  },
  {
    q: "How do volunteers know where to deliver the food?",
    a: "When a volunteer accepts a pickup task, the app provides the donor's pickup address and the recipient shelter's delivery address along with turn-by-turn navigation options.",
  },
  {
    q: "How do NGOs verify their organization?",
    a: "During registration, NGOs provide their official organization name, Darpan or Govt. registration ID, authorized representative contact, and daily feeding capacity for admin approval.",
  },
];

function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
          <Link to="/login" className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:brightness-105 transition-all">
            Sign In
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <HelpCircle className="size-3.5 text-[#ED7545]" /> Got Questions?
          </span>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Everything you need to know about joining, donating, and volunteering with FoodLoop.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={faq.q}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="flex w-full items-center justify-between p-4 text-left font-bold text-sm text-foreground hover:bg-muted/30 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`size-4 text-muted-foreground transition-transform ${openIndex === idx ? "rotate-180 text-primary" : ""}`} />
              </button>
              {openIndex === idx && (
                <div className="border-t border-border/60 bg-muted/20 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
