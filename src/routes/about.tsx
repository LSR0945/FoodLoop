import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, CheckCircle2, HeartHandshake, ShieldCheck, Sparkles, Target, Users } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — FoodLoop" },
      { name: "description", content: "Learn about FoodLoop's mission: Good food. Shared with purpose." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
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
          <Link to="/signup" className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:brightness-105 transition-all">
            Join FoodLoop
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <Sparkles className="size-3.5 text-[#ED7545]" /> Our Origin & Purpose
          </span>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl text-foreground">
            Good Food. Shared with Purpose.
          </h1>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            FoodLoop was founded with a singular conviction: in a world where millions sleep on empty stomachs, not a single plate of fresh, wholesome food should ever be discarded into a landfill.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card text-center">
            <Target className="mx-auto size-10 text-primary" />
            <h3 className="mt-4 font-bold text-lg">Zero Hunger Goal</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Empowering local communities to bridge surplus meals with shelters within minutes of cooking.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-card text-center">
            <ShieldCheck className="mx-auto size-10 text-[#ED7545]" />
            <h3 className="mt-4 font-bold text-lg">Safety & Integrity</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Strict 8-hour collection limits, mandatory allergen labels, and verified 4-digit handover codes.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-card text-center">
            <HeartHandshake className="mx-auto size-10 text-[#3F8F62]" />
            <h3 className="mt-4 font-bold text-lg">Grassroots Trust</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Connecting trusted restaurants, student volunteers, and verified NGOs on one unified digital network.
            </p>
          </div>
        </div>

        <section className="mt-12 rounded-3xl bg-[#164330] p-8 text-[#F8F5ED] text-center">
          <h2 className="text-2xl font-bold">Join the Movement</h2>
          <p className="mt-2 text-xs text-[#F8F5ED]/80 max-w-md mx-auto">
            Become a food donor, registered shelter, or volunteer delivery hero today.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/signup" className="rounded-full bg-[#ED7545] px-6 py-2.5 text-xs font-bold text-white shadow-warm hover:brightness-105 transition-all">
              Get Started Now →
            </Link>
            <Link to="/login" className="rounded-full border border-white/30 bg-white/10 px-6 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all">
              Sign In
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
