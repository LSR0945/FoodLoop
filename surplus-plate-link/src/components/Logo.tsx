import { Link } from "@tanstack/react-router";

interface LogoProps {
  light?: boolean;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function Logo({ light = false, size = "md", showTagline = true }: LogoProps) {
  const imgSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link to="/" className="group inline-flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
      {/* Brand Logo Image */}
      <img
        src="/foodloop-logo.png"
        alt="FoodLoop Logo"
        className={`${imgSizes[size]} object-contain rounded-xl transition-transform group-hover:rotate-6`}
      />

      {/* Brand Typography */}
      <div className="flex flex-col leading-tight">
        <span className={`font-display font-extrabold tracking-tight ${textSizes[size]}`}>
          <span className={light ? "text-white" : "text-[#205C43]"}>Food</span>
          <span className="text-[#ED7545]">Loop</span>
        </span>
        {showTagline && (
          <span className={`hidden sm:inline-block -mt-0.5 text-[10px] font-semibold tracking-wide ${light ? "text-white/80" : "text-muted-foreground"}`}>
            Good food. Shared with purpose.
          </span>
        )}
      </div>
    </Link>
  );
}
