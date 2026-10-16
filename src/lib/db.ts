import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { getFirebase } from "./firebase";
import type { AppNotification, DonorRecord, Listing, NGORecord, Profile, Status, VolunteerRecord } from "./types";

export async function notify(userIds: (string | undefined)[], title: string, body: string, listingId?: string) {
  const { db } = await getFirebase();
  const ids = [...new Set(userIds.filter(Boolean) as string[])];
  if (!ids.length) return;
  const batch = writeBatch(db);
  ids.forEach((userId) =>
    batch.set(doc(collection(db, "notifications")), {
      userId,
      title,
      body,
      listingId: listingId ?? null,
      read: false,
      createdAt: Date.now(),
    }),
  );
  await batch.commit().catch(() => {});
}

const entry = (status: Status, by: string, note?: string) => ({ status, at: Date.now(), by, ...(note ? { note } : {}) });

export const SEED_LISTINGS: Listing[] = [
  {
    id: "lst_seed_1",
    donorId: "donor_punjabi_dhaba",
    donorName: "Amritsari Kulcha Junction",
    donorAvatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80",
    donorPhone: "+91 98765 43210",
    title: "Amritsari Chole Kulche & Tangy Pickles",
    description: "Authentic slow-simmered Punjabi chole prepared with whole spices, served with fluffy buttered kulchas and fresh pickled onions. Surplus from an afternoon catering order, hygienically packed in insulated warm containers.",
    category: "Cooked meals",
    foodType: "veg",
    quantity: 50,
    unit: "plates",
    preparedAt: Date.now() - 1.5 * 3600_000,
    pickupDeadline: Date.now() + 3.5 * 3600_000,
    locationText: "Amritsari Kulcha Junction, Mall Road, Mathura",
    pickupInstructions: "Kitchen dispatch counter, speak with Chef Harpreet.",
    storage: "hot",
    allergens: ["Gluten", "Dairy"],
    checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
    photo: "https://images.unsplash.com/photo-1567529692333-de9fd6772897?w=800&auto=format&fit=crop&q=80",
    status: "available",
    createdAt: Date.now() - 1.5 * 3600_000,
    history: [{ status: "available", at: Date.now() - 1.5 * 3600_000, by: "Amritsari Kulcha Junction", note: "Listed freshly prepared chole kulche surplus" }],
  },
  {
    id: "lst_seed_pizza",
    donorId: "donor_bella_pizzeria",
    donorName: "Bella Napoli Pizzeria",
    donorAvatar: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150&auto=format&fit=crop&q=80",
    donorPhone: "+91 98223 99887",
    title: "Wood-Fired Margherita & Veggie Feast Pizzas",
    description: "Freshly baked artisan thin-crust wood-fired pizzas with San Marzano tomato sauce, fresh mozzarella, and aromatic basil. Surplus from evening corporate event, boxed and warm.",
    category: "Cooked meals",
    foodType: "veg",
    quantity: 28,
    unit: "boxes",
    preparedAt: Date.now() - 1 * 3600_000,
    pickupDeadline: Date.now() + 2.5 * 3600_000,
    locationText: "Bella Napoli Pizzeria, High Street, Sector 18",
    pickupInstructions: "Pickup at rear takeout window. Ask for Marco.",
    storage: "hot",
    allergens: ["Gluten", "Dairy"],
    checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
    photo: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    status: "available",
    createdAt: Date.now() - 1 * 3600_000,
    history: [{ status: "available", at: Date.now() - 1 * 3600_000, by: "Bella Napoli Pizzeria", note: "Freshly baked surplus pizzas" }],
  },
  {
    id: "lst_seed_salad",
    donorId: "donor_green_leaf",
    donorName: "Green Leaf Organics",
    donorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    donorPhone: "+91 98112 33445",
    title: "Mediterranean Crisp Salad & Herb Bowls",
    description: "Farm-fresh organic salad bowls with crisp lettuce, cherry tomatoes, cucumbers, bell peppers, and citrus vinaigrette. Kept chilled at 4°C.",
    category: "Cooked meals",
    foodType: "vegan",
    quantity: 35,
    unit: "bowls",
    preparedAt: Date.now() - 2 * 3600_000,
    pickupDeadline: Date.now() + 6 * 3600_000,
    locationText: "Green Leaf Organics, Eco Park Hub",
    pickupInstructions: "Front counter, speak to Sarah.",
    storage: "chilled",
    allergens: [],
    checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
    photo: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&auto=format&fit=crop&q=80",
    status: "available",
    createdAt: Date.now() - 2 * 3600_000,
    history: [{ status: "available", at: Date.now() - 2 * 3600_000, by: "Green Leaf Organics", note: "Fresh organic salad bowls listed" }],
  },
  {
    id: "lst_seed_2",
    donorId: "donor_daily_crust",
    donorName: "The Daily Crust Bakery",
    donorAvatar: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150&auto=format&fit=crop&q=80",
    donorPhone: "+91 98223 34455",
    title: "Artisanal Sourdough & Multigrain Loaves",
    description: "Surplus daily morning bake from our artisan bakery. Includes rustic sourdough, golden ciabatta, and seeded rye. Pristine condition.",
    category: "Bakery",
    foodType: "vegan",
    quantity: 35,
    unit: "loaves",
    preparedAt: Date.now() - 3 * 3600_000,
    pickupDeadline: Date.now() + 9 * 3600_000,
    locationText: "The Daily Crust Bakery, Civil Lines",
    pickupInstructions: "Pickup at rear bakery alley dispatch counter.",
    storage: "room",
    allergens: ["Gluten"],
    checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
    photo: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80",
    status: "available",
    createdAt: Date.now() - 3 * 3600_000,
    history: [{ status: "available", at: Date.now() - 3 * 3600_000, by: "The Daily Crust Bakery", note: "Surplus morning artisan bake" }],
  },
  {
    id: "lst_seed_3",
    donorId: "donor_greenfield_mandi",
    donorName: "Greenfield Wholesale Market",
    donorAvatar: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=150&auto=format&fit=crop&q=80",
    donorPhone: "+91 97112 88990",
    title: "Fresh Seasonal Fruit Baskets & Citrus",
    description: "Surplus crates of seasonal Nagpur oranges, ripe bananas, and crisp Shimla apples. Grade A condition, ready to distribute to shelters.",
    category: "Fruits & vegetables",
    foodType: "vegan",
    quantity: 50,
    unit: "kg",
    preparedAt: Date.now() - 4 * 3600_000,
    pickupDeadline: Date.now() + 14 * 3600_000,
    locationText: "Greenfield Wholesale Market, Mandi Yard",
    pickupInstructions: "Shed No. 4, ask for Manager Suresh.",
    storage: "room",
    allergens: [],
    checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
    photo: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&auto=format&fit=crop&q=80",
    status: "available",
    createdAt: Date.now() - 4 * 3600_000,
    history: [{ status: "available", at: Date.now() - 4 * 3600_000, by: "Greenfield Wholesale Market", note: "Farm fresh seasonal fruit donation" }],
  },
  {
    id: "lst_seed_4",
    donorId: "donor_royal_palace",
    donorName: "Royal Palace Caterers",
    donorAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    donorPhone: "+91 94120 77665",
    title: "Creamy Paneer Butter Masala & Tandoori Rotis",
    description: "Surplus from an afternoon corporate luncheon. Stored in hot holding units at 65°C. Cleanly packed in hygienic food-grade tubs.",
    category: "Cooked meals",
    foodType: "veg",
    quantity: 80,
    unit: "plates",
    preparedAt: Date.now() - 1 * 3600_000,
    pickupDeadline: Date.now() + 2.5 * 3600_000,
    locationText: "Royal Palace Convention Center, Sector 12",
    pickupInstructions: "Kitchen entrance at basement B1.",
    storage: "hot",
    allergens: ["Dairy", "Nuts"],
    checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
    photo: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
    status: "available",
    createdAt: Date.now() - 1 * 3600_000,
    history: [{ status: "available", at: Date.now() - 1 * 3600_000, by: "Royal Palace Caterers", note: "Hot cooked meals listed" }],
  },
  {
    id: "lst_seed_5",
    donorId: "donor_natures_basket",
    donorName: "Nature's Basket Organic Mart",
    donorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    donorPhone: "+91 93190 22334",
    title: "Organic Greek Yogurt & Chilled Dairy",
    description: "Overstocked sealed organic plain yogurt tubs and fresh toned milk pouches. Kept chilled continuously at 3°C.",
    category: "Dairy",
    foodType: "veg",
    quantity: 40,
    unit: "tubs",
    preparedAt: Date.now() - 2 * 3600_000,
    pickupDeadline: Date.now() + 5 * 3600_000,
    locationText: "Nature's Basket Organic Mart, Highway Plaza",
    pickupInstructions: "Customer Service Desk, speak to Priya.",
    storage: "chilled",
    allergens: ["Dairy"],
    checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
    photo: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&auto=format&fit=crop&q=80",
    status: "available",
    createdAt: Date.now() - 2 * 3600_000,
    history: [{ status: "available", at: Date.now() - 2 * 3600_000, by: "Nature's Basket Organic Mart", note: "Chilled dairy surplus" }],
  },
  {
    id: "lst_seed_6",
    donorId: "donor_purebites",
    donorName: "PureBites Nutrition Hub",
    donorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    donorPhone: "+91 99180 55443",
    title: "Roasted Nut & Seed Granola Packs",
    description: "Individually sealed high-protein snack boxes. Expiry is well within 3 months, packaging is pristine and moisture-sealed.",
    category: "Packaged food",
    foodType: "vegan",
    quantity: 120,
    unit: "packs",
    preparedAt: Date.now() - 5 * 3600_000,
    pickupDeadline: Date.now() + 24 * 3600_000,
    locationText: "PureBites Nutrition Hub, Sector 4",
    pickupInstructions: "Front warehouse gate, available anytime during business hours.",
    storage: "room",
    allergens: ["Nuts", "Sesame"],
    checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
    photo: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&auto=format&fit=crop&q=80",
    status: "available",
    createdAt: Date.now() - 5 * 3600_000,
    history: [{ status: "available", at: Date.now() - 5 * 3600_000, by: "PureBites Nutrition Hub", note: "Packaged protein food" }],
  },
];

