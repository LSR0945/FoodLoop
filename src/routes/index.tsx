import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  HandHeart,
  Heart,
  MapPin,
  ShieldCheck,
  TrendingUp,
  Users,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { getFirebase } from "@/lib/firebase";

export const Route = createFileRoute("/")(
  {
  head: () => ({
    meta: [
      { title: "BhojanBandhu — Koi bhooke na soye" },
      { name: "description", content: "BhojanBandhu connects surplus food from events, hostels, restaurants and homes with nearby NGOs and volunteers — before it goes to waste." },
      { property: "og:title", content: "BhojanBandhu — Koi bhooke na soye" },
      { property: "og:description", content: "Surplus food, shared fast. Donors list food in seconds; NGOs and volunteers collect it before the clock runs out." },
    ],
  }),
  component: Landing,
});

interface LiveStats {
  totalDonations: number;
  mealsServed: number;
  activeDonors: number;
  ngosRegistered: number;
}

function useLiveStats() {
  const [stats, setStats] = useState<LiveStats>({ totalDonations: 0, mealsServed: 0, activeDonors: 0, ngosRegistered: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { db } = await getFirebase();
        const { collection, getDocs, query, where } = await import("firebase/firestore");
        const [listSnap, usersSnap] = await Promise.all([
          getDocs(collection(db, "listings")),
          getDocs(collection(db, "users")),
        ]);
        if (!alive) return;
        const listings = listSnap.docs.map((d) => d.data() as any);
        const users = usersSnap.docs.map((d) => d.data() as any);
        const completed = listings.filter((l: any) => l.status === "completed");
        const mealsServed = completed.reduce((acc: number, l: any) => acc + (l.quantityDistributed || l.quantity || 0), 0);
        setStats({
          totalDonations: listings.length,
          mealsServed,
          activeDonors: users.filter((u: any) => u.role === "donor").length,
          ngosRegistered: users.filter((u: any) => u.role === "ngo").length,
        });
        setLoaded(true);
      } catch {
        setLoaded(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { stats, loaded };
}

const STEPS = [
  {
    icon: HandHeart,
    emoji: "📸",
    title: "Donor lists food",
    text: "Photo khicho, quantity aur pickup time daalo — 60 seconds mein listing live. Automatically sorted by urgency.",
    color: "from-amber-400/20 to-orange-400/10 border-amber-400/30",
    iconColor: "text-amber-600",
  },
  {
    icon: Users,
    emoji: "🏢",
    title: "NGO sees & reserves",
    text: "Registered NGOs nearby dekhte hain food — category, allergens, storage sab clear. Ek click mein reserve.",
    color: "from-emerald-400/20 to-green-400/10 border-emerald-400/30",
    iconColor: "text-emerald-600",
  },
  {
    icon: Clock,
    emoji: "🚴",
    title: "Volunteer collects",
    text: "4-digit pickup code se verified handover. Food reaches shelter — waste zero, dignity preserved.",
    color: "from-blue-400/20 to-cyan-400/10 border-blue-400/30",
    iconColor: "text-blue-600",
  },
];

const INNOVATIONS = [
  { icon: TrendingUp, title: "Urgency Prioritization", text: "Listings auto-sorted by time left. Critical items appear first — cooked meals must be collected within 8 hours." },
  { icon: ShieldCheck, title: "Food Safety Checklist", text: "Every listing requires a 4-point food handling checklist + donor declaration. Safety first, always." },
  { icon: Clock, title: "Shift Management", text: "Volunteers register available shifts — pickups matched to their schedule to reduce missed collections." },
  { icon: Heart, title: "Impact Certificates", text: "Donors get a digital certificate showing meals served and food waste prevented. Mission made visible." },
];

const TESTIMONIALS = [
  { name: "Rajesh Kumar", role: "NGO Director, Feeding Hope Trust", text: "BhojanBandhu ne hamare food collection time ko 70% reduce kar diya. Pickup code system missa collections almost zero kar deta hai.", avatar: "R" },
  { name: "Priya Agarwal", role: "Owner, GreenGarden Restaurant", text: "Monday evenings pe 20-30 kg surplus food rehta tha. Ab 3 hours mein pick ho jaata hai. Koi barbaad nahi hota.", avatar: "P" },
  { name: "Aman Sharma", role: "Volunteer, GLA University", text: "Evening shift mein 2-3 pickups manage kar leta hoon college ke baad. App simple hai — code milta, deliver karo, done.", avatar: "A" },
];

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const dur = 1200;
    const steps = 40;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCount(Math.round((target * step) / steps));
      if (step >= steps) clearInterval(timer);
    }, dur / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count.toLocaleString("en-IN")}{suffix}</>;
}

