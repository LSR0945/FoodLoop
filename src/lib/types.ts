export type Role = "donor" | "recipient" | "ngo" | "volunteer" | "admin";
export type Shift = "morning" | "afternoon" | "evening" | "night";

export interface DonorRecord {
  uid: string;
  name: string;
  orgName?: string;
  donorType: "restaurant" | "catering" | "hostel" | "event" | "household" | "other";
  email: string;
  phone: string;
  area: string;
  defaultPickupAddress?: string;
  fssaiNumber?: string;
  bio?: string;
  photoURL?: string;
  verified?: boolean;
  createdAt: number;
}

export interface NGORecord {
  uid: string;
  name: string;
  orgName: string; // Recipient / NGO / Trust name
  contactPerson: string;
  registrationNumber?: string; // Darpan / Trust Reg ID
  email: string;
  phone: string;
  area: string;
  operatingAddress?: string;
  dailyCapacity?: number; // approx beneficiaries served
  photoURL?: string;
  verified?: boolean;
  createdAt: number;
}

export interface VolunteerRecord {
  uid: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  shifts: Shift[];
  vehicleType?: "bike" | "scooter" | "car" | "bicycle" | "walking";
  emergencyContact?: string;
  photoURL?: string;
  verified?: boolean;
  createdAt: number;
}

export interface Profile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  orgName?: string;
  phone?: string;
  area?: string;
  shifts?: Shift[];
  donorType?: "restaurant" | "catering" | "hostel" | "event" | "household" | "other";
  fssaiNumber?: string;
  defaultPickupAddress?: string;
  bio?: string;
  photoURL?: string;
  contactPerson?: string;
  registrationNumber?: string;
  operatingAddress?: string;
  dailyCapacity?: number;
  vehicleType?: "bike" | "scooter" | "car" | "bicycle" | "walking";
  emergencyContact?: string;
  verified?: boolean;
  createdAt: number;
}

export type Status = "available" | "reserved" | "assigned" | "picked_up" | "completed" | "cancelled";

export const CATEGORIES = [
  "Cooked meals",
  "Bakery",
  "Fruits & vegetables",
  "Packaged food",
  "Dairy",
  "Beverages",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const ALLERGENS = ["Gluten", "Dairy", "Nuts", "Peanuts", "Soy", "Egg", "Fish", "Sesame"];

export interface Checklist {
  covered: boolean;
  temperature: boolean;
  hygienic: boolean;
  notExpired: boolean;
}

export interface HistoryEntry {
  status: Status;
  at: number;
  by: string;
  note?: string;
}

export interface Listing {
  id: string;
  donorId: string;
  donorName: string;
  donorAvatar?: string;
  donorPhone?: string;
  title: string;
  description?: string;
  category: Category;
  foodType: "veg" | "non-veg" | "vegan";
  quantity: number;
  unit: string;
  preparedAt: number;
  pickupDeadline: number;
  locationText: string;
  pickupInstructions: string;
  storage: "hot" | "chilled" | "room";
  allergens: string[];
  checklist: Checklist;
  photo?: string;
  gallery?: string[];
  status: Status;
  reservedBy?: string;
  reservedByName?: string;
  pickupCode?: string;
  volunteerId?: string;
  volunteerName?: string;
  quantityDistributed?: number;
  completionNote?: string;
  completedAt?: number;
  createdAt: number;
  history: HistoryEntry[];
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  listingId?: string;
  read: boolean;
  createdAt: number;
}

export interface CommunityStory {
  id: string;
  author: string;
  role: string;
  badge: string;
  avatar: string;
  image: string;
  time: string;
  title: string;
  content: string;
  mealsServed: number;
  likes: number;
  location: string;
  createdAt?: number;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  name: string;
  type: "ngo" | "donor" | "volunteer";
  registrationId: string;
  contactPerson: string;
  area: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  actor: string;
  target: string;
  time: string;
  details: string;
}

export interface PlatformNotice {
  id: string;
  title: string;
  body: string;
  targetRole: "all" | "donor" | "recipient" | "volunteer";
  active: boolean;
  date: string;
}

export const STATUS_LABEL: Record<Status, string> = {
  available: "Available",
  reserved: "Reserved",
  assigned: "Volunteer assigned",
  picked_up: "Picked up",
  completed: "Completed",
  cancelled: "Cancelled",
};
