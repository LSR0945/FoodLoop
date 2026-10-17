import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app")({
  component: AppShell,
});

/**
 * The /app index acts as a smart redirect hub.
 * It sends each authenticated user directly to their role-specific portal.
 * Child routes (/app/donate, /app/profile, /app/listing/$id, ...) render normally.
 */
function AppShell() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAppIndex = location.pathname === "/app" || location.pathname === "/app/";

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate({ to: "/auth", replace: true });
      return;
    }

    // Only the /app index redirects; child routes render their own content.
    if (!isAppIndex) return;

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
  }, [loading, user, profile, navigate, isAppIndex]);

  // Child routes render their own content directly.
  if (!isAppIndex) return <Outlet />;

  // Show branded loading/redirect screen only on the /app index hub.
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6" style={{ background: "var(--color-cream)" }}>
      <Logo size="lg" />
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
        <p className="text-sm font-medium text-gray-500">
          {loading ? "Loading FoodLoop…" : "Redirecting to your portal…"}
        </p>
      </div>
    </div>
  );
}
