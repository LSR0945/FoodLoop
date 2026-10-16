import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { SafetyNote } from "@/components/ListingBits";
import { useAuth } from "@/lib/auth";
import { compressImage, createListing } from "@/lib/db";
import { validateListing } from "@/lib/priority";
import { ALLERGENS, CATEGORIES, type Category, type Checklist } from "@/lib/types";

export const Route = createFileRoute("/app/donate")({
  head: () => ({
    meta: [
      { title: "Donate food — AnnSetu" },
      { name: "description", content: "Snap a photo and list your surplus food for nearby NGOs in under a minute." },
      { property: "og:title", content: "Donate food — AnnSetu" },
      { property: "og:description", content: "Snap a photo and list your surplus food for nearby NGOs in under a minute." },
    ],
  }),
  component: Donate,
});

const toLocal = (ms: number) => {
  const d = new Date(ms - new Date().getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
};

const CHECKS: { key: keyof Checklist; label: string }[] = [
  { key: "covered", label: "Food is covered and packed properly" },
  { key: "temperature", label: "Kept at a safe temperature (hot or chilled)" },
  { key: "hygienic", label: "Prepared and handled hygienically" },
  { key: "notExpired", label: "Nothing is spoiled or past its expiry date" },
];

function Donate() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const now = Date.now();
  const [photo, setPhoto] = useState<string>();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Cooked meals");
  const [foodType, setFoodType] = useState<"veg" | "non-veg" | "vegan">("veg");
  const [quantity, setQuantity] = useState(10);
  const [unit, setUnit] = useState("plates");
  const [preparedAt, setPreparedAt] = useState(toLocal(now));
  const [deadline, setDeadline] = useState(toLocal(now + 3 * 3600_000));
  const [locationText, setLocationText] = useState(profile?.area ?? "");
  const [instructions, setInstructions] = useState("");
  const [storage, setStorage] = useState<"hot" | "chilled" | "room">("hot");
  const [allergens, setAllergens] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<Checklist>({ covered: false, temperature: false, hygienic: false, notExpired: false });
  const [declared, setDeclared] = useState(false);
  const [busy, setBusy] = useState(false);

  if (profile && profile.role !== "donor") {
    return (
      <div className="rounded-2xl bg-card p-8 text-center shadow-card">
        <h1 className="text-2xl font-bold">Donations are listed by donors</h1>
        <p className="mt-2 text-muted-foreground">Your account is registered as {profile.role === "ngo" ? "an NGO" : "a volunteer"}. Browse the feed to reserve or collect food.</p>
      </div>
    );
  }

  async function onPhoto(f?: File) {
    if (!f) return;
    try { setPhoto(await compressImage(f)); } catch { toast.error("Could not read that photo"); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile) return;
    const p = new Date(preparedAt).getTime();
    const d = new Date(deadline).getTime();
    const err = validateListing({ category, quantity, preparedAt: p, pickupDeadline: d, checklist, safetyDeclared: declared });
    if (err) return toast.error(err);
    if (!photo) return toast.error("Please add a photo of the food.");
    if (!title.trim() || !locationText.trim()) return toast.error("Please add a title and pickup location.");
    setBusy(true);
    try {
      const id = await createListing({
        donorId: user.uid,
        donorName: profile.orgName || profile.name,
        ...(profile.phone ? { donorPhone: profile.phone } : {}),
        title: title.trim(), category, foodType, quantity, unit,
        preparedAt: p, pickupDeadline: d, locationText: locationText.trim(),
        pickupInstructions: instructions.trim(), storage, allergens, checklist, photo,
      }, profile.name);
      toast.success("Listed! Nearby NGOs can see it now.");
      navigate({ to: "/app/listing/$id", params: { id } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-5">
      <h1 className="text-3xl font-bold">Donate surplus food</h1>

      <label className="relative grid aspect-[4/3] cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card">
        {photo ? (
          <img src={photo} alt="Food preview" className="size-full object-cover" />
        ) : (
          <div className="text-center text-muted-foreground">
            <Camera className="mx-auto size-10" />
            <p className="mt-2 font-semibold">Take a photo of the food</p>
            <p className="text-xs">Tap to open camera</p>
          </div>
        )}
        <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
      </label>

      <Field label="What are you donating?">
        <input className="field" placeholder="e.g. Veg biryani from wedding" value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category">
          <select className="field" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Type">
          <select className="field" value={foodType} onChange={(e) => setFoodType(e.target.value as typeof foodType)}>
            <option value="veg">Veg</option><option value="non-veg">Non-veg</option><option value="vegan">Vegan</option>
          </select>
        </Field>
        <Field label="Quantity">
          <input className="field" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
        </Field>
        <Field label="Unit">
          <input className="field" value={unit} onChange={(e) => setUnit(e.target.value)} />
        </Field>
        <Field label="Prepared at">
          <input className="field" type="datetime-local" value={preparedAt} onChange={(e) => setPreparedAt(e.target.value)} />
        </Field>
        <Field label="Pickup before">
          <input className="field" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </Field>
      </div>
      <Field label="Pickup location">
        <input className="field" placeholder="Address or landmark" value={locationText} onChange={(e) => setLocationText(e.target.value)} />
      </Field>
      <Field label="Pickup instructions (optional)">
        <textarea className="field h-20 py-2" value={instructions} onChange={(e) => setInstructions(e.target.value)} />
      </Field>
      <Field label="Storage">
        <div className="flex gap-2">
          {(["hot", "chilled", "room"] as const).map((s) => (
            <button type="button" key={s} onClick={() => setStorage(s)}
              className={`flex-1 rounded-full py-2 text-sm font-semibold capitalize ${storage === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {s === "room" ? "Room temp" : s}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Contains allergens">
        <div className="flex flex-wrap gap-2">
          {ALLERGENS.map((a) => (
            <button type="button" key={a} onClick={() => setAllergens((v) => (v.includes(a) ? v.filter((x) => x !== a) : [...v, a]))}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${allergens.includes(a) ? "bg-saffron text-saffron-foreground" : "bg-muted text-muted-foreground"}`}>
              {a}
            </button>
          ))}
        </div>
      </Field>

      <div className="space-y-2 rounded-2xl bg-card p-4 shadow-card">
        <p className="font-semibold">Food handling checklist</p>
        {CHECKS.map((c) => (
          <label key={c.key} className="flex items-center gap-3 text-sm">
            <input type="checkbox" className="size-4 accent-primary" checked={checklist[c.key]}
              onChange={(e) => setChecklist((v) => ({ ...v, [c.key]: e.target.checked }))} />
            {c.label}
          </label>
        ))}
        <label className="flex items-start gap-3 border-t border-border pt-3 text-sm">
          <input type="checkbox" className="mt-0.5 size-4 accent-primary" checked={declared} onChange={(e) => setDeclared(e.target.checked)} />
          I declare this food is fit for consumption to the best of my knowledge.
        </label>
      </div>
      <SafetyNote compact />
      <button disabled={busy} className="w-full rounded-full bg-saffron py-3 font-semibold text-saffron-foreground shadow-warm disabled:opacity-60">
        {busy ? "Publishing…" : "Publish donation"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold">{label}</label>
      {children}
    </div>
  );
}