export function getStoredListings(): Listing[] {
  try {
    if (typeof window === "undefined") return SEED_LISTINGS;
    const raw = localStorage.getItem("foodloop_local_listings") || localStorage.getItem("annsetu_local_listings");
    if (!raw) {
      localStorage.setItem("foodloop_local_listings", JSON.stringify(SEED_LISTINGS));
      return SEED_LISTINGS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem("foodloop_local_listings", JSON.stringify(SEED_LISTINGS));
      return SEED_LISTINGS;
    }
    // Ensure all seed listings exist in local cache
    const existingIds = new Set(parsed.map((item: Listing) => item.id));
    const missingSeeds = SEED_LISTINGS.filter(s => !existingIds.has(s.id));
    if (missingSeeds.length > 0) {
      const merged = [...missingSeeds, ...parsed];
      localStorage.setItem("foodloop_local_listings", JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch {
    return SEED_LISTINGS;
  }
}

export function setStoredListings(list: Listing[]) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("foodloop_local_listings", JSON.stringify(list));
      localStorage.setItem("annsetu_local_listings", JSON.stringify(list));
      window.dispatchEvent(new CustomEvent("foodloop_listing_updated"));
      window.dispatchEvent(new CustomEvent("annsetu_listing_updated"));
    }
  } catch {}
}

