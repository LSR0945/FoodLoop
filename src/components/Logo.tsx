import { Link } from "@tanstack/react-router";

interface LogoProps {
  light?: boolean;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function Logo({ light = false, size = "md", showTagline = true }: LogoProps) {
  const iconSizes = {
    sm: "size-8",
    md: "size-10",
    lg: "size-14",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link to="/" className="group inline-flex items-center gap-3 transition-transform hover:scale-[1.02]">
      {/* Official User Logo Artwork */}
      <img
        src="/bhojanbandhu-logo.png"
        alt="BhojanBandhu Official Logo"
        className={`shrink-0 rounded-full object-cover shadow-sm ring-1 ring-emerald-600/20 ${iconSizes[size]}`}
      />

      {/* Brand Typography */}
      <div className="flex flex-col">
        <span className={`font-display font-extrabold tracking-tight ${textSizes[size]}`}>
          <span className={light ? "text-white" : "text-[#1b4332]"}>Bhojan</span>
          <span className="text-[#e27d19]">Bandhu</span>
        </span>
        {showTagline && (
          <span className={`-mt-1 text-[10px] font-medium tracking-wide ${light ? "text-white/80" : "text-muted-foreground"}`}>
            nourishing with community & care
          </span>
        )}
      </div>
    </Link>
  );
}
