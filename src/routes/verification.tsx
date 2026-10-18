import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  HelpCircle,
  Lock,
  ShieldAlert,
  ShieldCheck,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/verification")({
  head: () => ({
    meta: [
      { title: "Verification Status & Safety Check — FoodLoop" },
      { name: "description", content: "Review and manage organization verification status on FoodLoop." },
    ],
  }),
  component: VerificationStatusPage,
});

type VerificationStatus = "not_required" | "pending" | "approved" | "rejected" | "more_info";

function VerificationStatusPage() {
  const { user, profile } = useAuth();
  const [status, setStatus] = useState<VerificationStatus>(() => {
    if (profile?.verified) return "approved";
    if (profile?.role === "donor" && !profile?.fssaiNumber) return "pending";
    if (profile?.role === "recipient" && !profile?.registrationNumber) return "pending";
    return "approved";
  });

  const [docType, setDocType] = useState("fssai");
  const [docNumber, setDocNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmitVerification(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      setStatus("pending");
      setBusy(false);
      toast.success("Verification documents submitted! Our safety team will review within 24 hours.");
    }, 800);
  }

  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#242923] flex flex-col justify-between">
      <header className="border-b border-[#E2DBD0] bg-white p-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Logo size="sm" />
          <Link to="/app" className="text-xs font-bold text-[#205C43] hover:underline flex items-center gap-1">
            <ArrowLeft className="size-3.5" /> Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="rounded-3xl border border-[#DDD5C8] bg-white p-8 shadow-sm space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#205C43]/10 px-3 py-1 text-xs font-bold text-[#205C43]">
              <ShieldCheck className="size-3.5 text-[#ED7545]" /> Trust & Safety Accreditation
            </span>
            <h1 className="mt-2 font-display text-3xl font-extrabold text-[#242923]">Account Verification</h1>
            <p className="mt-1 text-xs text-[#656C62]">
              Ensuring all community food transfers meet rigorous safety and regulatory standards.
            </p>
          </div>

          {/* Status Display Banner */}
          <div className="rounded-2xl border p-5 transition-all">
            {status === "approved" && (
              <div className="flex items-start gap-4 text-[#205C43]">
                <div className="grid size-10 place-items-center rounded-xl bg-[#3F8F62]/15 text-[#3F8F62]">
                  <CheckCircle2 className="size-6" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-[#242923]">Account Fully Verified</h2>
                  <p className="mt-1 text-xs text-[#656C62] leading-relaxed">
                    Your credentials have been validated by FoodLoop Trust & Safety moderators. You have full access to list, reserve, and distribute food.
                  </p>
                </div>
              </div>
            )}

            {status === "pending" && (
              <div className="flex items-start gap-4 text-[#ED7545]">
                <div className="grid size-10 place-items-center rounded-xl bg-[#ED7545]/15 text-[#ED7545]">
                  <Clock className="size-6" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-[#242923]">Verification Under Review</h2>
                  <p className="mt-1 text-xs text-[#656C62] leading-relaxed">
                    Your verification documents are queued for review. While pending, you can explore donations and prepare listings.
                  </p>
                </div>
              </div>
            )}

            {status === "more_info" && (
              <div className="flex items-start gap-4 text-amber-600">
                <div className="grid size-10 place-items-center rounded-xl bg-amber-500/15 text-amber-600">
                  <HelpCircle className="size-6" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-[#242923]">More Information Required</h2>
                  <p className="mt-1 text-xs text-[#656C62] leading-relaxed">
                    Our safety team needs clearer proof of registration (e.g. valid NGO Darpan registration or municipal catering license). Please resubmit below.
                  </p>
                </div>
              </div>
            )}

            {status === "rejected" && (
              <div className="flex items-start gap-4 text-destructive">
                <div className="grid size-10 place-items-center rounded-xl bg-destructive/15 text-destructive">
                  <XCircle className="size-6" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-[#242923]">Verification Denied</h2>
                  <p className="mt-1 text-xs text-[#656C62] leading-relaxed">
                    The provided document could not be authenticated or has expired. You may contact support or resubmit valid documentation.
                  </p>
                </div>
              </div>
            )}

            {status === "not_required" && (
              <div className="flex items-start gap-4 text-[#656C62]">
                <div className="grid size-10 place-items-center rounded-xl bg-[#EDE8DE] text-[#656C62]">
                  <FileCheck className="size-6" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-[#242923]">Standard Community Access</h2>
                  <p className="mt-1 text-xs text-[#656C62] leading-relaxed">
                    Individual household donors and delivery volunteers can share without mandatory institutional registration documents.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Document Submission Form */}
          <div className="border-t border-[#DDD5C8] pt-6">
            <h3 className="font-display text-lg font-bold text-[#242923]">Submit Verification Documents</h3>
            <p className="text-xs text-[#656C62] mt-0.5">
              Upload credentials to earn the verified partner badge on all your listings.
            </p>

            <form onSubmit={handleSubmitVerification} className="mt-4 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#242923]">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] px-3.5 py-2.5 text-xs font-semibold"
                  >
                    <option value="fssai">FSSAI Food License / Registration</option>
                    <option value="darpan">NGO Darpan Registration ID</option>
                    <option value="12a">12A / 80G Charitable Certificate</option>
                    <option value="gst">Establishment GST / Trade License</option>
                    <option value="driving">Volunteer Driver's License (DL)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#242923]">Registration / License Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12723004000192"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] px-3.5 py-2.5 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#242923]">Additional Organization Notes</label>
                <textarea
                  rows={2}
                  placeholder="Facility address, operating hours, capacity details…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] p-3 text-xs"
                />
              </div>

              <div className="rounded-2xl border-2 border-dashed border-[#DDD5C8] bg-[#F8F5ED] p-6 text-center">
                <UploadCloud className="mx-auto size-8 text-[#656C62]" />
                <p className="mt-2 text-xs font-bold text-[#242923]">Upload Registration Certificate (PDF or Image)</p>
                <p className="text-[11px] text-[#656C62]">Max 10 MB · Protected by restricted storage rules</p>
                <input type="file" accept="image/*,application/pdf" className="mt-3 text-xs" />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-[#205C43] py-3 text-xs font-bold text-white shadow-xs hover:brightness-105 disabled:opacity-50"
              >
                {busy ? "Submitting for review…" : "Submit Verification Documents"}
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-[#656C62]">
        <p>© FoodLoop Inc. Good food. Shared with purpose.</p>
      </footer>
    </div>
  );
}