export async function createListing(data: Omit<Listing, "id" | "status" | "createdAt" | "history">, by: string) {
  let id = "lst_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
  const now = Date.now();
  const newListing: Listing = {
    ...data,
    id,
    status: "available",
    createdAt: now,
    history: [entry("available", by, "Listed on FoodLoop")],
  };

  try {
    const { db } = await getFirebase();
    const ref = await addDoc(collection(db, "listings"), {
      ...data,
      status: "available",
      createdAt: now,
      history: newListing.history,
    });
    id = ref.id;
    newListing.id = id;
  } catch (err) {
    console.warn("Firestore addDoc failed, using resilient local storage:", err);
  }

  const existing = getStoredListings().filter((l) => l.id !== id);
  setStoredListings([newListing, ...existing]);
  return id;
}

async function patch(id: string, data: Record<string, unknown>, status: Status, by: string, note?: string) {
  const current = getStoredListings();
  const idx = current.findIndex((l) => l.id === id);
  if (idx !== -1 && current[idx]) {
    const item = current[idx];
    current[idx] = {
      ...item,
      ...data,
      id: item.id,
      status,
      history: [...(item.history || []), entry(status, by, note)],
    } as Listing;
    setStoredListings(current);
  }

  try {
    const { db } = await getFirebase();
    await updateDoc(doc(db, "listings", id), { ...data, status, history: arrayUnion(entry(status, by, note)) });
  } catch (err) {
    console.warn("Firestore patch failed, local state updated:", err);
  }
}

