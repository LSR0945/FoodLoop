import { createFileRoute, Link } from "@tanstack/react-router";
import { Accessibility, ArrowLeft, CheckCircle2, Eye, Keyboard, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: [
      { title: "Accessibility Statement — FoodLoop" },
      { name: "description", content: "FoodLoop's commitment to digital accessibility for all users, shelters, and volunteers." },
    ],
  }),
  component: AccessibilityPage,
});

function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#242923]">
      <header className="sticky top-0 z-30 border-b border-[#E2DBD0] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
          <Logo size="sm" />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD5C8] bg-[#F8F5ED] px-3.5 py-1.5 text-xs font-bold text-[#205C43] shadow-xs hover:bg-white hover:border-[#205C43] transition-all"
          >
            <ArrowLeft className="size-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-3xl border border-[#DDD5C8] bg-white p-8 sm:p-12 shadow-sm space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#205C43]/10 px-3 py-1 text-xs font-bold text-[#205C43]">
              <Accessibility className="size-3.5 text-[#ED7545]" /> Inclusive Design
            </div>
            <h1 className="mt-2 font-display text-3xl font-extrabold text-[#242923]">Accessibility Statement</h1>
            <p className="mt-1 text-xs text-[#656C62]">Last Updated: October 2026</p>
          </div>

          <p className="text-sm text-[#656C62] leading-relaxed">
            At FoodLoop, we believe that food rescue and community nourishment must be accessible to everyone — regardless of physical ability, technological environment, or assistive technology.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#DDD5C8] bg-[#F8F5ED] p-5">
              <Eye className="size-6 text-[#205C43]" />
              <h3 className="mt-2 font-bold text-sm text-[#242923]">High Color Contrast</h3>
              <p className="mt-1 text-xs text-[#656C62] leading-relaxed">
                Design tokens (Forest green #205C43, Dark ink #242923, Cream #F8F5ED) are calibrated to meet WCAG AA standards for optimal readability.
              </p>
            </div>

            <div className="rounded-2xl border border-[#DDD5C8] bg-[#F8F5ED] p-5">
              <Keyboard className="size-6 text-[#ED7545]" />
              <h3 className="mt-2 font-bold text-sm text-[#242923]">Full Keyboard Navigation</h3>
              <p className="mt-1 text-xs text-[#656C62] leading-relaxed">
                All forms, modals, tabs, and interactive elements can be operated smoothly with standard keyboard navigation and clear focus rings.
              </p>
            </div>
          </div>

          <section className="space-y-3 text-sm text-[#656C62] leading-relaxed">
            <h2 className="font-display text-lg font-bold text-[#242923]">Standards Compliance</h2>
            <p>
              We design and develop with reference to the World Wide Web Consortium (W3C) Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Descriptive alt text for all food donation images and community photos</li>
              <li>Semantic HTML elements with appropriate ARIA roles and labels</li>
              <li>Responsive layouts supporting up to 200% browser zoom without content clipping</li>
              <li>Reduced motion support for users with vestibular sensitivities</li>
            </ul>
          </section>

          <div className="border-t border-[#DDD5C8] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#656C62]">
            <span>Encountering an accessibility barrier?</span>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-full bg-[#205C43]/10 px-3.5 py-1.5 font-bold text-[#205C43] hover:bg-[#205C43] hover:text-white transition-all shadow-2xs"
            >
              Contact Accessibility Coordinator →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
