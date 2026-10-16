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
import type { AppNotification, Listing, Profile, Status } from "./types";

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

export async function createListing(data: Omit<Listing, "id" | "status" | "createdAt" | "history">, by: string) {
  const { db } = await getFirebase();
  const ref = await addDoc(collection(db, "listings"), {
    ...data, status: "available", createdAt: Date.now(), history: [entry("available", by, "Listed")],
  });
  return ref.id;
}

async function patch(id: string, data: Record<string, unknown>, status: Status, by: string, note?: string) {
  const { db } = await getFirebase();
  await updateDoc(doc(db, "listings", id), { ...data, status, history: arrayUnion(entry(status, by, note)) });
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
  const { db } = await getFirebase();
  await updateDoc(doc(db, "users", uid), data);
}

export async function markRead(id: string) {
  const { db } = await getFirebase();
  await updateDoc(doc(db, "notifications", id), { read: true });
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
  return useLive<Listing[]>(async (cb, err) => {
    const { db } = await getFirebase();
    return onSnapshot(query(collection(db, "listings"), orderBy("createdAt", "desc")),
      (s) => cb(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Listing)), err);
  }, [], []);
}

export function useListing(id: string) {
  return useLive<Listing | null>(async (cb, err) => {
    const { db } = await getFirebase();
    return onSnapshot(doc(db, "listings", id), (s) => cb(s.exists() ? ({ id: s.id, ...s.data() } as Listing) : null), err);
  }, null, [id]);
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