export async function reserveListing(l: Listing, p: Profile, quantityRequested?: number) {
  const code = String(Math.floor(1000 + Math.random() * 9000));
  const name = p.orgName || p.name;
  const qty = quantityRequested ?? l.quantity;
  await patch(
    l.id,
    {
      reservedBy: p.uid,
      reservedByName: name,
      pickupCode: code,
      reservedQuantity: qty,
    },
    "reserved",
    name,
    `Reserved ${qty} ${l.unit}`,
  );
  await notify(
    [l.donorId],
    "Your donation was reserved",
    `${name} reserved "${l.title}". They'll share pickup code ${code} at handover.`,
    l.id,
  );
}

export async function assignVolunteer(l: Listing, vol: { uid: string; name: string }, by: string) {
  await patch(l.id, { volunteerId: vol.uid, volunteerName: vol.name }, "assigned", by, `Assigned to courier ${vol.name}`);
  await notify([vol.uid], "New pickup task", `Collect "${l.title}" from ${l.locationText} before the deadline.`, l.id);
  await notify([l.donorId], "Collector on the way", `${vol.name} is on the way to collect "${l.title}".`, l.id);
}

export async function markPickedUp(l: Listing, by: string) {
  await patch(l.id, {}, "picked_up", by, "4-digit pickup code verified at handover");
  await notify([l.donorId, l.reservedBy], "Food picked up", `"${l.title}" was verified and collected by ${by}.`, l.id);
}

export async function completeListing(l: Listing, qty: number, note: string, by: string) {
  await patch(
    l.id,
    { quantityDistributed: qty, completionNote: note, completedAt: Date.now() },
    "completed",
    by,
    `${qty} ${l.unit} safely distributed: ${note}`,
  );
  await notify(
    [l.donorId, l.reservedBy, l.volunteerId],
    "Donation completed 🎉",
    `${qty} ${l.unit} of "${l.title}" reached people in need. Thank you for closing the loop!`,
    l.id,
  );
}

export async function cancelListing(l: Listing, by: string) {
  await patch(l.id, {}, "cancelled", by, "Withdrawn by donor");
  await notify([l.reservedBy, l.volunteerId], "Donation withdrawn", `"${l.title}" is no longer available.`, l.id);
}

export async function reportListing(listingId: string, reason: string, details: string, reportedBy: string) {
  const report = {
    id: "rep_" + Date.now(),
    listingId,
    reason,
    details,
    reportedBy,
    createdAt: Date.now(),
    status: "open",
  };
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("foodloop_reports");
      const list = raw ? JSON.parse(raw) : [];
      localStorage.setItem("foodloop_reports", JSON.stringify([report, ...list]));
    }
  } catch {}
  return report;
}

export async function updateProfile(uid: string, data: Partial<Profile>) {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("foodloop_profile_" + uid) || localStorage.getItem("annsetu_profile_" + uid) : null;
    const existing = raw ? JSON.parse(raw) : {};
    const updated = { ...existing, ...data, uid };
    if (typeof window !== "undefined") {
      localStorage.setItem("foodloop_profile_" + uid, JSON.stringify(updated));
      localStorage.setItem("annsetu_profile_" + uid, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("foodloop_profile_updated", { detail: updated }));
      window.dispatchEvent(new CustomEvent("annsetu_profile_updated", { detail: updated }));
    }
  } catch {}

  try {
    const { db } = await getFirebase();
    const { setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "users", uid), data, { merge: true });
  } catch (err) {
    console.warn("Firestore updateProfile failed, saved locally:", err);
  }
}

