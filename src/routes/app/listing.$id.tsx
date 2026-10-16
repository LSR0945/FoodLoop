import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Clock, MapPin, Phone, Thermometer } from "lucide-react";
import { toast } from "sonner";
import { SafetyNote, StatusBadge, UrgencyBadge } from "@/components/ListingBits";
import { useAuth } from "@/lib/auth";
import {
  assignVolunteer, cancelListing, completeListing, markPickedUp, reserveListing, useListing, useVolunteers,
} from "@/lib/db";
import { isOpen } from "@/lib/priority";
import { STATUS_LABEL } from "@/lib/types";

export const Route = createFileRoute("/app/listing/$id")({
  head: () => ({
    meta: [
      { title: "Donation details — AnnSetu" },
      { name: "description", content: "Pickup details, safety information and status for a food donation." },
      { property: "og:title", content: "Donation details — AnnSetu" },
      { property: "og:description", content: "Pickup details, safety information and status for a food donation." },
    ],
  }),
  component: ListingPage,
});

const fmt = (ms: number) => new Date(ms).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

function ListingPage() {
  const { id } = Route.useParams();
  const { user, profile } = useAuth();
  const { data: l, loading } = useListing(id);
  const { data: volunteers } = useVolunteers();
  const [code, setCode] = useState("");
  const [qty, setQty] = useState(0);
  const [note, setNote] = useState("");
  const [vol, setVol] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return <div className="aspect-video animate-pulse rounded-2xl bg-muted" />;
  if (!l) return <p className="text-center text-muted-foreground">This donation no longer exists.</p>;

  const me = profile?.name ?? "Someone";
  const isDonor = user?.uid === l.donorId;
  const isNgo = profile?.role === "ngo" && user?.uid === l.reservedBy;
  const isVol = user?.uid === l.volunteerId;
  const canSeeCode = isDonor || isNgo;

  async function run(fn: () => Promise<void>, ok: string) {
    setBusy(true);
    try { await fn(); toast.success(ok); } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link to="/app" className="inline-flex items-center gap-1 text-sm font-semibold text-primary"><ArrowLeft className="size-4" />Back to feed</Link>
      {l.photo && <img src={l.photo} alt={l.title} className="aspect-[4/3] w-full rounded-2xl object-cover shadow-card" />}
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={l.status} />
        {l.status === "available" && <UrgencyBadge deadline={l.pickupDeadline} />}
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold">{l.category}</span>
      </div>
      <div>
        <h1 className="text-3xl font-bold">{l.title}</h1>
        <p className="mt-1 text-lg font-semibold text-primary">{l.quantity} {l.unit} · {l.foodType}</p>
        <p className="text-sm text-muted-foreground">Donated by {l.donorName}</p>
      </div>

      <div className="grid gap-3 rounded-2xl bg-card p-4 text-sm shadow-card sm:grid-cols-2">
        <p className="flex gap-2"><MapPin className="size-4 shrink-0 text-primary" />{l.locationText}</p>
        <p className="flex gap-2"><Clock className="size-4 shrink-0 text-primary" />Pickup by {fmt(l.pickupDeadline)}</p>
        <p className="flex gap-2"><Thermometer className="size-4 shrink-0 text-primary" />Storage: {l.storage} · prepared {fmt(l.preparedAt)}</p>
        {l.donorPhone && (l.reservedBy === user?.uid || isVol) && (
          <a href={`tel:${l.donorPhone}`} className="flex gap-2 font-semibold text-primary"><Phone className="size-4" />{l.donorPhone}</a>
        )}
        {l.pickupInstructions && <p className="sm:col-span-2"><b>Instructions:</b> {l.pickupInstructions}</p>}
        <p className="sm:col-span-2"><b>Allergens:</b> {l.allergens.length ? l.allergens.join(", ") : "None declared"}</p>
      </div>

      {canSeeCode && l.pickupCode && ["reserved", "assigned"].includes(l.status) && (
        <div className="rounded-2xl bg-saffron/15 p-4 text-center">
          <p className="text-sm font-semibold">Pickup code</p>
          <p className="font-display text-4xl font-bold tracking-[0.3em]">{l.pickupCode}</p>
          <p className="text-xs text-muted-foreground">{isDonor ? "Ask the collector for this code before handing over." : "Share this code with the donor at pickup."}</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {profile?.role === "ngo" && isOpen(l) && (
          <button disabled={busy} onClick={() => run(() => reserveListing(l, profile), "Reserved! Donor has been notified.")}
            className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60">Reserve this food</button>
        )}
        {isNgo && l.status === "reserved" && (
          <div className="flex gap-2">
            <select className="field" value={vol} onChange={(e) => setVol(e.target.value)}>
              <option value="">Assign a volunteer…</option>
              {volunteers.map((v) => <option key={v.uid} value={v.uid}>{v.name}{v.area ? ` · ${v.area}` : ""}</option>)}
            </select>
            <button disabled={busy || !vol} onClick={() => {
              const v = volunteers.find((x) => x.uid === vol)!;
              run(() => assignVolunteer(l, { uid: v.uid, name: v.name }, me), "Volunteer assigned");
            }} className="shrink-0 rounded-full bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-60">Assign</button>
          </div>
        )}
        {(isVol || isNgo) && ["reserved", "assigned"].includes(l.status) && (
          <div className="flex gap-2">
            <input className="field" inputMode="numeric" maxLength={4} placeholder="Enter donor's pickup code" value={code} onChange={(e) => setCode(e.target.value)} />
            <button disabled={busy} onClick={() => {
              if (code !== l.pickupCode) return toast.error("Code doesn't match");
              run(() => markPickedUp(l, me), "Pickup confirmed");
            }} className="shrink-0 rounded-full bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-60">Picked up</button>
          </div>
        )}
        {(isNgo || isVol) && l.status === "picked_up" && (
          <div className="space-y-2 rounded-2xl bg-card p-4 shadow-card">
            <p className="font-semibold">Confirm distribution</p>
            <input className="field" type="number" min={1} max={l.quantity} placeholder={`How many ${l.unit} distributed?`} value={qty || ""} onChange={(e) => setQty(Number(e.target.value))} />
            <input className="field" placeholder="Note (e.g. served at shelter)" value={note} onChange={(e) => setNote(e.target.value)} />
            <button disabled={busy || qty < 1} onClick={() => run(() => completeListing(l, qty, note, me), "Marked complete — thank you!")}
              className="w-full rounded-full bg-success py-2.5 font-semibold text-primary-foreground disabled:opacity-60">Mark completed</button>
          </div>
        )}
        {isDonor && ["available", "reserved", "assigned"].includes(l.status) && (
          <button disabled={busy} onClick={() => confirm("Withdraw this donation?") && run(() => cancelListing(l, me), "Donation withdrawn")}
            className="w-full rounded-full border border-destructive py-2.5 font-semibold text-destructive">Withdraw donation</button>
        )}
      </div>

      {l.status === "completed" && (
        <p className="rounded-2xl bg-success/15 p-4 text-center font-semibold text-success">
          🎉 {l.quantityDistributed} {l.unit} reached people in need. {l.completionNote}
        </p>
      )}

      <SafetyNote />

      <section>
        <h2 className="mb-3 text-xl font-bold">Timeline</h2>
        <ol className="space-y-3 border-l-2 border-border pl-4">
          {[...l.history].reverse().map((h, i) => (
            <li key={i}>
              <p className="font-semibold">{STATUS_LABEL[h.status]}</p>
              <p className="text-xs text-muted-foreground">{fmt(h.at)} · {h.by}{h.note ? ` — ${h.note}` : ""}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
