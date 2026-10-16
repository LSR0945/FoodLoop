import { Link } from "@tanstack/react-router";
import { HandHeart } from "lucide-react";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-display text-xl font-bold ${light ? "text-hero-foreground" : "text-primary"}`}>
      <span className="grid size-8 place-items-center rounded-full bg-saffron text-saffron-foreground">
        <HandHeart className="size-4" />
      </span>
      AnnSetu
    </Link>
  );
}