/** Guaranteed Registration for Food Donors */
export async function registerDonor(data: DonorRecord) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("foodloop_donor_" + data.uid, JSON.stringify(data));
      localStorage.setItem("foodloop_profile_" + data.uid, JSON.stringify({ ...data, role: "donor" }));
      localStorage.setItem("annsetu_profile_" + data.uid, JSON.stringify({ ...data, role: "donor" }));
      window.dispatchEvent(new CustomEvent("foodloop_profile_updated", { detail: { ...data, role: "donor" } }));
      window.dispatchEvent(new CustomEvent("annsetu_profile_updated", { detail: { ...data, role: "donor" } }));

      const rawList = localStorage.getItem("foodloop_donors_table");
      const list = rawList ? JSON.parse(rawList) : [];
      const updatedList = [data, ...list.filter((d: DonorRecord) => d.uid !== data.uid)];
      localStorage.setItem("foodloop_donors_table", JSON.stringify(updatedList));
    }
  } catch {}

  try {
    const { db } = await getFirebase();
    const { setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "donors", data.uid), data, { merge: true });
    await setDoc(doc(db, "users", data.uid), { ...data, role: "donor" }, { merge: true });
  } catch (err) {
    console.warn("Firestore donors table save failed, saved locally:", err);
  }
}

/** Guaranteed Registration for Recipients / NGOs */
export async function registerNGO(data: NGORecord) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("foodloop_recipient_" + data.uid, JSON.stringify(data));
      localStorage.setItem("foodloop_profile_" + data.uid, JSON.stringify({ ...data, role: "recipient", name: data.name || data.contactPerson }));
      localStorage.setItem("annsetu_profile_" + data.uid, JSON.stringify({ ...data, role: "ngo", name: data.name || data.contactPerson }));
      window.dispatchEvent(new CustomEvent("foodloop_profile_updated", { detail: { ...data, role: "recipient" } }));
      window.dispatchEvent(new CustomEvent("annsetu_profile_updated", { detail: { ...data, role: "ngo" } }));

      const rawList = localStorage.getItem("foodloop_recipients_table");
      const list = rawList ? JSON.parse(rawList) : [];
      const updatedList = [data, ...list.filter((n: NGORecord) => n.uid !== data.uid)];
      localStorage.setItem("foodloop_recipients_table", JSON.stringify(updatedList));
    }
  } catch {}

  try {
    const { db } = await getFirebase();
    const { setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "recipients", data.uid), data, { merge: true });
    await setDoc(doc(db, "ngos", data.uid), data, { merge: true });
    await setDoc(doc(db, "users", data.uid), { ...data, role: "recipient", name: data.name || data.contactPerson }, { merge: true });
  } catch (err) {
    console.warn("Firestore recipients table save failed, saved locally:", err);
  }
}

/** Guaranteed Registration for Delivery Volunteers */
export async function registerVolunteer(data: VolunteerRecord) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("foodloop_volunteer_" + data.uid, JSON.stringify(data));
      localStorage.setItem("foodloop_profile_" + data.uid, JSON.stringify({ ...data, role: "volunteer" }));
      localStorage.setItem("annsetu_profile_" + data.uid, JSON.stringify({ ...data, role: "volunteer" }));
      window.dispatchEvent(new CustomEvent("foodloop_profile_updated", { detail: { ...data, role: "volunteer" } }));
      window.dispatchEvent(new CustomEvent("annsetu_profile_updated", { detail: { ...data, role: "volunteer" } }));

      const rawList = localStorage.getItem("foodloop_volunteers_table");
      const list = rawList ? JSON.parse(rawList) : [];
      const updatedList = [data, ...list.filter((v: VolunteerRecord) => v.uid !== data.uid)];
      localStorage.setItem("foodloop_volunteers_table", JSON.stringify(updatedList));
    }
  } catch {}

  try {
    const { db } = await getFirebase();
    const { setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "volunteers", data.uid), data, { merge: true });
    await setDoc(doc(db, "users", data.uid), { ...data, role: "volunteer" }, { merge: true });
  } catch (err) {
    console.warn("Firestore volunteers table save failed, saved locally:", err);
  }
}

