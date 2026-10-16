import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Home, PlusCircle, User } from "lucide-react";
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

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="animate-pulse text-muted-foreground">Loading AnnSetu…</p>
      </div>
    );
  }
  if (!user) {
    navigate({ to: "/auth", replace: true });
    return null;
  }

  const tabs = [
    { to: "/app", icon: Home, label: "Feed", exact: true },
    { to: "/app/donate", icon: PlusCircle, label: "Donate" },
    { to: "/app/notifications", icon: Bell, label: "Alerts", badge: unread },
    { to: "/app/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-1 sm:flex">
            {tabs.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className={`relative rounded-full px-4 py-2 text-sm font-semibold ${
                  pathname === t.to ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {t.label}
                {!!t.badge && (
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {t.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <span className="rounded-full bg-saffron/20 px-3 py-1 text-xs font-semibold capitalize text-accent-foreground sm:hidden">
            {profile?.role ?? ""}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card sm:hidden">
        <div className="grid grid-cols-4">
          {tabs.map((t) => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <t.icon className="size-5" />
                {t.label}
                {!!t.badge && (
                  <span className="absolute right-[22%] top-1 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                    {t.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
