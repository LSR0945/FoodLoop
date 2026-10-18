import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bike, Building2, Check, ShieldAlert, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { updateProfile } from "@/lib/db";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/onboarding/role")({
  head: () => ({
    meta: [
      { title: "Select Your Role — FoodLoop" },
      { name: "description", content: "Choose your role on FoodLoop: Food Donor, Recipient Shelter, or Delivery Volunteer." },
    ],
  }),
  component: OnboardingRolePage,
});

function OnboardingRolePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>(profile?.role || "donor");
  const [busy, setBusy] = useState(false);

  const roles = [
    {
      id: "donor" as Role,
      icon: UtensilsCrossed,
      title: "Food Donor",
      tagline: "I have surplus food to share",
      desc: "Restaurants, Caterers, College Hostels, Supermarkets, Banquets, and Generous Households.",
      color: "border-[#ED7545] text-[#ED7545] bg-[#ED7545]/10",
    },
    {
      id: "recipient" as Role,
      icon: Building2,
      title: "Recipient Organization",
      tagline: "I distribute food to those in need",
      desc: "Charitable Trusts, Night Shelters, Children's Homes, and Community Feeding Programs.",
      color: "border-[#205C43] text-[#205C43] bg-[#205C43]/10",
    },
    {
      id: "volunteer" as Role,
      icon: Bike,
      title: "Delivery Hero",
      tagline: "I help transport food from donor to shelter",
      desc: "Community volunteers on bikes, scooters, cars, or on foot who ensure timely collection.",
      color: "border-[#3F8F62] text-[#3F8F62] bg-[#3F8F62]/10",
    },
  ];

  async function handleContinue() {
    setBusy(true);
    try {
      if (user) {
        await updateProfile(user.uid, { role: selectedRole });
      }
      toast.success(`Role selected: ${selectedRole.toUpperCase()}`);
      navigate({ to: "/onboarding/profile" });
    } catch {
      navigate({ to: "/onboarding/profile" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#242923] flex flex-col justify-between">
      <header className="border-b border-[#E2DBD0] bg-white p-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Logo size="sm" />
          <span className="text-xs font-bold text-[#656C62]">Step 1 of 2</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="rounded-3xl border border-[#DDD5C8] bg-white p-8 shadow-sm">
          <div className="text-center">
            <h1 className="font-display text-3xl font-extrabold text-[#242923]">How will you use FoodLoop?</h1>
            <p className="mt-1 text-xs text-[#656C62]">
              Select your primary participation role. You can always update this later from your workspace.
            </p>
          </div>

          <div className="mt-8 space-y-3.5">
            {roles.map((r) => {
              const active = selectedRole === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-all ${
                    active
                      ? "border-[#205C43] bg-[#205C43]/5 ring-2 ring-[#205C43]/20 shadow-xs"
                      : "border-[#DDD5C8] hover:border-[#205C43]/50 bg-white"
                  }`}
                >
                  <div className={`grid size-12 place-items-center rounded-2xl ${r.color}`}>
                    <r.icon className="size-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-[#242923]">{r.title}</h3>
                      {active && (
                        <span className="grid size-5 place-items-center rounded-full bg-[#205C43] text-white">
                          <Check className="size-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#205C43]">{r.tagline}</p>
                    <p className="mt-1 text-[11px] text-[#656C62] leading-relaxed">{r.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-[#DDD5C8]">
            <button
              type="button"
              disabled={busy}
              onClick={handleContinue}
              className="w-full rounded-full bg-[#205C43] py-3.5 text-xs font-bold text-white shadow-xs hover:brightness-105 disabled:opacity-50"
            >
              Continue to Profile Setup →
            </button>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-[#656C62]">
        <p>© FoodLoop Inc. Good food. Shared with purpose.</p>
      </footer>
    </div>
  );
}
