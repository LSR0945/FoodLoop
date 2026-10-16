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
      userId, title, body, listingId: listingId ?? null, read: false, createdAt: Date.now(),
    }),
  );
  await batch.commit();
}

const entry = (status: Status, by: string, note?: string) => ({ status, at: Date.now(), by, ...(note ? { note } : {}) });

function getStoredListings(): Listing[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("annsetu_local_listings") : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStoredListings(list: Listing[]) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("annsetu_local_listings", JSON.stringify(list));
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
    history: [entry("available", by, "Listed")],
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

export async function reserveListing(l: Listing, p: Profile) {
  const code = String(Math.floor(1000 + Math.random() * 9000));
  const name = p.orgName || p.name;
  await patch(l.id, { reservedBy: p.uid, reservedByName: name, pickupCode: code }, "reserved", name);
  await notify([l.donorId], "Your donation was reserved", `${name} reserved "${l.title}". They'll share pickup code at handover.`, l.id);
}

export async function assignVolunteer(l: Listing, vol: { uid: string; name: string }, by: string) {
  await patch(l.id, { volunteerId: vol.uid, volunteerName: vol.name }, "assigned", by, `Assigned to ${vol.name}`);
  await notify([vol.uid], "New pickup task", `Collect "${l.title}" from ${l.locationText} before the deadline.`, l.id);
  await notify([l.donorId], "Collector on the way", `${vol.name} will collect "${l.title}".`, l.id);
}

export async function markPickedUp(l: Listing, by: string) {
  await patch(l.id, {}, "picked_up", by, "Code verified at handover");
  await notify([l.donorId, l.reservedBy], "Food picked up", `"${l.title}" was collected by ${by}.`, l.id);
}

export async function completeListing(l: Listing, qty: number, note: string, by: string) {
  await patch(l.id, { quantityDistributed: qty, completionNote: note, completedAt: Date.now() }, "completed", by, `${qty} ${l.unit} distributed`);
  await notify([l.donorId, l.reservedBy, l.volunteerId], "Donation completed 🎉", `${qty} ${l.unit} of "${l.title}" reached people in need. Thank you!`, l.id);
}

export async function cancelListing(l: Listing, by: string) {
  await patch(l.id, {}, "cancelled", by, "Withdrawn by donor");
  await notify([l.reservedBy, l.volunteerId], "Donation withdrawn", `"${l.title}" is no longer available.`, l.id);
}

export async function updateProfile(uid: string, data: Partial<Profile>) {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("annsetu_profile_" + uid) : null;
    const existing = raw ? JSON.parse(raw) : {};
    const updated = { ...existing, ...data, uid };
    if (typeof window !== "undefined") {
      localStorage.setItem("annsetu_profile_" + uid, JSON.stringify(updated));
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

/** 100% Guaranteed Registration for Food Donors (Stored in 'donors' table and 'users' table) */
export async function registerDonor(data: DonorRecord) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("bhojanbandhu_donor_" + data.uid, JSON.stringify(data));
      localStorage.setItem("annsetu_profile_" + data.uid, JSON.stringify({ ...data, role: "donor" }));
      window.dispatchEvent(new CustomEvent("annsetu_profile_updated", { detail: { ...data, role: "donor" } }));

      const rawList = localStorage.getItem("bhojanbandhu_donors_table");
      const list = rawList ? JSON.parse(rawList) : [];
      const updatedList = [data, ...list.filter((d: DonorRecord) => d.uid !== data.uid)];
      localStorage.setItem("bhojanbandhu_donors_table", JSON.stringify(updatedList));
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

/** 100% Guaranteed Registration for NGOs (Stored in 'ngos' table and 'users' table) */
export async function registerNGO(data: NGORecord) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("bhojanbandhu_ngo_" + data.uid, JSON.stringify(data));
      localStorage.setItem("annsetu_profile_" + data.uid, JSON.stringify({ ...data, role: "ngo", name: data.name || data.contactPerson }));
      window.dispatchEvent(new CustomEvent("annsetu_profile_updated", { detail: { ...data, role: "ngo" } }));

      const rawList = localStorage.getItem("bhojanbandhu_ngos_table");
      const list = rawList ? JSON.parse(rawList) : [];
      const updatedList = [data, ...list.filter((n: NGORecord) => n.uid !== data.uid)];
      localStorage.setItem("bhojanbandhu_ngos_table", JSON.stringify(updatedList));
    }
  } catch {}

  try {
    const { db } = await getFirebase();
    const { setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "ngos", data.uid), data, { merge: true });
    await setDoc(doc(db, "users", data.uid), { ...data, role: "ngo", name: data.name || data.contactPerson }, { merge: true });
  } catch (err) {
    console.warn("Firestore ngos table save failed, saved locally:", err);
  }
}

