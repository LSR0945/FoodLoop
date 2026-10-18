import type { Checklist, Listing } from "./types";

export type Urgency = "expired" | "critical" | "high" | "normal";

const HOUR = 3600_000;
/** Cooked meals must be collected within this many hours of preparation. */
export const COOKED_MAX_HOURS = 8;

export function urgencyOf(deadline: number, now = Date.now()): Urgency {
  const left = deadline - now;
  if (left <= 0) return "expired";
  if (left <= HOUR) return "critical";
  if (left <= 3 * HOUR) return "high";
  return "normal";
}

/** Higher = should be picked up sooner. Expired items score -1 and are never promoted. */
export function priorityScore(l: Pick<Listing, "pickupDeadline" | "quantity">, now = Date.now()) {
  const left = l.pickupDeadline - now;
  if (left <= 0) return -1;
  const hours = left / HOUR;
  return Math.round((100 / (hours + 0.5)) * 10 + Math.min(l.quantity, 200) / 10);
}

export function isOpen(l: Pick<Listing, "status" | "pickupDeadline">, now = Date.now()) {
  return l.status === "available" && l.pickupDeadline > now;
}

export function timeLeft(deadline: number, now = Date.now()) {
  const ms = deadline - now;
  if (ms <= 0) return "Expired";
  const h = Math.floor(ms / HOUR);
  const m = Math.floor((ms % HOUR) / 60000);
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
}

export interface ListingDraft {
  category: string;
  quantity: number;
  preparedAt: number;
  pickupDeadline: number;
  checklist: Checklist;
  safetyDeclared: boolean;
}

/** Returns an error message, or null when the listing may be published. */
export function validateListing(d: ListingDraft, now = Date.now()): string | null {
  if (!(d.quantity > 0)) return "Quantity must be greater than zero.";
  if (d.preparedAt > now + 5 * 60_000) return "Preparation time cannot be in the future.";
  if (d.pickupDeadline <= now) return "Pickup deadline must be in the future.";
  if (d.pickupDeadline <= d.preparedAt) return "Pickup deadline must be after preparation time.";
  if (d.category === "Cooked meals" && d.pickupDeadline - d.preparedAt > COOKED_MAX_HOURS * HOUR)
    return `Cooked meals must be collected within ${COOKED_MAX_HOURS} hours of preparation.`;
  const c = d.checklist;
  if (!c.covered || !c.temperature || !c.hygienic || !c.notExpired)
    return "Please complete every item of the food handling checklist.";
  if (!d.safetyDeclared) return "Please confirm the safety declaration.";
  return null;
}
