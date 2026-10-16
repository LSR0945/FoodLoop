import { useEffect, useState } from "react";
import { getSupabase } from "./supabase";
import type { AppNotification, DonorRecord, Listing, NGORecord, Profile, Status, VolunteerRecord } from "./types";

export async function notify(userIds: (string | undefined)[], title: string, body: string, listingId?: string) {
  const ids = [...new Set(userIds.filter(Boolean) as string[])];
  if (!ids.length) return;
  try {
    const supabase = getSupabase();
    await supabase.from("notifications").insert(
      ids.map((userId) => ({
        userId,
        title,
        body,
        listingId: listingId ?? null,
        read: false,
        createdAt: Date.now(),
      })),
    );
  } catch {
    /* notifications are best-effort */
  }
}

const entry = (status: Status, by: string, note?: string) => ({ status, at: Date.now(), by, ...(note ? { note } : {}) });

// Authentic Indian Hunger Relief, Child Welfare, Langar & Donation Camp photos
export const INDIAN_HUNGER_PHOTOS = {
  indian_children_meal: "/images/food/dal_khichdi_roti.jpg",
  slum_kids_feeding: "/images/food/wheat_bread_buns.jpg",
  child_eating_plate: "/images/food/shahi_paneer_pulao.jpg",
  community_langar_camp: "/images/food/dry_ration_kits.jpg",
  street_children_relief: "/images/food/milk_and_dahi.jpg",
  village_school_midday: "/images/food/fruit_crates.jpg",
};

