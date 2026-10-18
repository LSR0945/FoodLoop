import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Check, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { compressImage, updateProfile } from "@/lib/db";
import type { Shift } from "@/lib/types";

export const Route = createFileRoute("/onboarding/profile")({
  head: () => ({
    meta: [
      { title: "Complete Your Profile — FoodLoop" },
      { name: "description", content: "Complete your role-specific profile details on FoodLoop." },
    ],
  }),
  component: OnboardingProfilePage,
});

function OnboardingProfilePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const role = profile?.role || "donor";

  // Shared Fields
  const [displayName, setDisplayName] = useState(profile?.name || user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [cityArea, setCityArea] = useState(profile?.area || "");
  const [phone, setPhone] = useState(profile?.phone || "");

  // Donor-Specific Fields
  const [donorType, setDonorType] = useState<any>(profile?.donorType || "restaurant");
  const [orgName, setOrgName] = useState(profile?.orgName || "");
  const [defaultPickupAddress, setDefaultPickupAddress] = useState(profile?.defaultPickupAddress || "");
  const [fssaiNumber, setFssaiNumber] = useState(profile?.fssaiNumber || "");

  // Recipient-Specific Fields
  const [registrationNumber, setRegistrationNumber] = useState(profile?.registrationNumber || "");
  const [operatingAddress, setOperatingAddress] = useState(profile?.operatingAddress || "");
  const [dailyCapacity, setDailyCapacity] = useState(profile?.dailyCapacity || 100);

  // Volunteer-Specific Fields
  const [vehicleType, setVehicleType] = useState<any>(profile?.vehicleType || "bike");
  const [shifts, setShifts] = useState<Shift[]>(profile?.shifts || ["morning", "evening"]);
  const [emergencyContact, setEmergencyContact] = useState(profile?.emergencyContact || "");

  const [busy, setBusy] = useState(false);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 400, 0.7);
      setPhotoURL(compressed);
      toast.success("Profile photo uploaded!");
    } catch {
      toast.error("Could not read image file.");
    }
  }

  function toggleShift(s: Shift) {
    setShifts((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    try {
      const uid = user?.uid || "usr_" + Date.now();
      await updateProfile(uid, {
        name: displayName.trim(),
        photoURL,
        bio: bio.trim(),
        area: cityArea.trim(),
        phone: phone.trim(),
        orgName: orgName.trim(),
        donorType,
        defaultPickupAddress: defaultPickupAddress.trim(),
        fssaiNumber: fssaiNumber.trim(),
        registrationNumber: registrationNumber.trim(),
        operatingAddress: operatingAddress.trim(),
        dailyCapacity: Number(dailyCapacity) || 100,
        vehicleType,
        shifts,
        emergencyContact: emergencyContact.trim(),
      });

      toast.success("Profile completed! Welcome to FoodLoop.");
      navigate({ to: "/app" });
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#242923] flex flex-col justify-between">
      <header className="border-b border-[#E2DBD0] bg-white p-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Logo size="sm" />
          <span className="text-xs font-bold text-[#656C62]">Step 2 of 2</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="rounded-3xl border border-[#DDD5C8] bg-white p-8 shadow-sm">
          <div className="text-center">
            <h1 className="font-display text-3xl font-extrabold text-[#242923]">Profile Onboarding</h1>
            <p className="mt-1 text-xs text-[#656C62]">
              Configuring your workspace for{" "}
              <b className="capitalize text-[#205C43]">
                {role === "donor" ? "Food Donor" : role === "volunteer" ? "Delivery Volunteer" : "Recipient Shelter"}
              </b>
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="mt-8 space-y-5">
            {/* Photo & Display Name */}
            <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-[#DDD5C8] pb-6">
              <label className="relative cursor-pointer group">
                {photoURL ? (
                  <img src={photoURL} alt="Profile" className="size-20 rounded-2xl object-cover ring-2 ring-[#205C43]" />
                ) : (
                  <div className="grid size-20 place-items-center rounded-2xl border-2 border-dashed border-[#DDD5C8] bg-[#F8F5ED] text-[#656C62] group-hover:border-[#205C43]">
                    <Camera className="size-6" />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="sr-only" />
              </label>

              <div className="flex-1 w-full space-y-1">
                <label className="text-xs font-bold text-[#242923]">Display Name / Contact Person</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] px-3.5 py-2 text-xs font-bold text-[#242923]"
                />
              </div>
            </div>

            {/* Shared Fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#242923]">City / Service Neighborhood</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathura, Sector 14"
                  value={cityArea}
                  onChange={(e) => setCityArea(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] px-3.5 py-2 text-xs text-[#242923]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#242923]">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] px-3.5 py-2 text-xs text-[#242923]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#242923]">Short Bio / Community Mission</label>
              <textarea
                rows={2}
                placeholder="Briefly describe your kitchen or shelter initiative…"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] p-3 text-xs leading-relaxed text-[#242923]"
              />
            </div>

            {/* DONOR SPECIFIC FIELDS */}
            {(role === "donor" || role === "admin") && (
              <div className="rounded-2xl border border-[#ED7545]/30 bg-[#ED7545]/5 p-5 space-y-3.5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#ED7545]">Donor Establishment Details</p>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#242923]">Establishment Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Green Garden Kitchen"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-white px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#242923]">Establishment Type</label>
                    <select
                      value={donorType}
                      onChange={(e) => setDonorType(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-white px-3 py-2 text-xs font-semibold"
                    >
                      <option value="restaurant">Restaurant / Cafe</option>
                      <option value="catering">Catering & Banquet</option>
                      <option value="hostel">Hostel / Campus Mess</option>
                      <option value="event">Wedding & Event</option>
                      <option value="household">Individual Household</option>
                      <option value="other">Supermarket / Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#242923]">Default Pickup Address & Landmark</label>
                  <input
                    type="text"
                    placeholder="e.g. Service Gate 2, Campus Road"
                    value={defaultPickupAddress}
                    onChange={(e) => setDefaultPickupAddress(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-white px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#242923]">FSSAI License / Registration No. (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 12723004000192"
                    value={fssaiNumber}
                    onChange={(e) => setFssaiNumber(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-white px-3 py-2 text-xs"
                  />
                </div>
              </div>
            )}

            {/* RECIPIENT SPECIFIC FIELDS */}
            {(role === "recipient" || role === "ngo") && (
              <div className="rounded-2xl border border-[#205C43]/30 bg-[#205C43]/5 p-5 space-y-3.5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#205C43]">Recipient Organization Details</p>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#242923]">NGO / Shelter Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Feeding Hope Children's Home"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-white px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#242923]">Daily Beneficiaries Capacity</label>
                    <input
                      type="number"
                      placeholder="e.g. 150"
                      value={dailyCapacity}
                      onChange={(e) => setDailyCapacity(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-white px-3 py-2 text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#242923]">Operating Facility Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Rain Basera Shelter, Near Railway Station"
                    value={operatingAddress}
                    onChange={(e) => setOperatingAddress(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-white px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#242923]">NGO Darpan / Trust Registration ID</label>
                  <input
                    type="text"
                    placeholder="e.g. NGO-UP-2023-8891"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-white px-3 py-2 text-xs"
                  />
                </div>
              </div>
            )}

            {/* VOLUNTEER SPECIFIC FIELDS */}
            {role === "volunteer" && (
              <div className="rounded-2xl border border-[#3F8F62]/30 bg-[#3F8F62]/5 p-5 space-y-3.5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#3F8F62]">Delivery Logistics</p>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#242923]">Mode of Transport</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-white px-3 py-2 text-xs font-semibold"
                    >
                      <option value="bike">Motorcycle / Bike 🏍️</option>
                      <option value="scooter">Scooter / Scooty 🛵</option>
                      <option value="car">Car / Van 🚗</option>
                      <option value="bicycle">Bicycle 🚲</option>
                      <option value="walking">On Foot / Walking 🚶</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#242923]">Emergency Contact Number</label>
                    <input
                      type="tel"
                      placeholder="+91 99887 76655"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-white px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#242923]">Availability Shifts</label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {(
                      [
                        ["morning", "Morning (8 AM - 12 PM)"],
                        ["afternoon", "Afternoon (12 PM - 4 PM)"],
                        ["evening", "Evening (4 PM - 8 PM)"],
                        ["night", "Night (8 PM - 12 AM)"],
                      ] as const
                    ).map(([s, label]) => {
                      const active = shifts.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleShift(s)}
                          className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                            active
                              ? "bg-[#205C43] text-white shadow-xs"
                              : "border border-[#DDD5C8] bg-white text-[#656C62] hover:bg-[#F8F5ED]"
                          }`}
                        >
                          {active && "✓ "}
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-[#205C43] py-3.5 text-xs font-bold text-white shadow-xs hover:brightness-105 disabled:opacity-50"
            >
              {busy ? "Saving Profile…" : "Save & Launch My FoodLoop Dashboard →"}
            </button>
          </form>
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-[#656C62]">
        <p>© FoodLoop Inc. Good food. Shared with purpose.</p>
      </footer>
    </div>
  );
}
