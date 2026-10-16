import { Link } from "@tanstack/react-router";
import { Utensils, Repeat } from "lucide-react";

interface LogoProps {
  light?: boolean;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function Logo({ light = false, size = "md", showTagline = true }: LogoProps) {
  const iconSizes = {
    sm: "size-8",
    md: "size-10",
    lg: "size-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link to="/" className="group inline-flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
      {/* Brand Emblem Icon: FoodLoop circular badge with loop accent */}
      <div
        className={`relative grid place-items-center rounded-2xl bg-[#205C43] shadow-sm ring-2 ring-[#3F8F62]/30 transition-transform group-hover:rotate-6 ${iconSizes[size]}`}
      >
        <Utensils className="size-5 text-[#F8F5ED]" />
        <span className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-[#ED7545] text-white shadow-xs">
          <Repeat className="size-2.5" />
        </span>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <span className={`font-display font-extrabold tracking-tight ${textSizes[size]}`}>
          <span className={light ? "text-white" : "text-[#205C43]"}>Food</span>
          <span className="text-[#ED7545]">Loop</span>
        </span>
        {showTagline && (
          <span className={`-mt-1 text-[10px] font-semibold tracking-wide ${light ? "text-white/80" : "text-muted-foreground"}`}>
            Good food. Shared with purpose.
          </span>
        )}
      </div>
    </Link>
  );
}