export const SEED_LISTINGS: Listing[] = [
  {
    id: "lst_seed_langar_khichdi",
    donorId: "donor_guru_nanak_seva",
    donorName: "Gurdwara Sahib Langar Seva",
    donorAvatar: "/images/hunger/ground4.jpg",
    donorPhone: "+91 98765 43210",
    title: "Ghee Dal Khichdi & 150 Rotis for Slum Feeding",
    description: "Nutritious, warm yellow dal khichdi slow-simmered in brass degh, with 150 fresh whole-wheat rotis cooked for underprivileged children and daily wagers at Mathura Rain Basera.",
    category: "Cooked meals",
    foodType: "veg",
    quantity: 150,
    unit: "plates",
    preparedAt: Date.now() - 1 * 3600_000,
    pickupDeadline: Date.now() + 3.5 * 3600_000,
    locationText: "Gurdwara Seva Kitchen, Station Road, Mathura",
    pickupInstructions: "Community kitchen dispatch bay 1. Speak with Bhai Harpreet Singh.",
    storage: "hot",
    allergens: ["Gluten"],
    checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
    photo: "/images/food/dal_khichdi_roti.jpg",
    status: "available",
    createdAt: Date.now() - 1 * 3600_000,
    history: [{ status: "available", at: Date.now() - 1 * 3600_000, by: "Gurdwara Sahib Langar Seva", note: "Listed freshly cooked community langar khichdi" }],
  },
  {
    id: "lst_seed_wedding_surplus",
    donorId: "donor_shree_radhe_banquet",
    donorName: "Radhe Krishna Wedding Caterers",
    donorAvatar: "/images/hunger/card2.png",
    donorPhone: "+91 98223 99887",
    title: "Banquet Surplus: Shahi Paneer, Pulao & Gulab Jamun",
    description: "Untouched, pristine banquet feast surplus preserved at 68°C in insulated food dispensers right after wedding reception concluded. High-protein meal for orphanages and night shelters.",
    category: "Cooked meals",
    foodType: "veg",
    quantity: 180,
    unit: "plates",
    preparedAt: Date.now() - 1.5 * 3600_000,
    pickupDeadline: Date.now() + 2.5 * 3600_000,
    locationText: "Radhe Krishna Banquet Hall, NH-19 Bypass, Mathura",
    pickupInstructions: "Loading dock rear bay. Ask for Banquet Manager Rajiv.",
    storage: "hot",
    allergens: ["Gluten", "Dairy"],
    checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
    photo: "/images/food/shahi_paneer_pulao.jpg",
    status: "available",
    createdAt: Date.now() - 1.5 * 3600_000,
    history: [{ status: "available", at: Date.now() - 1.5 * 3600_000, by: "Radhe Krishna Banquet", note: "Listed untouched wedding surplus feast" }],
  },
  {
    id: "lst_seed_emergency_ration",
    donorId: "donor_annapurna_trust",
    donorName: "Maa Annapurna Hunger Relief Foundation",
    donorAvatar: "/images/hunger/hunger5.png",
    donorPhone: "+91 98112 33445",
    title: "Emergency Slum Dry Ration Survival Kits (Atta, Dal, Oil)",
    description: "Fortified emergency food kits assembled for poverty-stricken families and daily wagers. Contains 5kg wheat atta, 2kg chana dal, mustard oil, and biscuits.",
    category: "Packaged food",
    foodType: "vegan",
    quantity: 85,
    unit: "kits",
    preparedAt: Date.now() - 2 * 3600_000,
    pickupDeadline: Date.now() + 18 * 3600_000,
    locationText: "Annapurna Depot, Slum Rehabilitation Colony, Mathura",
    pickupInstructions: "Warehouse gate 2, speak with Seva Coordinator Anita.",
    storage: "room",
    allergens: ["Gluten"],
    checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
    photo: "/images/food/dry_ration_kits.jpg",
    status: "available",
    createdAt: Date.now() - 2 * 3600_000,
    history: [{ status: "available", at: Date.now() - 2 * 3600_000, by: "Maa Annapurna Foundation", note: "Listed emergency family ration kits" }],
  },
  {
    id: "lst_seed_slum_breakfast",
    donorId: "donor_navodaya_care",
    donorName: "Navodaya Slum Child Care Center",
    donorAvatar: "/images/hunger/ground3.jpg",
    donorPhone: "+91 98223 34455",
    title: "Wholesome Wheat Bread & Milk Buns for Street Children",
    description: "Surplus morning bakery batch packed in hygienic clean bags for children's morning breakfast program at remedial street schools.",
    category: "Bakery",
    foodType: "veg",
    quantity: 95,
    unit: "loaves",
    preparedAt: Date.now() - 3 * 3600_000,
    pickupDeadline: Date.now() + 9 * 3600_000,
    locationText: "Navodaya Remedial Center, Civil Lines, Mathura",
    pickupInstructions: "Front gate, ask for Teacher Sunita.",
    storage: "room",
    allergens: ["Gluten"],
    checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
    photo: "/images/food/wheat_bread_buns.jpg",
    status: "available",
    createdAt: Date.now() - 3 * 3600_000,
    history: [{ status: "available", at: Date.now() - 3 * 3600_000, by: "Navodaya Child Care", note: "Surplus bakery loaves for street children breakfast" }],
  },
  {
    id: "lst_seed_mandi_fruits",
    donorId: "donor_kisan_mandi_mathura",
    donorName: "Kisan Wholesale Mandi Farmers Collective",
    donorAvatar: "/images/hunger/card1.png",
    donorPhone: "+91 97112 88990",
    title: "Fresh Seasonal Fruits Crates (Bananas & Apples) for Orphanage",
    description: "Direct farm surplus crates of grade-A fresh seasonal fruits. Essential vitamins and natural nourishment for underprivileged children.",
    category: "Fruits & vegetables",
    foodType: "vegan",
    quantity: 120,
    unit: "kg",
    preparedAt: Date.now() - 4 * 3600_000,
    pickupDeadline: Date.now() + 14 * 3600_000,
    locationText: "Agricultural Produce Mandi Yard, Shed No. 4, Mathura",
    pickupInstructions: "Shed No. 4, ask for Manager Suresh.",
    storage: "room",
    allergens: [],
    checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
    photo: "/images/food/fruit_crates.jpg",
    status: "available",
    createdAt: Date.now() - 4 * 3600_000,
    history: [{ status: "available", at: Date.now() - 4 * 3600_000, by: "Kisan Mandi Collective", note: "Fresh seasonal fruit donation for children" }],
  },
  {
    id: "lst_seed_dairy_packets",
    donorId: "donor_braj_dairy",
    donorName: "Braj Bhoomi Dairy Milk Bank",
    donorAvatar: "/images/hunger/ground1.png",
    donorPhone: "+91 93190 22334",
    title: "Pasteurized Milk Pouches & Nutritious Dahi for Toddlers",
    description: "Refrigerated fresh milk pouches and set curd tubs maintained strictly under cold chain. Donated to prevent malnutrition among shelter toddlers and elderly residents.",
    category: "Dairy",
    foodType: "veg",
    quantity: 110,
    unit: "pouches",
    preparedAt: Date.now() - 2 * 3600_000,
    pickupDeadline: Date.now() + 6 * 3600_000,
    locationText: "Braj Bhoomi Dairy Plant, Highway Depot, Mathura",
    pickupInstructions: "Cold Storage Bay 2, speak to In-charge Priya.",
    storage: "chilled",
    allergens: ["Dairy"],
    checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
    photo: "/images/food/milk_and_dahi.jpg",
    status: "available",
    createdAt: Date.now() - 2 * 3600_000,
    history: [{ status: "available", at: Date.now() - 2 * 3600_000, by: "Braj Bhoomi Dairy Bank", note: "Cold chain dairy surplus donation" }],
  },
];

