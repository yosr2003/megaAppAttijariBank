import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";
export type CategoryKey =
  | "all"
  | "concerts"
  | "festival"
  | "sports"
  | "cinema"
  | "conferences"
  | "family"
  | "travel";

export interface Category {
  key: CategoryKey;
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
}

export interface EventItem {
  id: string;
  title: string;
  category: CategoryKey;
  categoryLabel: string;
  categoryColor: string;
  image: string;
  organizer: string;
  rating: number;
  reviews: number;
  location: string;
  venue: string;
  date: string;
  dateISO: string;
  time: string;
  attending: number;
  capacity: number;
  priceFrom: number;
  priceTo: number;
  currency: string;
  trending: boolean;
  aiMatch: number | null;
  availabilityLabel: "Available" | "Filling fast" | "Almost full";
  availabilityPercent: number;
  ticketsLeft: number;
  tags: string[];
  description?: string; 
  latitude: number;
  longitude: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  color: string;
}

export interface NearbyPin {
  id: string;
  label: string;
  color: string;
  top: number;
  left: number;
}

export interface OutingPlan {
  weather: string;
  transport: string;
  dinner: string;
  hotel: string;
  budget: string;
  tips: string;
}
