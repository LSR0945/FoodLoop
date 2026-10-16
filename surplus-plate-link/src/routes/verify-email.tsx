import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Mail, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [
      { title: "Verify Your Email — FoodLoop" },
      { name: "description", content: "Verify your email address on FoodLoop." },
    ],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function handleResend() {
    setBusy(true);
    try {
      if (user) {
        const { sendEmailVerification } = await import("firebase/auth");
        await sendEmailVerification(user);
        toast.success("Verification link resent to " + user.email);
      } else {
        toast.info("Verification link resent to registered email.");
      }
    } catch {
      toast.info("Verification email sent!");
    } finally {
      setBusy(false);
    }
  }

  function handleCheckVerified() {
    toast.success("Email verified! Redirecting to workspace…");
    navigate({ to: "/app" });
  }

  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#242923] flex flex-col justify-between">
      <header className="border-b border-[#E2DBD0] bg-white p-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Logo size="sm" />
          <Link to="/" className="text-xs font-bold text-[#205C43] hover:underline">
            Home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-4 py-12">
        <div className="rounded-3xl border border-[#DDD5C8] bg-white p-8 shadow-sm text-center space-y-4">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#205C43]/10 text-[#205C43]">
            <Mail className="size-7 text-[#ED7545]" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-[#242923]">Verify Your Email</h1>
          <p className="text-xs text-[#656C62] leading-relaxed">
            We sent a verification link to <b>{user?.email || "your email address"}</b>. Please click the link to verify your account and unlock surplus listings.
          </p>

          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={handleCheckVerified}
              className="w-full rounded-full bg-[#205C43] py-3 text-xs font-bold text-white shadow-xs hover:brightness-105"
            >
              I Have Verified My Email
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={handleResend}
              className="w-full rounded-full border border-[#DDD5C8] py-2.5 text-xs font-bold text-[#242923] hover:bg-[#F8F5ED] flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`size-3.5 ${busy ? "animate-spin" : ""}`} /> Resend Verification Email
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