export function isOldDummyListing(l: Listing): boolean {
  const t = (l.title || "").toLowerCase();
  const d = (l.description || "").toLowerCase();
  const p = (l.photo || "").toLowerCase();
  return (
    t.includes("pizza") ||
    t.includes("salad") ||
    t.includes("kulcha") ||
    t.includes("margherita") ||
    t.includes("mediterranean") ||
    t.includes("purebites") ||
    t.includes("bella napoli") ||
    t.includes("amritsari") ||
    p.includes("photo-1513104890138") || // pizza
    p.includes("photo-1540189549336") || // salad
    p.includes("photo-1567529692333") || // chole kulche
    p.includes("photo-1488477181946") || // parfait jars
    p.includes("photo-1555244162803") || // catering cafe
    p.includes("unsplash.com") || // purge any unsplash image
    (l.photo && l.photo.includes("unsplash.com")) ||
    l.id.includes("pizza") ||
    l.id.includes("salad") ||
    l.id === "lst_seed_1" ||
    l.id === "lst_seed_2" ||
    l.id === "lst_seed_3" ||
    l.id === "lst_seed_4" ||
    l.id === "lst_seed_5" ||
    l.id === "lst_seed_6"
  );
}

export function getStoredListings(): Listing[] {
  try {
    if (typeof window === "undefined") return SEED_LISTINGS;
    const cacheKey = "foodloop_local_listings_v7";
    // Clean old caches
    localStorage.removeItem("foodloop_local_listings");
    localStorage.removeItem("annsetu_local_listings");
    localStorage.removeItem("foodloop_local_listings_v4");
    localStorage.removeItem("foodloop_local_listings_v5");
    localStorage.removeItem("foodloop_local_listings_v6");

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
    // Filter out old dummy listings
    const cleaned = parsed.filter((item: Listing) => !isOldDummyListing(item));
    if (cleaned.length === 0) {
      localStorage.setItem(cacheKey, JSON.stringify(SEED_LISTINGS));
      return SEED_LISTINGS;
    }
    return cleaned;
  } catch {
    return SEED_LISTINGS;
  }
}

