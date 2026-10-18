import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — FoodLoop" },
      { name: "description", content: "Terms of Service governing the FoodLoop surplus food sharing and collection platform." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
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
              <FileText className="size-3.5 text-[#ED7545]" /> Legal Agreements
            </div>
            <h1 className="mt-2 font-display text-3xl font-extrabold text-[#242923]">Terms of Service</h1>
            <p className="mt-1 text-xs text-[#656C62]">Effective Date: October 2026</p>
          </div>

          <section className="space-y-3 text-sm text-[#656C62] leading-relaxed">
            <h2 className="font-display text-lg font-bold text-[#242923]">1. Nature of the FoodLoop Service</h2>
            <p>
              FoodLoop is a digital surplus food coordination platform connecting surplus food donors, registered recipient shelters and charities, and volunteer couriers. FoodLoop does not prepare, sell, package, or purchase food items. All food redistribution is free and non-commercial.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#656C62] leading-relaxed">
            <h2 className="font-display text-lg font-bold text-[#242923]">2. Good-Faith Redistribution and Food Safety</h2>
            <p>
              Donors agree to list only wholesome, hygienic food fit for human consumption to the best of their knowledge, in compliance with the Food Safety and Standards Act and applicable local regulations. Donors must accurately declare allergens and preparation timestamps.
            </p>
            <p>
              Recipients and shelter coordinators must visually inspect food upon handover, verify temperature holding, and reject or discard any food that shows signs of spoilage or mishandling.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#656C62] leading-relaxed">
            <h2 className="font-display text-lg font-bold text-[#242923]">3. Handover Protocol & Pickup Codes</h2>
            <p>
              To ensure platform security and traceability, every collection requires a one-time 4-digit pickup code verification. Donors must not release food without verifying the code provided to the authorized recipient or assigned volunteer.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#656C62] leading-relaxed">
            <h2 className="font-display text-lg font-bold text-[#242923]">4. Volunteer Couriers</h2>
            <p>
              Volunteers deliver food on a voluntary, good-samaritan basis. Volunteers must transport food in clean containers, obey traffic laws, and complete handovers within the specified deadline windows.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#656C62] leading-relaxed">
            <h2 className="font-display text-lg font-bold text-[#242923]">5. Termination and Moderation</h2>
            <p>
              FoodLoop reserves the right to suspend or terminate accounts that violate food safety checklists, falsify organization credentials, repeatedly miss pickup windows, or engage in abusive behavior.
            </p>
          </section>

          <div className="border-t border-[#DDD5C8] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#656C62]">
            <span>Questions about our terms?</span>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-full bg-[#205C43]/10 px-3.5 py-1.5 font-bold text-[#205C43] hover:bg-[#205C43] hover:text-white transition-all shadow-2xs"
            >
              Contact Platform Safety →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
