import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { BarChart3, Bell, Building2, Home, PlusCircle, UtensilsCrossed, User, Users } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { useNotifications } from "@/lib/db";

export const Route = createFileRoute("/app")({
  component: AppShell,
});

function AppShell() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: notifs } = useNotifications(user?.uid);
  const unread = notifs.filter((n) => !n.read).length;
  const role = profile?.role;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="animate-pulse text-sm text-muted-foreground">Loading BhojanBandhu…</p>
      </div>
    );
  }

  if (!user) {
    navigate({ to: "/auth", replace: true });
    return null;
  }

  // Role-specific tabs
  const donorTabs = [
    { to: "/app", icon: Home, label: "Feed", exact: true },
    { to: "/app/donate", icon: PlusCircle, label: "Donate" },
    { to: "/app/notifications", icon: Bell, label: "Alerts", badge: unread },
    { to: "/app/profile", icon: User, label: "Profile" },
  ];

  const ngoTabs = [
    { to: "/app", icon: Home, label: "Browse", exact: true },
    { to: "/app/report", icon: BarChart3, label: "Report" },
    { to: "/app/notifications", icon: Bell, label: "Alerts", badge: unread },
    { to: "/app/profile", icon: Building2, label: "My NGO" },
  ];

  const volunteerTabs = [
    { to: "/app", icon: Home, label: "Pickups", exact: true },
    { to: "/app/report", icon: BarChart3, label: "Report" },
    { to: "/app/notifications", icon: Bell, label: "Alerts", badge: unread },
    { to: "/app/profile", icon: User, label: "Profile" },
  ];

  const tabs = role === "ngo" ? ngoTabs : role === "volunteer" ? volunteerTabs : donorTabs;

  const roleLabel =
    role === "ngo" ? "🏢 NGO Partner" : role === "volunteer" ? "🚴 Volunteer" : "🍲 Food Donor";

  const roleColor =
    role === "ngo"
      ? "bg-emerald-500/15 text-emerald-800"
      : role === "volunteer"
      ? "bg-blue-500/15 text-blue-800"
      : "bg-saffron/20 text-accent-foreground";

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      {/* Top Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Logo />

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 sm:flex">
            {tabs.map((t) => {
              const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  id={`nav-${t.label.toLowerCase()}`}
                  className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {t.label}
                  {!!t.badge && (
                    <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                      {t.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Role Badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${roleColor}`}>
              {roleLabel}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card/95 backdrop-blur sm:hidden">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
          {tabs.map((t) => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                id={`mobile-nav-${t.label.toLowerCase()}`}
                className={`relative flex flex-col items-center gap-0.5 py-3 text-[11px] font-semibold transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className={`relative flex size-6 items-center justify-center rounded-lg transition-all ${active ? "bg-primary/10" : ""}`}>
                  <Icon className="size-5" />
                  {!!t.badge && (
                    <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                      {t.badge}
                    </span>
                  )}
                </div>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
