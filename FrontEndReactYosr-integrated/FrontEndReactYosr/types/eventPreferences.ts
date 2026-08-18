import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

/**
 * Clés stables utilisées par le backend.
 */
export type InterestKey =
  | "concerts"
  | "festivals"
  | "sports"
  | "cinema"
  | "theatre"
  | "art_culture"
  | "conferences_business"
  | "family"
  | "travel"
  | "gastronomy"
  | "technology"
  | "education"
  | "gaming"
  | "nightlife";

export type PeriodKey =
  | "morning"
  | "afternoon"
  | "late_afternoon"
  | "evening"
  | "night"
  | "weekend_only"
  | "weekdays"
  | "any_time";

export type LocationKey =
  | "tunis"
  | "ariana"
  | "ben_arous"
  | "manouba"
  | "nabeul"
  | "hammamet"
  | "sousse"
  | "monastir"
  | "sfax"
  | "bizerte"
  | "other"
  | "near_me";

export interface PreferenceOption<K extends string> {
  key: K;
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
}

/**
 * Préférences envoyées au backend.
 */
export interface EventPreferences {
interests: string[];
preferredPeriods: string[];
locations: string[];

  maxDistanceKm: number;

  minBudget: number;
  maxBudget: number;

  freeOnly: boolean;
  anyBudget: boolean;

  useCurrentLocation: boolean;
}

export const DEFAULT_EVENT_PREFERENCES: EventPreferences = {
  interests: [],
  preferredPeriods: [],
  locations: [],

  maxDistanceKm: 25,

  minBudget: 0,
  maxBudget: 100,

  freeOnly: false,
  anyBudget: false,

  useCurrentLocation: false,
};

export const MIN_INTERESTS_REQUIRED = 2;

export const BUDGET_MIN_DT = 0;
export const BUDGET_MAX_DT = 200;

export const DISTANCE_STEPS_KM = [
  5,
  10,
  25,
  50,
  100,
] as const;