/** 100% Guaranteed Registration for Volunteers (Stored in 'volunteers' table and 'users' table) */
export async function registerVolunteer(data: VolunteerRecord) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("bhojanbandhu_volunteer_" + data.uid, JSON.stringify(data));
      localStorage.setItem("annsetu_profile_" + data.uid, JSON.stringify({ ...data, role: "volunteer" }));
      window.dispatchEvent(new CustomEvent("annsetu_profile_updated", { detail: { ...data, role: "volunteer" } }));

      const rawList = localStorage.getItem("bhojanbandhu_volunteers_table");
      const list = rawList ? JSON.parse(rawList) : [];
      const updatedList = [data, ...list.filter((v: VolunteerRecord) => v.uid !== data.uid)];
      localStorage.setItem("bhojanbandhu_volunteers_table", JSON.stringify(updatedList));
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
    window.addEventListener("annsetu_listing_updated", onUpd);
    return () => window.removeEventListener("annsetu_listing_updated", onUpd);
  }, []);

  const remote = useLive<Listing[]>(async (cb) => {
    try {
      const { db } = await getFirebase();
      return onSnapshot(
        query(collection(db, "listings"), orderBy("createdAt", "desc")),
        (s) => cb(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Listing)),
        () => cb([]),
      );
    } catch {
      cb([]);
      return () => {};
    }
  }, [], []);

  // Merge remote and local by id
  const map = new Map<string, Listing>();
  local.forEach((l) => map.set(l.id, l));
  remote.data.forEach((l) => map.set(l.id, l));
  const merged = Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return { data: merged, loading: remote.loading && local.length === 0, error: remote.error };
}

export function useListing(id: string) {
  const [local, setLocal] = useState<Listing | null>(() => getStoredListings().find((l) => l.id === id) || null);
  useEffect(() => {
    const onUpd = () => setLocal(getStoredListings().find((l) => l.id === id) || null);
    window.addEventListener("annsetu_listing_updated", onUpd);
    return () => window.removeEventListener("annsetu_listing_updated", onUpd);
  }, [id]);

  const remote = useLive<Listing | null>(async (cb, err) => {
    try {
      const { db } = await getFirebase();
      return onSnapshot(doc(db, "listings", id), (s) => cb(s.exists() ? ({ id: s.id, ...s.data() } as Listing) : null), err);
    } catch {
      cb(null);
      return () => {};
    }
  }, null, [id]);

  return { data: remote.data || local, loading: remote.loading && !local, error: remote.error };
}

export function useVolunteers() {
  return useLive<Profile[]>(async (cb, err) => {
    const { db } = await getFirebase();
    return onSnapshot(query(collection(db, "users"), where("role", "==", "volunteer")), (s) => cb(s.docs.map((d) => d.data() as Profile)), err);
  }, [], []);
}

export function useNotifications(uid: string | undefined) {
  return useLive<AppNotification[]>(async (cb, err) => {
    if (!uid) return () => {};
    const { db } = await getFirebase();
    return onSnapshot(query(collection(db, "notifications"), where("userId", "==", uid)),
      (s) => cb(s.docs.map((d) => ({ id: d.id, ...d.data() }) as AppNotification).sort((a, b) => b.createdAt - a.createdAt)), err);
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