function Landing() {
  const { stats, loaded } = useLiveStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <div className="flex items-center gap-2">
            <Link to="/auth" className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link to="/auth" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-card hover:brightness-105 transition-all">
              Join Free →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero text-hero-foreground">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-1/4 size-96 rounded-full bg-saffron blur-3xl" />
          <div className="absolute bottom-10 right-1/4 size-64 rounded-full bg-primary blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-hero-foreground/20 bg-hero-foreground/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur">
              <MapPin className="size-3 text-saffron" /> Your City. Your Community. Your Mission.
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.1] sm:text-6xl lg:text-7xl">
              Koi bhooke na soye,
              <br />
              <span className="text-saffron">koi anna barbaad na ho.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-hero-foreground/80 sm:text-lg">
              Every night in India, <strong className="text-saffron">7,000+ tonnes</strong> of good food is thrown away while someone nearby sleeps hungry.
              BhojanBandhu bridges that gap in <strong>under 3 minutes</strong> — connecting surplus food from events,
              hostels, restaurants and homes with registered NGOs and volunteers.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-full bg-saffron px-7 py-3.5 font-bold text-saffron-foreground shadow-warm hover:brightness-105 transition-all text-sm sm:text-base">
                <UtensilsCrossed className="size-5" /> Donate surplus food
              </Link>
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-full border-2 border-hero-foreground/30 px-7 py-3.5 font-semibold hover:bg-hero-foreground/10 transition-all text-sm sm:text-base">
                <Building2 className="size-5" /> Register your NGO
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap gap-3">
              {["✅ FSSAI Compliant Checklist", "🔒 Pickup Code Verified", "⚡ Real-time Listings", "🌱 Zero Waste Mission"].map((b) => (
                <span key={b} className="rounded-full bg-hero-foreground/10 px-3 py-1 text-xs font-medium backdrop-blur">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <p className="mb-6 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Live impact — updated in real time from Firestore
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Food Donations Listed", value: stats.totalDonations, suffix: "+", icon: "🍱" },
              { label: "Meals Served", value: stats.mealsServed, suffix: "+", icon: "🙏" },
              { label: "Registered Donors", value: stats.activeDonors, suffix: "", icon: "👨‍🍳" },
              { label: "NGO Partners", value: stats.ngosRegistered, suffix: "", icon: "🏢" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-background p-5 text-center shadow-card">
                <p className="text-3xl">{s.icon}</p>
                <p className="mt-2 font-display text-3xl font-bold text-primary">
                  {loaded ? <AnimatedCounter target={s.value} suffix={s.suffix} /> : "—"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">3 Easy Steps</span>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">How BhojanBandhu works</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            From surplus to served in minutes — with safety checks, verified handovers, and real-time tracking.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className={`relative rounded-3xl border bg-gradient-to-br p-6 shadow-card ${s.color}`}>
              <span className="absolute -top-4 left-6 flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow">
                {i + 1}
              </span>
              <div className="mt-3 text-4xl">{s.emoji}</div>
              <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who Can Join */}
      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Who can join BhojanBandhu?</h2>
            <p className="mt-3 text-muted-foreground">Three roles, one mission — ending food waste together.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {[
              { emoji: "🍲", role: "Food Donor", color: "border-amber-400/40 bg-amber-50/50", tag: "bg-amber-100 text-amber-800", who: "Restaurants, Hotels, Hostels, Wedding Caterers, Households", cta: "Start Donating", desc: "List your surplus food with photo, quantity, and pickup deadline. Reach NGOs in your area instantly." },
              { emoji: "🏢", role: "NGO / Food Bank", color: "border-emerald-400/40 bg-emerald-50/50", tag: "bg-emerald-100 text-emerald-800", who: "Registered Trusts, Shelters, Community Food Banks, Schools", cta: "Register NGO", desc: "Browse verified food listings near you. Reserve what you need, assign a volunteer, and track the pickup." },
              { emoji: "🚴", role: "Delivery Volunteer", color: "border-blue-400/40 bg-blue-50/50", tag: "bg-blue-100 text-blue-800", who: "Students, Working Professionals, NCC, NSS volunteers", cta: "Become Volunteer", desc: "Register your available shifts and vehicle. Get assigned pickups. Verify handover with a 4-digit code." },
            ].map((r) => (
              <div key={r.role} className={`flex flex-col rounded-3xl border p-6 ${r.color}`}>
                <div className="text-5xl">{r.emoji}</div>
                <span className={`mt-4 inline-block rounded-full px-3 py-0.5 text-xs font-bold ${r.tag}`}>{r.role}</span>
                <p className="mt-1 text-xs text-muted-foreground">{r.who}</p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground">{r.desc}</p>
                <Link to="/auth" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
                  {r.cta} <ArrowRight className="size-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Innovation Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">Innovation</span>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Features that reduce missed pickups</h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {INNOVATIONS.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="mb-3 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </div>
              <h3 className="font-bold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Food Safety Section */}
      <section className="bg-hero py-16 text-hero-foreground">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-10 sm:grid-cols-2">
            <div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-10 text-saffron" />
                <h2 className="text-3xl font-bold">Safety first, always</h2>
              </div>
              <p className="mt-4 text-hero-foreground/80 leading-relaxed">
                BhojanBandhu does not guarantee every item is safe — that's why we built transparency in.
                Every listing carries allergen info, food category, storage type, and a 4-point handling checklist.
                Cooked meals must be collected within <strong>8 hours of preparation</strong>.
                Final safety check is always with the recipient.
              </p>
              <ul className="mt-6 space-y-2 text-sm">
                {["Food handling checklist mandatory for every listing", "Allergen declaration (Gluten, Dairy, Nuts, etc.)", "Storage type clearly shown (hot / chilled / room temp)", "4-digit pickup code at handover for verification"].map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-saffron" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[["8 hrs", "max window for cooked meals (FSSAI aligned)"], ["4-digit", "verified pickup code at handover"], ["100%", "listings carry allergen information"], ["0 payments", "fully free for all parties"]].map(([big, small]) => (
                <div key={small} className="rounded-2xl bg-hero-foreground/10 p-5 backdrop-blur">
                  <p className="font-display text-3xl font-bold text-saffron">{big}</p>
                  <p className="mt-1 text-sm text-hero-foreground/75">{small}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Voices from the community</h2>
          <p className="mt-2 text-muted-foreground">Real stories from donors, NGOs, and volunteers.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card">
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">"{t.text}"</p>
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Strip */}
      <section className="bg-gradient-to-r from-primary to-hero py-16 text-hero-foreground">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <Utensils className="mx-auto size-12 text-saffron" />
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Aaj hi shuru karein</h2>
          <p className="mt-4 text-hero-foreground/80">
            Join hundreds of donors, NGOs, and volunteers working together to make sure no meal goes to waste in your city.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/auth" className="inline-flex items-center gap-2 rounded-full bg-saffron px-8 py-4 font-bold text-saffron-foreground shadow-warm hover:brightness-105 transition-all">
              Get started — it's free <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center">
          <Logo />
          <p className="text-sm text-muted-foreground max-w-md">
            BhojanBandhu — Surplus food, shared fast. Built for communities that care. Not-for-profit initiative connecting surplus food with hungry hearts.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link to="/auth" className="hover:text-foreground">Login / Register</Link>
            <span>·</span>
            <span>© {new Date().getFullYear()} BhojanBandhu</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
