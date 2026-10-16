import { Link } from "@tanstack/react-router";
import { Clock, MapPin, ShieldAlert, Package } from "lucide-react";
import { STATUS_LABEL, type Listing, type Status } from "@/lib/types";
import { timeLeft, urgencyOf, type Urgency } from "@/lib/priority";

const statusCls: Record<Status, string> = {
  available: "bg-success/15 text-success",
  reserved: "bg-saffron/20 text-accent-foreground",
  assigned: "bg-chart-4/15 text-chart-4",
  picked_up: "bg-primary/15 text-primary",
  completed: "bg-primary text-primary-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusCls[status]}`}>{STATUS_LABEL[status]}</span>;
}

const urgCls: Record<Urgency, string> = {
  expired: "bg-muted text-muted-foreground",
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-warning text-saffron-foreground",
  normal: "bg-secondary text-secondary-foreground",
};

export function UrgencyBadge({ deadline }: { deadline: number }) {
  const u = urgencyOf(deadline);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${urgCls[u]}`}>
      <Clock className="size-3" /> {timeLeft(deadline)}
    </span>
  );
}

export function SafetyNote({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex gap-2 rounded-2xl border border-warning/40 bg-warning/10 p-3.5 text-xs text-accent-foreground">
      <ShieldAlert className="size-4 shrink-0 text-[#ED7545] mt-0.5" />
      <p>
        Food is shared by community donors on a good-faith basis. FoodLoop maintains strict checklists and verification, but recipients must always inspect food, review declared allergens, and store food appropriately.{!compact && " Discard anything that looks, smells, or feels unsuitable."}
      </p>
    </div>
  );
}

export function ListingCard({ l }: { l: Listing }) {
  return (
    <Link
      to="/donations/$id"
      params={{ id: l.id }}
      className="group overflow-hidden rounded-3xl border border-[#DDD5C8] bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-lg hover:border-[#205C43]/40 flex flex-col justify-between"
    >
      <div>
        <div className="relative aspect-[16/10] bg-muted overflow-hidden">
          {l.photo ? (
            <img
              src={l.photo}
              alt={l.title}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="grid size-full place-items-center text-muted-foreground"><Package className="size-10" /></div>
          )}
          <div className="absolute left-2.5 top-2.5 flex gap-1.5">
            {l.status === "available" ? <UrgencyBadge deadline={l.pickupDeadline} /> : <StatusBadge status={l.status} />}
          </div>
          <span className="absolute right-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold shadow-xs backdrop-blur-sm">
            {l.foodType === "non-veg" ? "🔴 Non-veg" : l.foodType === "vegan" ? "🌱 Vegan" : "🟢 Veg"}
          </span>
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/60 text-white backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold">
            📍 0.4 - 2.5 miles away
          </span>
        </div>
        <div className="space-y-1.5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{l.category}</p>
            <span className="text-xs font-bold text-primary">{l.quantity} {l.unit}</span>
          </div>
          <h3 className="line-clamp-1 font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
            {l.title}
          </h3>
          <p className="flex items-center gap-1 text-xs text-muted-foreground line-clamp-1">
            <MapPin className="size-3 shrink-0 text-primary" /> {l.locationText}
          </p>

          {/* Food Community Rating (matching user's uploaded mockup: 4.7 stars) */}
          <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold pt-0.5">
            <span>★★★★★</span>
            <span className="text-[11px] text-[#242923] font-bold">4.8</span>
            <span className="text-[10px] text-muted-foreground font-normal">(Verified Kitchen)</span>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate max-w-[70%]">
            {l.donorAvatar ? (
              <img src={l.donorAvatar} alt={l.donorName} className="size-4 rounded-full object-cover" />
            ) : (
              <span className="grid size-4 place-items-center rounded-full bg-saffron/20 text-[9px] font-bold text-accent-foreground">
                {(l.donorName || "D")[0]?.toUpperCase()}
              </span>
            )}
            <span className="truncate font-medium text-[11px]">{l.donorName}</span>
          </div>
          <span className="inline-flex items-center rounded-full bg-[#205C43]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#205C43] group-hover:bg-[#205C43] group-hover:text-white transition-all">
            Reserve →
          </span>
        </div>
      </div>
    </Link>
  );
}
