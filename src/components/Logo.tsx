import { Link } from "@tanstack/react-router";

interface LogoProps {
  light?: boolean;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function Logo({ light = false, size = "md", showTagline = false }: LogoProps) {
  const iconSizes = {
    sm: "size-7",
    md: "size-9",
    lg: "size-11",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link to="/" className="group inline-flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
      {/* Brand Emblem */}
      <div
        className={`relative grid shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-saffron via-amber-500 to-emerald-600 p-[2px] shadow-md shadow-saffron/20 ${iconSizes[size]}`}
      >
        <div className="flex size-full items-center justify-center rounded-[14px] bg-card text-foreground">
          {/* Custom SVG Icon representing warm food bowl + caring hands */}
          <svg viewBox="0 0 32 32" fill="none" className="size-5/6 text-saffron drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
            {/* Rising steam / aroma spirals */}
            <path
              d="M11 6C11 8 13 8 13 10M16 4C16 6.5 18 6.5 18 9M21 6C21 8 23 8 23 10"
              stroke="#F59E0B"
              strokeWidth="1.75"
              strokeLinecap="round"
              className="animate-pulse"
            />
            {/* Warm nourishing food bowl */}
            <path
              d="M6 13C6 19.5 10.5 24 16 24C21.5 24 26 19.5 26 13H6Z"
              fill="currentColor"
            />
            {/* Bowl rim */}
            <path
              d="M5 13H27"
              stroke="#D97706"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Supporting caring hands base */}
            <path
              d="M12 25L10 28M20 25L22 28M9 28H23"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <span className={`font-display font-extrabold tracking-tight ${textSizes[size]}`}>
          <span className={light ? "text-white" : "text-primary"}>Bhojan</span>
          <span className="text-saffron">Bandhu</span>
        </span>
        {showTagline && (
          <span className={`-mt-1 text-[10px] font-medium tracking-wide ${light ? "text-white/70" : "text-muted-foreground"}`}>
            Surplus Food • Zero Waste
          </span>
        )}
      </div>
    </Link>
  );
}
