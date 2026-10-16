import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app")({
  component: AppShell,
});

/**
 * The /app shell acts as a smart redirect hub.
 * It sends each authenticated user directly to their role-specific portal.
 * Unauthenticated users are sent to /auth.
 */
function AppShell() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate({ to: "/auth", replace: true });
      return;
    }

    // Route each role to its dedicated portal
    const role = profile?.role;
    if (role === "donor") {
      navigate({ to: "/donor", replace: true });
    } else if (role === "recipient" || role === "ngo") {
      navigate({ to: "/recipient", replace: true });
    } else if (role === "volunteer") {
      navigate({ to: "/volunteer", replace: true });
    } else if (role === "admin") {
      navigate({ to: "/admin", replace: true });
    } else {
      // Unknown/missing role — go to auth to pick role
      navigate({ to: "/auth", replace: true });
    }
  }, [loading, user, profile, navigate]);

  // Show branded loading screen while redirecting
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6" style={{ background: "var(--color-cream)" }}>
      <Logo size="lg" />
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
        <p className="text-sm font-medium text-gray-500">
          {loading ? "Loading FoodLoop…" : "Redirecting to your portal…"}
        </p>
      </div>
      {/* Render Outlet for any child routes that might match */}
      <Outlet />
    </div>
  );
}
