// services/eventPreferenceService.ts

import { api } from "./api";
import { getToken } from "../utils/storage";

/* =========================================================
   TYPES
========================================================= */

export interface EventPreferenceOption {
  key: string;
  label: string;
  icon: string;
}

export interface EventPreferenceOptionsResponse {
  interests: EventPreferenceOption[];
  periods: EventPreferenceOption[];
  locations: EventPreferenceOption[];
}

export interface SaveEventPreferencesRequest {
  userId: number;
  interests: string[];
  preferredPeriods: string[];
  locations: string[];
  maxDistanceKm: number;
  minBudget: number;
  maxBudget: number;
  freeOnly: boolean;
  anyBudget: boolean;
}

/* =========================================================
   GET OPTIONS
========================================================= */

/**
 * Récupérer les options de préférences depuis le backend.
 *
 * Le backend récupère les données depuis la BD.
 */
export const getEventPreferenceOptions =
  async (): Promise<EventPreferenceOptionsResponse> => {
    const token = await getToken();

    const response = await api.get(
      "/event-preferences/options",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  };

/* =========================================================
   GET USER PREFERENCES
========================================================= */

/**
 * Récupérer les préférences déjà sauvegardées
 * d'un utilisateur.
 */
export const getUserEventPreferences = async (
  userId: number
) => {
  const token = await getToken();

  const response = await api.get(
    `/event-preferences/user/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

/* =========================================================
   SAVE PREFERENCES
========================================================= */

/**
 * Sauvegarder les préférences d'un utilisateur.
 */
export const saveEventPreferences = async (
  data: SaveEventPreferencesRequest
) => {
  const token = await getToken();

  const response = await api.post(
    `/event-preferences/user/${data.userId}`,
    {
      interests: data.interests,
      preferredPeriods: data.preferredPeriods,
      locations: data.locations,
      maxDistanceKm: data.maxDistanceKm,
      minBudget: data.minBudget,
      maxBudget: data.maxBudget,
      freeOnly: data.freeOnly,
      anyBudget: data.anyBudget,

    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};