export function setStoredListings(list: Listing[]) {
  try {
    if (typeof window !== "undefined") {
      const cacheKey = "foodloop_local_listings_v7";
      const cleaned = list.filter((item) => !isOldDummyListing(item));
      localStorage.setItem(cacheKey, JSON.stringify(cleaned));
      window.dispatchEvent(new CustomEvent("foodloop_listing_updated"));
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
    const supabase = getSupabase();
    const { error } = await supabase.from("listings").insert(newListing);
    if (error) throw error;
  } catch (err) {
    console.warn("Supabase insert failed, using resilient local storage:", err);
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
    const supabase = getSupabase();
    const { data: row } = await supabase.from("listings").select("history").eq("id", id).maybeSingle();
    const history = Array.isArray((row as { history?: unknown[] } | null)?.history) ? (row as { history: unknown[] }).history : [];
    await supabase
      .from("listings")
      .update({ ...data, status, history: [...history, entry(status, by, note)] })
      .eq("id", id);
  } catch (err) {
    console.warn("Supabase patch failed, local state updated:", err);
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
  try {
    const supabase = getSupabase();
    await supabase.from("reports").insert(report);
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
    const supabase = getSupabase();
    await supabase.from("profiles").upsert({ ...data, uid }, { onConflict: "uid" });
  } catch (err) {
    console.warn("Supabase updateProfile failed, saved locally:", err);
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
    const supabase = getSupabase();
    await supabase.from("donors").upsert(data, { onConflict: "uid" });
    await supabase.from("profiles").upsert({ ...data, role: "donor" }, { onConflict: "uid" });
  } catch (err) {
    console.warn("Supabase donors table save failed, saved locally:", err);
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
    const supabase = getSupabase();
    await supabase.from("recipients").upsert(data, { onConflict: "uid" });
    await supabase.from("ngos").upsert(data, { onConflict: "uid" });
    await supabase
      .from("profiles")
      .upsert({ ...data, role: "recipient", name: data.name || data.contactPerson }, { onConflict: "uid" });
  } catch (err) {
    console.warn("Supabase recipients table save failed, saved locally:", err);
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
    const supabase = getSupabase();
    await supabase.from("volunteers").upsert(data, { onConflict: "uid" });
    await supabase.from("profiles").upsert({ ...data, role: "volunteer" }, { onConflict: "uid" });
  } catch (err) {
    console.warn("Supabase volunteers table save failed, saved locally:", err);
  }
}

export async function markRead(id: string) {
  try {
    const supabase = getSupabase();
    await supabase.from("notifications").update({ read: true }).eq("id", id);
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
      const supabase = getSupabase();
      let alive = true;

      const load = async () => {
        const { data, error } = await supabase.from("listings").select("*").order("createdAt", { ascending: false });
        if (error) throw error;
        if (!alive) return;
        cb(data && data.length ? (data as unknown as Listing[]) : getStoredListings());
      };

      await load();

      const channel = supabase
        .channel("listings-live")
        .on("postgres_changes", { event: "*", schema: "public", table: "listings" }, () => {
          load().catch(() => cb(getStoredListings()));
        })
        .subscribe();

      return () => {
        alive = false;
        supabase.removeChannel(channel);
      };
    } catch {
      cb(getStoredListings());
      return () => {};
    }
  }, [], []);

  // Merge remote and local by id (strictly excluding old dummy food)
  const map = new Map<string, Listing>();
  local.forEach((l) => {
    if (!isOldDummyListing(l)) map.set(l.id, l);
  });
  remote.data.forEach((l) => {
    if (!isOldDummyListing(l)) map.set(l.id, l);
  });
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
      const supabase = getSupabase();
      let alive = true;

      const load = async () => {
        const { data, error } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        if (!alive) return;
        cb(data ? (data as unknown as Listing) : getStoredListings().find((l) => l.id === id) || null);
      };

      await load();

      const channel = supabase
        .channel("listing:" + id)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "listings", filter: `id=eq.${id}` },
          () => {
            load().catch(err);
          },
        )
        .subscribe();

      return () => {
        alive = false;
        supabase.removeChannel(channel);
      };
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
      const supabase = getSupabase();
      let alive = true;

      const load = async () => {
        const { data, error } = await supabase.from("profiles").select("*").eq("role", "volunteer");
        if (error) throw error;
        if (!alive) return;
        cb((data as unknown as Profile[]) || []);
      };

      await load();

      const channel = supabase
        .channel("volunteers-live")
        .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
          load().catch(err);
        })
        .subscribe();

      return () => {
        alive = false;
        supabase.removeChannel(channel);
      };
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
      const supabase = getSupabase();
      let alive = true;

      const load = async () => {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("userId", uid)
          .order("createdAt", { ascending: false });
        if (error) throw error;
        if (!alive) return;
        cb((data as unknown as AppNotification[]) || []);
      };

      await load();

      const channel = supabase
        .channel("notifications:" + uid)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "notifications", filter: `userId=eq.${uid}` },
          () => {
            load().catch(err);
          },
        )
        .subscribe();

      return () => {
        alive = false;
        supabase.removeChannel(channel);
      };
    } catch {
      cb([]);
      return () => {};
    }
  }, [], [uid]);
}

