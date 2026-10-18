import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, Bookmark, ShoppingBag, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function MobileBottomNav() {
  const { user, profile } = useAuth();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  // Determine portal route for profile tab
  const portalPath = profile?.role === "donor"
    ? "/donor"
    : profile?.role === "volunteer"
    ? "/volunteer"
    : profile?.role === "admin"
    ? "/admin"
    : "/recipient";

  const navItems = [
    {
      label: "Home",
      to: "/",
      icon: Home,
      active: currentPath === "/",
    },
    {
      label: "Discover",
      to: "/explore",
      icon: Compass,
      active: currentPath.startsWith("/explore") || currentPath.startsWith("/donations"),
    },
    {
      label: "Community",
      to: "/community",
      icon: Bookmark,
      active: currentPath.startsWith("/community"),
    },
    {
      label: "Orders",
      to: user ? portalPath : "/login",
      icon: ShoppingBag,
      active: currentPath.startsWith("/donor") || currentPath.startsWith("/recipient") || currentPath.startsWith("/volunteer"),
      badge: user ? "Live" : undefined,
    },
    {
      label: user ? "Portal" : "Sign In",
      to: user ? portalPath : "/login",
      icon: User,
      active: currentPath === "/login" || currentPath === "/signup" || currentPath === portalPath,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#DDD5C8] px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-5 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 transition-all relative ${
                item.active ? "text-[#205C43] font-bold" : "text-[#656C62] hover:text-[#205C43]"
              }`}
            >
              <div className="relative">
                <Icon className={`size-5 transition-transform ${item.active ? "scale-110 text-[#205C43]" : ""}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 text-[8px] font-black rounded-full bg-[#ED7545] text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${item.active ? "font-bold text-[#205C43]" : "font-medium"}`}>
                {item.label}
              </span>
              {item.active && (
                <span className="absolute bottom-0 w-4 h-0.5 rounded-full bg-[#205C43]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
