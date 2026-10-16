export type Role = "donor" | "ngo" | "volunteer";
export type Shift = "morning" | "afternoon" | "evening" | "night";

export interface Profile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  orgName?: string;
  phone?: string;
  area?: string;
  shifts?: Shift[];
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
  donorPhone?: string;
  title: string;
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

export const STATUS_LABEL: Record<Status, string> = {
  available: "Available",
  reserved: "Reserved",
  assigned: "Volunteer assigned",
  picked_up: "Picked up",
  completed: "Completed",
  cancelled: "Cancelled",
};
