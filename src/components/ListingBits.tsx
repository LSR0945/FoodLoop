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
    <div className="flex gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-accent-foreground">
      <ShieldAlert className="size-4 shrink-0" />
      <p>
        Food is shared by community donors on a good-faith basis. BhojanBandhu does not guarantee that any item is safe to
        eat.{!compact && " Recipients must inspect food, check allergen information, follow local food-safety rules, and discard anything that looks, smells or feels unsuitable."}
      </p>
    </div>
  );
}

export function ListingCard({ l }: { l: Listing }) {
  return (
    <Link
      to="/app/listing/$id"
      params={{ id: l.id }}
      className="group overflow-hidden rounded-2xl bg-card shadow-card transition hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] bg-muted">
        {l.photo ? (
          <img src={l.photo} alt={l.title} className="size-full object-cover" loading="lazy" />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground"><Package className="size-10" /></div>
        )}
        <div className="absolute left-2 top-2 flex gap-1">
          {l.status === "available" ? <UrgencyBadge deadline={l.pickupDeadline} /> : <StatusBadge status={l.status} />}
        </div>
        <span className="absolute right-2 top-2 rounded-full bg-card/90 px-2 py-0.5 text-xs font-semibold">
          {l.foodType === "non-veg" ? "🔴 Non-veg" : l.foodType === "vegan" ? "🌱 Vegan" : "🟢 Veg"}
        </span>
      </div>
      <div className="space-y-1 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{l.category}</p>
        <h3 className="line-clamp-1 text-lg font-semibold">{l.title}</h3>
        <p className="text-sm font-semibold text-primary">{l.quantity} {l.unit}</p>
        <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-3.5" />{l.locationText}</p>
        <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate">
            {l.donorAvatar ? (
              <img src={l.donorAvatar} alt={l.donorName} className="size-4 rounded-full object-cover" />
            ) : (
              <span className="grid size-4 place-items-center rounded-full bg-saffron/20 text-[9px] font-bold text-accent-foreground">
                {(l.donorName || "D")[0]?.toUpperCase()}
              </span>
            )}
            <span className="truncate font-medium">{l.donorName}</span>
          </div>
          <span className="text-[11px] font-semibold text-primary">Details →</span>
        </div>
      </div>
    </Link>
  );
}
