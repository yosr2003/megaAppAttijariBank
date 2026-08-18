import {
  InterestKey,
  LocationKey,
  PeriodKey,
  PreferenceOption,
} from "../types/eventPreferences";

export const interestOptions: PreferenceOption<InterestKey>[] = [
  { key: "concerts", label: "Concerts", icon: "musical-notes" },
  { key: "festivals", label: "Festivals", icon: "sparkles" },
  { key: "sports", label: "Sports", icon: "trophy" },
  { key: "cinema", label: "Cinéma", icon: "film" },
  { key: "theatre", label: "Théâtre & spectacles", icon: "megaphone" },
  { key: "art_culture", label: "Art & culture", icon: "color-palette" },
  { key: "conferences_business", label: "Conférences & business", icon: "briefcase" },
  { key: "family", label: "Famille", icon: "people" },
  { key: "travel", label: "Voyages & excursions", icon: "airplane" },
  { key: "gastronomy", label: "Gastronomie", icon: "restaurant" },
  { key: "technology", label: "Technologie", icon: "hardware-chip" },
  { key: "education", label: "Éducation", icon: "school" },
  { key: "gaming", label: "Gaming", icon: "game-controller" },
  { key: "nightlife", label: "Vie nocturne", icon: "moon" },
];

export const periodOptions: PreferenceOption<PeriodKey>[] = [
  { key: "morning", label: "Matin", icon: "partly-sunny" },
  { key: "afternoon", label: "Après-midi", icon: "sunny" },
  { key: "late_afternoon", label: "Fin de journée", icon: "cloudy-night" },
  { key: "evening", label: "Soirée", icon: "moon" },
  { key: "night", label: "Nuit", icon: "star" },
  { key: "weekend_only", label: "Week-end uniquement", icon: "flag" },
  { key: "weekdays", label: "En semaine", icon: "calendar" },
  { key: "any_time", label: "Peu importe", icon: "infinite" },
];

export const locationOptions: PreferenceOption<LocationKey>[] = [
  { key: "tunis", label: "Tunis", icon: "location" },
  { key: "ariana", label: "Ariana", icon: "location" },
  { key: "ben_arous", label: "Ben Arous", icon: "location" },
  { key: "manouba", label: "Manouba", icon: "location" },
  { key: "nabeul", label: "Nabeul", icon: "location" },
  { key: "hammamet", label: "Hammamet", icon: "location" },
  { key: "sousse", label: "Sousse", icon: "location" },
  { key: "monastir", label: "Monastir", icon: "location" },
  { key: "sfax", label: "Sfax", icon: "location" },
  { key: "bizerte", label: "Bizerte", icon: "location" },
  { key: "other", label: "Autre", icon: "ellipsis-horizontal" },
];