export async function markRead(id: string) {
  try {
    const { db } = await getFirebase();
    await updateDoc(doc(db, "notifications", id), { read: true });
  } catch {}
}

function useLive<T>(subscribe: (cb: (v: T) => void, err: (e: Error) => void) => Promise<() => void>, init: T, deps: unknown[]) {
  const [data, setData] = useState<T>(init);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let unsub = () => {};
    let alive = true;
    subscribe(
      (v) => { if (alive) { setData(v); setLoading(false); } },
      (e) => { if (alive) { setError(e.message); setLoading(false); } },
    ).then((u) => (alive ? (unsub = u) : u()));
    return () => { alive = false; unsub(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading, error };
}

export function useListings() {
  const [local, setLocal] = useState<Listing[]>(getStoredListings);
  useEffect(() => {
    const onUpd = () => setLocal(getStoredListings());
    window.addEventListener("foodloop_listing_updated", onUpd);
    window.addEventListener("annsetu_listing_updated", onUpd);
    return () => {
      window.removeEventListener("foodloop_listing_updated", onUpd);
      window.removeEventListener("annsetu_listing_updated", onUpd);
    };
  }, []);

  const remote = useLive<Listing[]>(async (cb) => {
    try {
      const { db } = await getFirebase();
      return onSnapshot(
        query(collection(db, "listings"), orderBy("createdAt", "desc")),
        (s) => {
          if (!s.empty) {
            cb(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Listing));
          } else {
            cb(getStoredListings());
          }
        },
        () => cb(getStoredListings()),
      );
    } catch {
      cb(getStoredListings());
      return () => {};
    }
  }, [], []);

  // Merge remote and local by id
  const map = new Map<string, Listing>();
  local.forEach((l) => map.set(l.id, l));
  remote.data.forEach((l) => map.set(l.id, l));
  const merged = Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return { data: merged.length ? merged : SEED_LISTINGS, loading: remote.loading && local.length === 0, error: remote.error };
}

export function useListing(id: string) {
  const [local, setLocal] = useState<Listing | null>(() => getStoredListings().find((l) => l.id === id) || null);
  useEffect(() => {
    const onUpd = () => setLocal(getStoredListings().find((l) => l.id === id) || null);
    window.addEventListener("foodloop_listing_updated", onUpd);
    window.addEventListener("annsetu_listing_updated", onUpd);
    return () => {
      window.removeEventListener("foodloop_listing_updated", onUpd);
      window.removeEventListener("annsetu_listing_updated", onUpd);
    };
  }, [id]);

  const remote = useLive<Listing | null>(async (cb, err) => {
    try {
      const { db } = await getFirebase();
      return onSnapshot(
        doc(db, "listings", id),
        (s) => {
          if (s.exists()) {
            cb({ id: s.id, ...s.data() } as Listing);
          } else {
            cb(getStoredListings().find((l) => l.id === id) || null);
          }
        },
        err,
      );
    } catch {
      cb(getStoredListings().find((l) => l.id === id) || null);
      return () => {};
    }
  }, null, [id]);

  return { data: remote.data || local, loading: remote.loading && !local, error: remote.error };
}

export function useVolunteers() {
  return useLive<Profile[]>(async (cb, err) => {
    try {
      const { db } = await getFirebase();
      return onSnapshot(query(collection(db, "users"), where("role", "==", "volunteer")), (s) => cb(s.docs.map((d) => d.data() as Profile)), err);
    } catch {
      cb([]);
      return () => {};
    }
  }, [], []);
}

export function useNotifications(uid: string | undefined) {
  return useLive<AppNotification[]>(async (cb, err) => {
    if (!uid) return () => {};
    try {
      const { db } = await getFirebase();
      return onSnapshot(
        query(collection(db, "notifications"), where("userId", "==", uid)),
        (s) => cb(s.docs.map((d) => ({ id: d.id, ...d.data() }) as AppNotification).sort((a, b) => b.createdAt - a.createdAt)),
        err,
      );
    } catch {
      cb([]);
      return () => {};
    }
  }, [], [uid]);
}

/** Resize + compress a photo to a small JPEG data URL (stored inline in Firestore). */
export function compressImage(file: File, max = 900, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
