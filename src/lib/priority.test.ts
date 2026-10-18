import { describe, expect, it } from "vitest";
import { priorityScore, urgencyOf, validateListing, isOpen } from "./priority";

const NOW = 1_800_000_000_000;
const H = 3600_000;
const ok = { covered: true, temperature: true, hygienic: true, notExpired: true };
const base = {
  category: "Bakery",
  quantity: 10,
  preparedAt: NOW - H,
  pickupDeadline: NOW + 2 * H,
  checklist: ok,
  safetyDeclared: true,
};

describe("urgency", () => {
  it("is critical within 1 hour", () => expect(urgencyOf(NOW + 30 * 60_000, NOW)).toBe("critical"));
  it("is high within 3 hours", () => expect(urgencyOf(NOW + 2 * H, NOW)).toBe("high"));
  it("is expired after deadline", () => expect(urgencyOf(NOW - 1, NOW)).toBe("expired"));
  it("ranks sooner deadlines higher", () =>
    expect(priorityScore({ pickupDeadline: NOW + H, quantity: 5 }, NOW)).toBeGreaterThan(
      priorityScore({ pickupDeadline: NOW + 5 * H, quantity: 5 }, NOW),
    ));
  it("never promotes expired food", () => {
    expect(priorityScore({ pickupDeadline: NOW - H, quantity: 50 }, NOW)).toBe(-1);
    expect(isOpen({ status: "available", pickupDeadline: NOW - 1 }, NOW)).toBe(false);
  });
});

describe("validateListing", () => {
  it("accepts a valid listing", () => expect(validateListing(base, NOW)).toBeNull());
  it("rejects past deadline", () =>
    expect(validateListing({ ...base, pickupDeadline: NOW - 1 }, NOW)).not.toBeNull());
  it("rejects cooked meals older than 8h at pickup", () =>
    expect(
      validateListing(
        { ...base, category: "Cooked meals", preparedAt: NOW - 7 * H, pickupDeadline: NOW + 2 * H },
        NOW,
      ),
    ).toMatch(/8 hours/));
  it("requires full handling checklist", () =>
    expect(validateListing({ ...base, checklist: { ...ok, hygienic: false } }, NOW)).not.toBeNull());
  it("requires safety declaration", () =>
    expect(validateListing({ ...base, safetyDeclared: false }, NOW)).not.toBeNull());
});