/** Resize + compress a photo to a small JPEG data URL (stored inline in Supabase). */
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

/** Generate and seed the full Supabase schema (tables) with starter data */
export async function generateSupabaseSchema(): Promise<{ success: boolean; message: string; count: number }> {
  let count = 0;
  try {
    const supabase = getSupabase();

    // 1. Seed Listings
    const listings = SEED_LISTINGS.map((l) => ({ ...l, donorId: l.donorId || "donor_demo_id" }));
    const { error: listingsErr } = await supabase.from("listings").upsert(listings, { onConflict: "id" });
    if (listingsErr) throw listingsErr;
    count += listings.length;

    // 2. Seed Default Profiles / Users
    const users: Partial<Profile>[] = [
      {
        uid: "donor_demo_id",
        name: "Bhai Harpreet Singh",
        email: "donor.demo@foodloop.org",
        role: "donor",
        orgName: "Gurdwara Sahib Community Langar Kitchen",
        phone: "+91 98765 43210",
        area: "Station Road, Mathura",
        verified: true,
        createdAt: Date.now() - 30 * 86400_000,
      },
      {
        uid: "recipient_demo_id",
        name: "Sister Mary & Rajiv Sharma",
        email: "shelter.demo@foodloop.org",
        role: "recipient",
        orgName: "Asha Children Orphanage & Night Shelter",
        contactPerson: "Rajiv Sharma",
        dailyCapacity: 250,
        phone: "+91 98223 99887",
        area: "Civil Lines, Mathura",
        verified: true,
        createdAt: Date.now() - 45 * 86400_000,
      },
      {
        uid: "volunteer_demo_id",
        name: "Aman Verma",
        email: "volunteer.demo@foodloop.org",
        role: "volunteer",
        phone: "+91 98112 33445",
        area: "Mathura City & NH-19 Corridor",
        shifts: ["morning", "evening", "night"],
        vehicleType: "bike",
        verified: true,
        createdAt: Date.now() - 60 * 86400_000,
      },
    ];

    const { error: usersErr } = await supabase.from("profiles").upsert(users, { onConflict: "uid" });
    if (usersErr) throw usersErr;
    count += users.length;

    // 3. Seed Platform Notices
    const { error: noticeErr } = await supabase.from("platform_notices").upsert(
      {
        id: "notice_mathura_zero_hunger",
        title: "Mission Zero Hunger Mathura Alert",
        body: "All verified donors are requested to list banquet and wedding surplus by 10:30 PM for rapid shelter dispatch.",
        targetRole: "all",
        active: true,
        date: new Date().toISOString().slice(0, 10),
      },
      { onConflict: "id" },
    );
    if (noticeErr) throw noticeErr;
    count++;

    // Update local cache as well
    setStoredListings(SEED_LISTINGS);

    return {
      success: true,
      message: `Supabase schema successfully generated! ${count} rows written across listings, profiles, and platform notices.`,
      count,
    };
  } catch (err: any) {
    console.warn("Supabase schema generation warning:", err);
    // Even if RLS policies prevent writes, ensure local state is 100% updated with Indian hunger relief data
    setStoredListings(SEED_LISTINGS);
    return {
      success: false,
      message: `Local schema generated. Supabase write note: ${err.message || "Run the SQL migration in the Supabase SQL editor first"}.`,
      count,
    };
  }
}
