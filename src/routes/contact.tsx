import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MapPin, MessageSquare, Phone, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us & Support — FoodLoop" },
      { name: "description", content: "Get in touch with FoodLoop support, partnership, or community teams." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    toast.success("Thank you! Your message has been received by the FoodLoop coordination desk.");
  }

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

      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <MessageSquare className="size-3.5 text-[#ED7545]" /> We're Here to Help
          </span>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl text-foreground">
            Contact the FoodLoop Team
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Have questions about institutional food donations, NGO partnerships, or tech support?
          </p>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {/* Contact Details Card */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card space-y-4">
              <h3 className="font-bold text-lg text-foreground">Community Coordination Desk</h3>
              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Email Support</p>
                    <p>support@foodloop.org</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="grid size-8 place-items-center rounded-xl bg-[#ED7545]/15 text-[#ED7545]">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Emergency Food Rescue Hotline</p>
                    <p>+91 (800) 246-6566 (24/7)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="grid size-8 place-items-center rounded-xl bg-[#3F8F62]/15 text-[#3F8F62]">
                    <MapPin className="size-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">HQ & Coordination Hub</p>
                    <p>GLA University Innovation Hub, Mathura, UP 281406</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-6 shadow-card space-y-4">
            <h3 className="font-bold text-lg text-foreground">Send us a message</h3>
            <div>
              <label className="mb-1 block text-xs font-semibold">Your Name *</label>
              <input
                className="field"
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">Your Email Address *</label>
              <input
                type="email"
                className="field"
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">Subject</label>
              <input
                className="field"
                placeholder="e.g. Partnering as a banquet donor"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">Message *</label>
              <textarea
                className="field h-24 py-2 text-xs"
                placeholder="How can we assist you today?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={sent}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:brightness-105 disabled:opacity-50"
            >
              <Send className="size-3.5" />
              {sent ? "Message Delivered!" : "Send Message"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
