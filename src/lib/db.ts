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
    donorId: "donor_guru_nanak_seva",
    donorName: "Guru Nanak Community Langar Kitchen",
    donorAvatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
    donorPhone: "+91 98765 43210",
    title: "Community Langar Dal Khichdi & 120 Warm Rotis",
    description: "Freshly prepared wholesome yellow dal khichdi, slow-cooked with cumin and turmeric in brass cauldrons, accompanied by 120 warm whole-wheat rotis. Cooked under strict hygiene and packed in insulated food containers for immediate shelter distribution.",
    category: "Cooked meals",
    foodType: "veg",
    quantity: 120,
    unit: "portions",
    preparedAt: Date.now() - 1.5 * 3600_000,
    pickupDeadline: Date.now() + 3.5 * 3600_000,
    locationText: "Gurdwara Seva Kitchen, Station Road, Mathura",
    pickupInstructions: "Enter through community kitchen gate 2. Contact Volunteer Harpreet.",
    storage: "hot",
    allergens: ["Gluten"],
    checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
    photo: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80",
    status: "available",
    createdAt: Date.now() - 1.5 * 3600_000,
    history: [{ status: "available", at: Date.now() - 1.5 * 3600_000, by: "Guru Nanak Community Langar Kitchen", note: "Listed freshly prepared community langar khichdi" }],
  },
  {
    id: "lst_seed_banquet",
    donorId: "donor_grand_heritage",
    donorName: "Grand Heritage Convention & Banquets",
    donorAvatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80",
    donorPhone: "+91 98223 99887",
    title: "Wedding Feast Surplus: Shahi Paneer & Jeera Rice",
    description: "Untouched, premium banquet dinner surplus safely transferred into food-grade insulated thermal dispensers at 68°C right after dinner concluded. Nutritious, rich, and dignified food for homeless shelters.",
    category: "Cooked meals",
    foodType: "veg",
    quantity: 160,
    unit: "plates",
    preparedAt: Date.now() - 1 * 3600_000,
    pickupDeadline: Date.now() + 2.5 * 3600_000,
    locationText: "Grand Heritage Convention Hall, Bypass Road, Sector 18",
    pickupInstructions: "Loading dock rear bay 3. Ask for Banquet Manager Rajiv.",
    storage: "hot",
    allergens: ["Gluten", "Dairy"],
    checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
    photo: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
    status: "available",
    createdAt: Date.now() - 1 * 3600_000,
    history: [{ status: "available", at: Date.now() - 1 * 3600_000, by: "Grand Heritage Convention & Banquets", note: "Listed untouched wedding surplus feast" }],
  },
  {
    id: "lst_seed_ration",
    donorId: "donor_hope_foundation",
    donorName: "Mother Teresa Hope Relief Mission",
    donorAvatar: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150&auto=format&fit=crop&q=80",
    donorPhone: "+91 98112 33445",
    title: "Emergency Hunger Relief Dry Ration & Grain Kits",
    description: "Fortified emergency nutrition packages assembled for vulnerable families and daily-wage earners. Each kit contains 5kg wheat flour, 2kg lentils, roasted chana, cooking oil, and glucose biscuits.",
    category: "Packaged food",
    foodType: "vegan",
    quantity: 75,
    unit: "kits",
    preparedAt: Date.now() - 2 * 3600_000,
    pickupDeadline: Date.now() + 18 * 3600_000,
    locationText: "Hope Center Depot, Slum Rehabilitation Colony",
    pickupInstructions: "Main warehouse roll-up gate, speak with Sister Grace.",
    storage: "room",
    allergens: ["Gluten"],
    checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
    photo: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80",
    status: "available",
    createdAt: Date.now() - 2 * 3600_000,
    history: [{ status: "available", at: Date.now() - 2 * 3600_000, by: "Mother Teresa Hope Relief Mission", note: "Listed emergency family ration kits" }],
  },
  {
    id: "lst_seed_2",
    donorId: "donor_daily_crust",
    donorName: "The Daily Crust Bakery & Pantry",
    donorAvatar: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150&auto=format&fit=crop&q=80",
    donorPhone: "+91 98223 34455",
    title: "Artisanal Multigrain Bread & Energy Milk Buns",
    description: "Fresh morning batch surplus donated for child shelter breakfast. High-fiber whole wheat sourdough, golden milk buns, and sandwich bread. Hygienically sealed in food bags.",
    category: "Bakery",
    foodType: "vegan",
    quantity: 65,
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
    history: [{ status: "available", at: Date.now() - 3 * 3600_000, by: "The Daily Crust Bakery & Pantry", note: "Surplus morning artisan bake for breakfast drives" }],
  },
  {
    id: "lst_seed_3",
    donorId: "donor_greenfield_mandi",
    donorName: "Kisan Wholesale Mandi Collective",
    donorAvatar: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=150&auto=format&fit=crop&q=80",
    donorPhone: "+91 97112 88990",
    title: "Fresh Seasonal Fruit Baskets & Citrus for Shelters",
    description: "Surplus crates of seasonal oranges, sweet bananas, and fresh apples donated by wholesale farmers. Excellent vitamin nourishment for children's homes and elderly shelters.",
    category: "Fruits & vegetables",
    foodType: "vegan",
    quantity: 90,
    unit: "kg",
    preparedAt: Date.now() - 4 * 3600_000,
    pickupDeadline: Date.now() + 14 * 3600_000,
    locationText: "Agricultural Produce Market Yard, Shed No. 4",
    pickupInstructions: "Shed No. 4, ask for Manager Suresh.",
    storage: "room",
    allergens: [],
    checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
    photo: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&auto=format&fit=crop&q=80",
    status: "available",
    createdAt: Date.now() - 4 * 3600_000,
    history: [{ status: "available", at: Date.now() - 4 * 3600_000, by: "Kisan Wholesale Mandi Collective", note: "Farm fresh seasonal fruit donation" }],
  },
  {
    id: "lst_seed_dairy",
    donorId: "donor_amul_dairy",
    donorName: "Dairy Co-op Milk & Curd Bank",
    donorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    donorPhone: "+91 93190 22334",
    title: "Pasteurized Milk Pouches & High-Protein Curd",
    description: "Overstocked sealed fresh milk pouches and set curd tubs maintained strictly at 3°C cold chain. Donated to prevent malnutrition among shelter toddlers and elderly residents.",
    category: "Dairy",
    foodType: "veg",
    quantity: 80,
    unit: "pouches",
    preparedAt: Date.now() - 2 * 3600_000,
    pickupDeadline: Date.now() + 5 * 3600_000,
    locationText: "Dairy Co-op Cold Storage, Highway Depot",
    pickupInstructions: "Cold Storage Bay 2, speak to In-charge Priya.",
    storage: "chilled",
    allergens: ["Dairy"],
    checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
    photo: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&auto=format&fit=crop&q=80",
    status: "available",
    createdAt: Date.now() - 2 * 3600_000,
    history: [{ status: "available", at: Date.now() - 2 * 3600_000, by: "Dairy Co-op Milk & Curd Bank", note: "Cold chain dairy surplus donation" }],
  },
];

export function getStoredListings(): Listing[] {
  try {
    if (typeof window === "undefined") return SEED_LISTINGS;
    const cacheKey = "foodloop_local_listings_v4";
    const raw = localStorage.getItem(cacheKey);
    if (!raw) {
      localStorage.setItem(cacheKey, JSON.stringify(SEED_LISTINGS));
      return SEED_LISTINGS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(cacheKey, JSON.stringify(SEED_LISTINGS));
      return SEED_LISTINGS;
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
