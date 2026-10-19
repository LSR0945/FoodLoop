import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useNavigate,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/lib/auth";
import { MobileBottomNav } from "@/components/MobileBottomNav";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try refreshing.</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#205C43" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { title: "FoodLoop — Good food. Shared with purpose." },
      { name: "description", content: "FoodLoop is a community-driven surplus food donation and collection platform connecting donors, recipients, and volunteers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.json" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/foodloop-logo.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Manrope:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  if (typeof document !== "undefined") {
    return <>{children}</>;
  }
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGate>
          <Outlet />
        </AuthGate>
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}

const AUTH_SCREENS = ["/login", "/signup", "/auth", "/forgot-password", "/reset-password", "/verify-email"];

function AppSplash() {
  return (
    <div
      data-app-splash="true"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#0E3323] via-[#123A2A] to-[#081F15] text-white"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[#3F8F62]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-[#ED7545]/15 blur-3xl" />
      <div className="relative flex flex-col items-center">
        <div className="animate-in zoom-in-75 fade-in grid size-24 place-items-center rounded-[1.75rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl duration-500">
          <img src="/foodloop-logo.png" alt="FoodLoop" className="size-16 rounded-2xl object-contain" />
        </div>
        <p className="mt-5 font-display text-2xl font-extrabold tracking-tight">
          <span className="text-white">Food</span>
          <span className="text-[#ED7545]">Loop</span>
        </p>
        <p className="mt-1 text-[11px] font-semibold tracking-wide text-white/60">
          Good food. Shared with purpose.
        </p>
        <div className="mt-8 h-1 w-28 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 rounded-full bg-[#ED7545] animate-[splashbar_1.1s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}

/**
 * Real-app behavior: the app opens on the branded splash, then anyone who is
 * not signed in is sent straight to Login / Registration. The rest of the app
 * is only reachable after authentication.
 */
function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const isAuthScreen = AUTH_SCREENS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  useEffect(() => {
    if (loading || user) return;
    if (!isAuthScreen) navigate({ to: "/login", replace: true });
  }, [loading, user, isAuthScreen, navigate]);

  if (!isAuthScreen && !user) {
    return <AppSplash />;
  }

  return (
    <>
      <div className={isAuthScreen ? undefined : "pb-14 md:pb-0"}>{children}</div>
      {!isAuthScreen && <MobileBottomNav />}
    </>
  );
}
