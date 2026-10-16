import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyApsvkLkXXgx7_4GBtoSntbcPp2_ZvozRs",
  authDomain: "food-app-f3778.firebaseapp.com",
  projectId: "food-app-f3778",
  storageBucket: "food-app-f3778.firebasestorage.app",
  messagingSenderId: "587598535959",
  appId: "1:587598535959:web:52a6d560705cdd71a26b52",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Authentic Indian Hunger Relief, Child Welfare, Langar & Donation Camp photos
const INDIAN_PHOTOS = {
  midday_meal_children: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80",
  slum_children_feeding: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80",
  langar_distribution: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80",
  child_eating_meal: "https://images.unsplash.com/photo-1578357078586-491adf1aa5c7?w=800&auto=format&fit=crop&q=80",
  ration_relief_kit: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80",
  bakery_loaves: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80",
  fruit_basket: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&auto=format&fit=crop&q=80",
  dairy_milk: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&auto=format&fit=crop&q=80",
};

async function seed() {
  console.log("Authenticating with Firebase...");
  const adminEmail = "admin.moderator@foodloop.org";
  const adminPass = "demo123456";
  try {
    await signInWithEmailAndPassword(auth, adminEmail, adminPass);
    console.log("✓ Signed in as admin.moderator@foodloop.org");
  } catch {
    await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
    console.log("✓ Created admin.moderator@foodloop.org account");
  }

  console.log("Seeding Firebase Firestore Schema for project: food-app-f3778...");

  // 1. LISTINGS Collection
  const listings = [
    {
      id: "lst_langar_khichdi",
      donorId: "donor_gurdwara_seva",
      donorName: "Gurdwara Sahib Community Langar Kitchen",
      donorAvatar: INDIAN_PHOTOS.midday_meal_children,
      donorPhone: "+91 98765 12340",
      title: "Desi Ghee Dal Khichdi & 150 Fresh Rotis for Slum Feeding",
      description: "Wholesome, steaming hot yellow moong dal khichdi cooked in traditional brass degh with fresh turmeric and cumin, served with 150 soft wheat rotis. Specially prepared for underprivileged children and homeless elders at rain baseras.",
      category: "Cooked meals",
      foodType: "veg",
      quantity: 150,
      unit: "plates",
      preparedAt: Date.now() - 1 * 3600_000,
      pickupDeadline: Date.now() + 4 * 3600_000,
      locationText: "Gurdwara Seva Trust, Railway Station Road, Mathura",
      pickupInstructions: "Community kitchen dispatch bay 1. Speak with Bhai Harpreet Singh.",
      storage: "hot",
      allergens: ["Gluten"],
      checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
      photo: INDIAN_PHOTOS.midday_meal_children,
      status: "available",
      createdAt: Date.now() - 1 * 3600_000,
      history: [{ status: "available", at: Date.now() - 1 * 3600_000, by: "Gurdwara Sahib", note: "Listed freshly cooked langar khichdi" }],
    },
    {
      id: "lst_banquet_pulao",
      donorId: "donor_shree_radhe_banquet",
      donorName: "Shree Radhe Krishna Banquet & Caterers",
      donorAvatar: INDIAN_PHOTOS.slum_children_feeding,
      donorPhone: "+91 98223 44556",
      title: "Wedding Feast Surplus: Shahi Paneer, Pulao & Gulab Jamun",
      description: "Pristine unserved wedding feast surplus packed safely into insulated thermal containers at 68°C right after banquet dinner concluded. Guaranteed hygienic and high in nutrition for shelter children.",
      category: "Cooked meals",
      foodType: "veg",
      quantity: 180,
      unit: "plates",
      preparedAt: Date.now() - 1.5 * 3600_000,
      pickupDeadline: Date.now() + 3 * 3600_000,
      locationText: "Shree Radhe Krishna Banquet Hall, NH-19, Mathura Bypass",
      pickupInstructions: "Kitchen rear loading dock. Ask for Manager Ramesh.",
      storage: "hot",
      allergens: ["Dairy", "Gluten"],
      checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
      photo: INDIAN_PHOTOS.child_eating_meal,
      status: "available",
      createdAt: Date.now() - 1.5 * 3600_000,
      history: [{ status: "available", at: Date.now() - 1.5 * 3600_000, by: "Shree Radhe Krishna Banquet", note: "Listed banquet dinner surplus" }],
    },
    {
      id: "lst_emergency_ration",
      donorId: "donor_annapurna_trust",
      donorName: "Maa Annapurna Hunger Relief Foundation",
      donorAvatar: INDIAN_PHOTOS.langar_distribution,
      donorPhone: "+91 98112 55667",
      title: "Emergency Slum Ration Survival Kits (Atta, Dal, Oil)",
      description: "Pre-packed emergency dry ration bags for families facing severe hunger in slum colonies. Each kit contains 5kg wheat atta, 2kg chana dal, 1L mustard oil, iodized salt, and biscuits.",
      category: "Packaged food",
      foodType: "vegan",
      quantity: 80,
      unit: "kits",
      preparedAt: Date.now() - 2 * 3600_000,
      pickupDeadline: Date.now() + 24 * 3600_000,
      locationText: "Annapurna Relief Warehouse, Sector 3, Mathura",
      pickupInstructions: "Gate No. 2, ask for Seva Coordinator Anita.",
      storage: "room",
      allergens: ["Gluten"],
      checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
      photo: INDIAN_PHOTOS.langar_distribution,
      status: "available",
      createdAt: Date.now() - 2 * 3600_000,
      history: [{ status: "available", at: Date.now() - 2 * 3600_000, by: "Maa Annapurna Foundation", note: "Listed 80 emergency dry ration kits" }],
    },
    {
      id: "lst_child_breakfast",
      donorId: "donor_daily_bread",
      donorName: "Navodaya Slum Child Care & Bakery",
      donorAvatar: INDIAN_PHOTOS.child_eating_meal,
      donorPhone: "+91 99180 77889",
      title: "Fortified Whole-Wheat Bread & Nutritious Buns for Kids",
      description: "Freshly baked whole wheat breads, high-protein milk buns, and rusks donated to support morning breakfast at remedial street schools and orphanages.",
      category: "Bakery",
      foodType: "vegetarian",
      quantity: 90,
      unit: "loaves",
      preparedAt: Date.now() - 3 * 3600_000,
      pickupDeadline: Date.now() + 10 * 3600_000,
      locationText: "Civil Lines Bakery Depot, Mathura",
      pickupInstructions: "Rear dispatch counter, speak with Sunil.",
      storage: "room",
      allergens: ["Gluten"],
      checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
      photo: INDIAN_PHOTOS.bakery_loaves,
      status: "available",
      createdAt: Date.now() - 3 * 3600_000,
      history: [{ status: "available", at: Date.now() - 3 * 3600_000, by: "Navodaya Child Care", note: "Listed fresh morning breakfast breads" }],
    },
    {
      id: "lst_mandi_fruits",
      donorId: "donor_kisan_mandi",
      donorName: "Kisan Wholesale Mandi Farmers Association",
      donorAvatar: INDIAN_PHOTOS.fruit_basket,
      donorPhone: "+91 97112 33445",
      title: "Fresh Seasonal Fruit Crates (Bananas, Apples & Oranges)",
      description: "Direct farm surplus crates of grade-A fresh fruits. Essential vitamin nutrition for malnourished children and shelter residents.",
      category: "Fruits & vegetables",
      foodType: "vegan",
      quantity: 120,
      unit: "kg",
      preparedAt: Date.now() - 4 * 3600_000,
      pickupDeadline: Date.now() + 18 * 3600_000,
      locationText: "Agricultural Mandi Complex, Yard 4, Mathura",
      pickupInstructions: "Shed 4, speak with Mandi President Rajender Kumar.",
      storage: "room",
      allergens: [],
      checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
      photo: INDIAN_PHOTOS.fruit_basket,
      status: "available",
      createdAt: Date.now() - 4 * 3600_000,
      history: [{ status: "available", at: Date.now() - 4 * 3600_000, by: "Kisan Mandi Association", note: "Listed fresh wholesale fruit crates" }],
    },
    {
      id: "lst_dairy_milk",
      donorId: "donor_dairy_coop",
      donorName: "Braj Bhoomi Dairy Co-operative",
      donorAvatar: INDIAN_PHOTOS.dairy_milk,
      donorPhone: "+91 94120 66778",
      title: "Chilled Pasteurized Milk Pouches & High-Protein Dahi",
      description: "Fresh pasteurized milk pouches and curd tubs stored at continuous 3.5°C cold storage. Donated for toddler nutrition programs in underprivileged colonies.",
      category: "Dairy",
      foodType: "veg",
      quantity: 100,
      unit: "pouches",
      preparedAt: Date.now() - 2 * 3600_000,
      pickupDeadline: Date.now() + 6 * 3600_000,
      locationText: "Braj Bhoomi Cold Plant, Highway Depot, Mathura",
      pickupInstructions: "Cold Storage Dispatch Gate, speak to In-charge Pooja.",
      storage: "chilled",
      allergens: ["Dairy"],
      checklist: { covered: true, temperature: true, hygienic: true, notExpired: true },
      photo: INDIAN_PHOTOS.dairy_milk,
      status: "available",
      createdAt: Date.now() - 2 * 3600_000,
      history: [{ status: "available", at: Date.now() - 2 * 3600_000, by: "Braj Bhoomi Dairy", note: "Listed refrigerated dairy pouches" }],
    },
  ];

  for (const l of listings) {
    await setDoc(doc(db, "listings", l.id), l, { merge: true });
    console.log(`✓ Seeded listing: ${l.id} - ${l.title}`);
  }

  // 2. USERS Collection
  const users = [
    {
      uid: "user_donor_gurdwara",
      name: "Bhai Harpreet Singh",
      email: "donor@foodloop.org",
      role: "donor",
      orgName: "Gurdwara Sahib Community Langar Kitchen",
      donorType: "catering",
      phone: "+91 98765 12340",
      area: "Station Road, Mathura",
      defaultPickupAddress: "Gurdwara Seva Trust, Railway Station Road, Mathura",
      bio: "Serving hot langar khichdi and fresh rotis every day to needy citizens.",
      photoURL: INDIAN_PHOTOS.midday_meal_children,
      verified: true,
      createdAt: Date.now() - 30 * 86400_000,
    },
    {
      uid: "user_recipient_asha",
      name: "Sister Mary & Rajiv Sharma",
      email: "recipient@foodloop.org",
      role: "recipient",
      orgName: "Asha Children Orphanage & Night Shelter",
      contactPerson: "Rajiv Sharma",
      registrationNumber: "NGO/UP/MTR/2019/8472",
      dailyCapacity: 250,
      phone: "+91 98223 99887",
      area: "Civil Lines, Mathura",
      operatingAddress: "Plot 14, Near District Hospital, Civil Lines, Mathura",
      photoURL: INDIAN_PHOTOS.slum_children_feeding,
      verified: true,
      createdAt: Date.now() - 45 * 86400_000,
    },
    {
      uid: "user_volunteer_aman",
      name: "Aman Verma",
      email: "volunteer@foodloop.org",
      role: "volunteer",
      phone: "+91 98112 33445",
      area: "Mathura City & NH-19 Corridor",
      shifts: ["morning", "evening", "night"],
      vehicleType: "bike",
      emergencyContact: "+91 98112 00000",
      photoURL: INDIAN_PHOTOS.langar_distribution,
      verified: true,
      createdAt: Date.now() - 60 * 86400_000,
    },
    {
      uid: "user_admin_super",
      name: "FoodLoop Mission Director",
      email: "admin@foodloop.org",
      role: "admin",
      phone: "+91 90000 00001",
      area: "Headquarters Mathura & NCR",
      verified: true,
      createdAt: Date.now() - 100 * 86400_000,
    },
  ];

  for (const u of users) {
    await setDoc(doc(db, "users", u.uid), u, { merge: true });
    console.log(`✓ Seeded user profile: ${u.uid} (${u.role})`);
  }

  // 3. COMMUNITY STORIES Collection
  const stories = [
    {
      id: "story_slum_school",
      author: "Prerna Slum Welfare School",
      role: "Recipient NGO",
      badge: "Verified Shelter",
      avatar: INDIAN_PHOTOS.slum_children_feeding,
      image: INDIAN_PHOTOS.slum_children_feeding,
      time: "Yesterday",
      title: "180 slum children received warm nutritious khichdi",
      content: "Instead of going to bed on empty stomachs, children in our evening study center received steaming hot khichdi, curd, and fresh apples rescued from an evening banquet in Mathura. The smile on their faces is priceless!",
      mealsServed: 180,
      likes: 64,
      location: "Railway Slum Colony, Mathura",
      createdAt: Date.now() - 86400_000,
    },
    {
      id: "story_night_shelter",
      author: "Rain Basera Homeless Relief",
      role: "Shelter Partner",
      badge: "Govt Partner",
      avatar: INDIAN_PHOTOS.midday_meal_children,
      image: INDIAN_PHOTOS.midday_meal_children,
      time: "2 days ago",
      title: "140 hot meal plates delivered during night chill",
      content: "Volunteer Aman picked up insulated dispensers from Gurdwara Sahib at 9:30 PM and reached our night shelter before 10 PM. Warm food gives strength to rickshaw pullers and elderly homeless people.",
      mealsServed: 140,
      likes: 89,
      location: "Rain Basera Station Area",
      createdAt: Date.now() - 2 * 86400_000,
    },
    {
      id: "story_ration_kits",
      author: "Maa Annapurna Relief Trust",
      role: "Food Bank",
      badge: "Disaster Relief",
      avatar: INDIAN_PHOTOS.langar_distribution,
      image: INDIAN_PHOTOS.langar_distribution,
      time: "3 days ago",
      title: "80 Emergency ration kits distributed to daily-wage families",
      content: "Displaced families along the riverbed received essential dry food survival packets containing atta, pulses, and oil. Every handover is tracked with 4-digit verification.",
      mealsServed: 400,
      likes: 112,
      location: "Yamuna Khadar Relief Camp",
      createdAt: Date.now() - 3 * 86400_000,
    },
  ];

  for (const s of stories) {
    await setDoc(doc(db, "community_stories", s.id), s, { merge: true });
    console.log(`✓ Seeded community story: ${s.id}`);
  }

  // 4. VERIFICATION REQUESTS Collection
  const verifications = [
    {
      id: "vr_001",
      userId: "user_recipient_asha",
      name: "Asha Children Orphanage",
      type: "ngo",
      registrationId: "NGO/UP/MTR/2019/8472",
      contactPerson: "Rajiv Sharma",
      area: "Civil Lines, Mathura",
      date: "2026-10-15",
      status: "approved",
      notes: "Valid NGO Darpan registration and 80G certificate verified.",
    },
    {
      id: "vr_002",
      userId: "user_donor_gurdwara",
      name: "Gurdwara Sahib Langar Kitchen",
      type: "donor",
      registrationId: "TRUST/PB/2014/1102",
      contactPerson: "Bhai Harpreet Singh",
      area: "Station Road, Mathura",
      date: "2026-10-16",
      status: "approved",
      notes: "Community kitchen inspection cleared with 5-star hygiene rating.",
    },
  ];

  for (const v of verifications) {
    await setDoc(doc(db, "verification_requests", v.id), v, { merge: true });
    console.log(`✓ Seeded verification request: ${v.id}`);
  }

  // 5. AUDIT LOGS Collection
  const audits = [
    {
      id: "aud_001",
      action: "FOOD_LISTED",
      actor: "Bhai Harpreet Singh",
      target: "Desi Ghee Dal Khichdi (150 plates)",
      time: new Date(Date.now() - 3600_000).toISOString(),
      details: "Hot surplus listed with 4-hour expiry timer and FSSAI hygiene checklist.",
    },
    {
      id: "aud_002",
      action: "PICKUP_VERIFIED",
      actor: "Aman Verma (Volunteer)",
      target: "4-Digit Code #4829 Handover",
      time: new Date(Date.now() - 1800_000).toISOString(),
      details: "Verified pickup code at donor dispatch counter. Secure transit initiated.",
    },
  ];

  for (const a of audits) {
    await setDoc(doc(db, "audit_logs", a.id), a, { merge: true });
    console.log(`✓ Seeded audit log: ${a.id}`);
  }

  // 6. PLATFORM NOTICES Collection
  const notices = [
    {
      id: "notice_001",
      title: "Mission Zero Hunger Mathura Alert",
      body: "All verified donors are urged to list wedding and banquet surplus by 10:30 PM for rapid night shelter dispatch.",
      targetRole: "all",
      active: true,
      date: "2026-10-16",
    },
  ];

  for (const n of notices) {
    await setDoc(doc(db, "platform_notices", n.id), n, { merge: true });
    console.log(`✓ Seeded platform notice: ${n.id}`);
  }

  console.log("\n🎉 ALL FIREBASE FIRESTORE SCHEMAS & COLLECTIONS SUCCESSFULLY GENERATED!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Firebase Schema seeding failed:", err);
  process.exit(1);
});
