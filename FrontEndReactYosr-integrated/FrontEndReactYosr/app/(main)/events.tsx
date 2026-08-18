import React, { useMemo, useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Location from "expo-location";

import Header from "../../components/Header";
import SearchBar from "../../components/SearchBar";
import FeaturedCarousel from "../../components/FeaturedCarousel";
import CategoryList from "../../components/CategoryList";
import EventCard from "../../components/EventCard";
import RecommendedEventCard from "../../components/RecommendedEventCard";
import NearbyEvents from "../../components/NearbyEvents";
import BottomNavigation from "../../components/BottomNavigation";

import { categories } from "../../data/categories";
import { CategoryKey, EventItem } from "../../types";

import { Colors } from "../../constants/home/Colors";
import { Typography } from "../../constants/home/Typography";
import {
  Layout,
  Spacing,
} from "../../constants/home/Layout";

import {
  getUserEventPreferences,
} from "../../services/eventPreferenceService";
import { PeriodKey } from "@/types/eventPreferences";
import { getUser } from "@/utils/storage";

/* =========================================================
   TYPES
========================================================= */

interface EventPreferences {
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
   CONSTANTES
========================================================= */

const DEFAULT_PREFERENCES: EventPreferences = {
  interests: [],
  preferredPeriods: [],
  locations: [],

  maxDistanceKm: 25,

  minBudget: 0,
  maxBudget: 100,

  freeOnly: false,
  anyBudget: false,

};

/* =========================================================
   NORMALISATION
========================================================= */

const normalize = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");
};

/* =========================================================
   MAP CATEGORY API -> CATEGORY APP
========================================================= */

const mapCategory = (
  apiCategory: string
): CategoryKey => {
  const c = normalize(apiCategory);

  if (
    c.includes("music") ||
    c.includes("concert") ||
    c.includes("musique")
  ) {
    return "concerts";
  }

  if (
    c.includes("festival") ||
    c.includes("festivals")
  ) {
    return "festival";
  }

  if (
    c.includes("sport") ||
    c.includes("sports")
  ) {
    return "sports";
  }

  if (
    c.includes("cinema") ||
    c.includes("movie") ||
    c.includes("film")
  ) {
    return "cinema";
  }

  if (
    c.includes("conference") ||
    c.includes("business") ||
    c.includes("professionnel")
  ) {
    return "conferences";
  }

  if (
    c.includes("family") ||
    c.includes("kids") ||
    c.includes("famille")
  ) {
    return "family";
  }

  if (
    c.includes("travel") ||
    c.includes("trip") ||
    c.includes("voyage")
  ) {
    return "travel";
  }

  return "all";
};

/* =========================================================
   INTEREST -> EVENT CATEGORY
========================================================= */

const interestMatchesEvent = (
  interest: string,
  event: EventItem
): boolean => {
  const i = normalize(interest);

  const category = normalize(event.category);
  const label = normalize(event.categoryLabel);
  const title = normalize(event.title);
  const description = normalize(event.description);

  /* Concerts */
  if (
    i === "concerts" ||
    i === "concert" ||
    i === "music" ||
    i === "musique"
  ) {
    return (
      category === "concerts" ||
      label.includes("concert") ||
      title.includes("concert") ||
      description.includes("concert") ||
      title.includes("music") ||
      description.includes("music")
    );
  }

  /* Festivals */
  if (
    i === "festivals" ||
    i === "festival"
  ) {
    return (
      category === "festival" ||
      label.includes("festival") ||
      title.includes("festival")
    );
  }

  /* Sports */
  if (
    i === "sports" ||
    i === "sport"
  ) {
    return (
      category === "sports" ||
      label.includes("sport") ||
      title.includes("run") ||
      title.includes("course") ||
      title.includes("marathon") ||
      description.includes("sport")
    );
  }

  /* Cinema */
  if (
    i === "cinema" ||
    i === "movies" ||
    i === "movie" ||
    i === "film"
  ) {
    return (
      category === "cinema" ||
      label.includes("cinema") ||
      label.includes("film") ||
      title.includes("cinema") ||
      title.includes("film")
    );
  }

  /* Theatre */
  if (
    i === "theatre" ||
    i === "theater" ||
    i === "theatre"
  ) {
    return (
      label.includes("theatre") ||
      label.includes("theater") ||
      title.includes("theatre") ||
      description.includes("theatre")
    );
  }

  /* Art / Culture */
  if (
    i === "art_culture" ||
    i === "culture" ||
    i === "art"
  ) {
    return (
      label.includes("culture") ||
      label.includes("art") ||
      title.includes("culture") ||
      title.includes("art") ||
      description.includes("culture")
    );
  }

  /* Conferences / Business */
  if (
    i === "conferences_business" ||
    i === "conference" ||
    i === "conferences" ||
    i === "business"
  ) {
    return (
      category === "conferences" ||
      label.includes("professionnel") ||
      label.includes("conference") ||
      label.includes("business") ||
      title.includes("conference") ||
      title.includes("journee")
    );
  }

  /* Family */
  if (
    i === "family" ||
    i === "famille"
  ) {
    return (
      category === "family" ||
      label.includes("family") ||
      label.includes("famille") ||
      title.includes("family") ||
      title.includes("famille")
    );
  }

  /* Travel */
  if (
    i === "travel" ||
    i === "voyage"
  ) {
    return (
      category === "travel" ||
      label.includes("travel") ||
      label.includes("voyage") ||
      title.includes("voyage")
    );
  }

  /* Gastronomy */
  if (
    i === "gastronomy" ||
    i === "gastronomie" ||
    i === "food"
  ) {
    return (
      label.includes("food") ||
      label.includes("gastronomie") ||
      label.includes("gastronomy") ||
      title.includes("food") ||
      title.includes("gastronomie") ||
      description.includes("gastronomie")
    );
  }

  /* Technology */
  if (
    i === "technology" ||
    i === "technologie" ||
    i === "tech"
  ) {
    return (
      label.includes("tech") ||
      label.includes("technologie") ||
      title.includes("tech") ||
      title.includes("technologie") ||
      description.includes("logiciel") ||
      description.includes("software")
    );
  }

  /* Education */
  if (
    i === "education" ||
    i === "education"
  ) {
    return (
      label.includes("education") ||
      label.includes("educatif") ||
      title.includes("education") ||
      title.includes("formation")
    );
  }

  /* Gaming */
  if (
    i === "gaming" ||
    i === "game"
  ) {
    return (
      label.includes("gaming") ||
      label.includes("game") ||
      title.includes("gaming") ||
      title.includes("game")
    );
  }

  /* Nightlife */
  if (
    i === "nightlife" ||
    i === "night_life"
  ) {
    return (
      label.includes("night") ||
      label.includes("nightlife") ||
      title.includes("night") ||
      description.includes("night")
    );
  }

  return false;
};

/* =========================================================
   DISTANCE HAVERSINE
========================================================= */

const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
};

/* =========================================================
   EVENT PERIOD
========================================================= */

const getEventPeriod = (
  date: string,
  time: string
): PeriodKey => {
  const dateTime = new Date(
    `${date}T${time || "00:00"}:00`
  );

  const hour = dateTime.getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 17) {
    return "afternoon";
  }

  if (hour >= 17 && hour < 19) {
    return "late_afternoon";
  }

  if (hour >= 19 && hour < 22) {
    return "evening";
  }

  return "night";
};

/* =========================================================
   WEEKEND
========================================================= */

const isWeekend = (
  dateString: string
): boolean => {
  const date = new Date(
    `${dateString}T00:00:00`
  );

  const day = date.getDay();

  return day === 0 || day === 6;
};

/* =========================================================
   EVENTS SCREEN
========================================================= */

export default function EventsScreen() {
  /* =======================================================
     STATES
  ======================================================= */

  const [
    activeCategory,
    setActiveCategory,
  ] = useState<CategoryKey>("all");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    events,
    setEvents,
  ] = useState<EventItem[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    preferences,
    setPreferences,
  ] = useState<EventPreferences>(
    DEFAULT_PREFERENCES
  );

  const [
    preferencesLoading,
    setPreferencesLoading,
  ] = useState(true);

  const [
    userLocation,
    setUserLocation,
  ] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [
    locationLoading,
    setLocationLoading,
  ] = useState(false);

  const hasNearMe = preferences.locations
  .map(normalize)
  .includes("near_me");

const shouldUseCurrentLocation = hasNearMe;


  /* =======================================================
     FETCH EVENTS
  ======================================================= */

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "https://mock.apidog.com/m1/1351051-1353850-default/SuperTounsiEvents"
        );

        if (!response.ok) {
          throw new Error(
            `Events API error: ${response.status}`
          );
        }

        const data =
          await response.json();

        const formatted: EventItem[] =
          (data.events || []).map(
            (e: any) => ({
              id: String(e.id),
              title: e.title || "",
              location: e.city || "",
              venue: e.venue || "",

              category: mapCategory(
                e.category || ""
              ),

              categoryLabel:
                e.subcategory ||
                e.category ||
                "",

              categoryColor:
                "#4F46E5",

              image:
                e.image || null,

              date:
                e.date || "",

              dateISO:
                e.date || "",

              time:
                e.time || "00:00",

              priceFrom:
                e.price !== null &&
                e.price !== undefined
                  ? Number(e.price)
                  : null,

              currency:
                e.currency || "TND",

              organizer:
                e.source || "Unknown",

              rating: 4.5,
              reviews: 120,
              attending: 50,
              capacity: 200,

              description:
                e.description || "",

              isFeatured: true,

              latitude:
                Number(e.latitude),

              longitude:
                Number(e.longitude),
            })
          );

        setEvents(formatted);
      } catch (error) {
        console.error(
          "Erreur chargement événements :",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  /* =======================================================
     FETCH USER PREFERENCES
  ======================================================= */

 useEffect(() => {
  const loadPreferences = async () => {
    try {
      setPreferencesLoading(true);

      // 1. Récupérer l'utilisateur actuellement connecté
      const currentUser = await getUser();

      console.log("CURRENT USER:", currentUser);

      if (!currentUser) {
        console.error("Aucun utilisateur connecté.");
        setPreferences(DEFAULT_PREFERENCES);
        return;
      }

      // 2. Récupérer son ID
      const userId = Number(currentUser.id);

      if (!userId || Number.isNaN(userId)) {
        console.error(
          "ID utilisateur invalide :",
          currentUser.id
        );
        setPreferences(DEFAULT_PREFERENCES);
        return;
      }

      console.log("CURRENT USER ID:", userId);

      // 3. Récupérer SES préférences depuis Spring Boot
      const data = await getUserEventPreferences(userId);

      console.log(
        "EVENT PREFERENCES FROM BACKEND:",
        data
      );

      // 4. Transformer proprement les données
      setPreferences({
        interests:
          Array.isArray(data?.interests)
            ? data.interests
            : [],

        preferredPeriods:
          Array.isArray(data?.preferredPeriods)
            ? data.preferredPeriods
            : [],

        locations:
          Array.isArray(data?.locations)
            ? data.locations
            : [],

        maxDistanceKm:
          Number(
            data?.maxDistanceKm ??
              DEFAULT_PREFERENCES.maxDistanceKm
          ),

        minBudget:
          Number(
            data?.minBudget ??
              DEFAULT_PREFERENCES.minBudget
          ),

        maxBudget:
          Number(
            data?.maxBudget ??
              DEFAULT_PREFERENCES.maxBudget
          ),

        freeOnly:
          Boolean(data?.freeOnly),

        anyBudget:
          Boolean(data?.anyBudget),
      });

    } catch (error) {
      console.error(
        "Erreur chargement préférences :",
        error
      );

      setPreferences(DEFAULT_PREFERENCES);

    } finally {
      setPreferencesLoading(false);
    }
  };

  loadPreferences();
}, []);



useEffect(() => {
  if (preferencesLoading) {
    return;
  }

  console.log("========== LOCATION DEBUG ==========");
  console.log(
    "preferences.locations:",
    preferences.locations
  );

  console.log(
    "hasNearMe:",
    hasNearMe
  );
  console.log(
    "shouldUseCurrentLocation:",
    shouldUseCurrentLocation
  );

  // Pas besoin du GPS
  if (!shouldUseCurrentLocation) {
    setUserLocation(null);
    return;
  }

  const getUserLocation = async () => {
    try {
      setLocationLoading(true);

      // 1. Demander la permission
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      console.log(
        "📍 Permission localisation:",
        status
      );

      if (status !== "granted") {
        console.log(
          "❌ Permission localisation refusée"
        );

        setUserLocation(null);
        return;
      }

      // 2. Récupérer la position
      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const {
        latitude,
        longitude,
      } = location.coords;

      console.log(
        "📍 POSITION UTILISATEUR"
      );
      console.log(
        "Latitude:",
        latitude
      );
      console.log(
        "Longitude:",
        longitude
      );

      // 3. Sauvegarder la position
      setUserLocation({
        latitude,
        longitude,
      });

    } catch (error) {
      console.error(
        "❌ Erreur récupération localisation:",
        error
      );

      setUserLocation(null);

    } finally {
      setLocationLoading(false);
    }
  };

  getUserLocation();

}, [
  preferencesLoading,
  preferences.locations,
  hasNearMe,
  shouldUseCurrentLocation,
]);

  /* =======================================================
     EVENTS AVEC DISTANCE
  ======================================================= */

  const eventsWithDistance =
    useMemo(() => {
      if (!userLocation) {
        return events.map(
          (event) => ({
            event,
            distanceKm: null as
              | number
              | null,
          })
        );
      }

      return events.map(
        (event) => {
          const validCoordinates =
            Number.isFinite(
              event.latitude
            ) &&
            Number.isFinite(
              event.longitude
            );

          if (
            !validCoordinates
          ) {
            return {
              event,
              distanceKm: null,
            };
          }

          const distanceKm =
            calculateDistanceKm(
              userLocation.latitude,
              userLocation.longitude,
              event.latitude,
              event.longitude
            );

          return {
            event,
            distanceKm,
          };
        }
      );
    }, [
      events,
      userLocation,
    ]);

  /* =======================================================
     MAIN FILTER
  ======================================================= */

  const filteredEvents =
    useMemo(() => {
      let list =
        eventsWithDistance;

      const now =
        new Date();

      /* ---------------------------------------------------
         1. EVENTS FUTURS
      --------------------------------------------------- */

      list =
        list.filter(
          ({
            event,
          }) => {
            if (!event.dateISO) {
              return false;
            }

            const eventDate =
              new Date(
                `${event.dateISO}T${
                  event.time ||
                  "00:00"
                }:00`
              );

            return (
              eventDate >= now
            );
          }
        );

      /* ---------------------------------------------------
         2. CATEGORY CHOISIE MANUELLEMENT
      --------------------------------------------------- */

      if (
        activeCategory !==
        "all"
      ) {
        list =
          list.filter(
            ({
              event,
            }) =>
              event.category ===
              activeCategory
          );
      }

      /* ---------------------------------------------------
         3. SEARCH
      --------------------------------------------------- */

      if (
        search.trim()
          .length > 0
      ) {
        const q =
          normalize(search);

        list =
          list.filter(
            ({
              event,
            }) =>
              normalize(
                event.title
              ).includes(q) ||
              normalize(
                event.location
              ).includes(q) ||
              normalize(
                event.venue
              ).includes(q) ||
              normalize(
                event.categoryLabel
              ).includes(q)
          );
      }

      /* ---------------------------------------------------
         4. INTERESTS
      --------------------------------------------------- */

      if (
        preferences.interests
          .length > 0
      ) {
        list =
          list.filter(
            ({
              event,
            }) =>
              preferences.interests.some(
                (
                  interest
                ) =>
                  interestMatchesEvent(
                    interest,
                    event
                  )
              )
          );
      }

      /* ---------------------------------------------------
         5. LOCATIONS
      --------------------------------------------------- */

      const locations =
        preferences.locations.map(
          normalize
        );

      /*
       * Si l'utilisateur a choisi "near_me",
       * la localisation actuelle est utilisée.
       */

      const hasNearMe =
        locations.includes(
          "near_me"
        );

      const hasCityFilters =
        locations.some(
          (location) =>
            location !==
            "near_me"
        );

      if (
        hasCityFilters
      ) {
        list =
          list.filter(
            ({
              event,
            }) => {
              const eventCity =
                normalize(
                  event.location
                );

              return locations
                .filter(
                  (
                    location
                  ) =>
                    location !==
                    "near_me"
                )
                .some(
                  (
                    location
                  ) =>
                    eventCity ===
                      location ||
                    eventCity.includes(
                      location
                    ) ||
                    location.includes(
                      eventCity
                    )
                );
            }
          );
      }

      /*
       * "near_me" + localisation disponible
       */

      if (
        hasNearMe &&
        userLocation
      ) {
        list =
          list.filter(
            ({
              distanceKm,
            }) =>
              distanceKm !==
                null &&
              distanceKm <=
                preferences.maxDistanceKm
          );
      }

      /* ---------------------------------------------------
         7. BUDGET
      --------------------------------------------------- */

      if (
        !preferences.anyBudget
      ) {
        if (
          preferences.freeOnly
        ) {
          list =
            list.filter(
              ({
                event,
              }) => {
                const price =
                  Number(
                    event.priceFrom ??
                      0
                  );

                return (
                  price === 0
                );
              }
            );
        } else {
          list =
            list.filter(
              ({
                event,
              }) => {
                const price =
                  Number(
                    event.priceFrom ??
                      0
                  );

                return (
                  price >=
                    preferences.minBudget &&
                  price <=
                    preferences.maxBudget
                );
              }
            );
        }
      }

      /* ---------------------------------------------------
         8. PERIODS
      --------------------------------------------------- */

      const periods =
        preferences.preferredPeriods.map(
          normalize
        );

      const hasAnyTime =
        periods.includes(
          "any_time"
        );

      if (
        periods.length > 0 &&
        !hasAnyTime
      ) {
        list =
          list.filter(
            ({
              event,
            }) => {
              const eventPeriod =
                getEventPeriod(
                  event.dateISO,
                  event.time
                );

              const periodMatch =
                periods.includes(
                  eventPeriod
                );

              const weekendMatch =
                periods.includes(
                  "weekend_only"
                )
                  ? isWeekend(
                      event.dateISO
                    )
                  : true;

              const weekdayMatch =
                periods.includes(
                  "weekdays"
                )
                  ? !isWeekend(
                      event.dateISO
                    )
                  : true;

              /*
               * Les périodes horaires
               */
              const hasTimePeriods =
                periods.some(
                  (
                    period
                  ) =>
                    [
                      "morning",
                      "afternoon",
                      "late_afternoon",
                      "evening",
                      "night",
                    ].includes(
                      period
                    )
                );

              /*
               * Si l'utilisateur a choisi
               * uniquement weekend_only / weekdays
               */
              if (
                !hasTimePeriods
              ) {
                return (
                  weekendMatch &&
                  weekdayMatch
                );
              }

              /*
               * Sinon :
               * période horaire + contraintes jours
               */
              return (
                periodMatch &&
                weekendMatch &&
                weekdayMatch
              );
            }
          );
      }

      /* ---------------------------------------------------
         9. TRI PAR DATE
      --------------------------------------------------- */

      list.sort(
        (
          a,
          b
        ) =>
          new Date(
            `${a.event.dateISO}T${
              a.event.time ||
              "00:00"
            }:00`
          ).getTime() -
          new Date(
            `${b.event.dateISO}T${
              b.event.time ||
              "00:00"
            }:00`
          ).getTime()
      );

      return list.map(
        ({
          event,
          distanceKm,
        }) => ({
          event,
          distanceKm,
        })
      );
    }, [
      eventsWithDistance,
      activeCategory,
      search,
      preferences,
      userLocation,
    ]);

  /* =======================================================
     RECOMMENDED EVENTS
  ======================================================= */

  const recommended =
    useMemo(() => {
      /*
       * On prend les événements filtrés
       * par les préférences.
       */

      return filteredEvents
        .slice(0, 4)
        .map(
          ({
            event,
          }) => event
        );
    }, [
      filteredEvents,
    ]);

  /* =======================================================
     FEATURED
  ======================================================= */

  const featured =
    useMemo(() => {
      return events
        .filter(
          (event) => {
            if (
              !event.dateISO
            ) {
              return false;
            }

            const eventDate =
              new Date(
                `${event.dateISO}T${
                  event.time ||
                  "00:00"
                }:00`
              );

            return (
              eventDate >=
              new Date()
            );
          }
        )
        .sort(
          (
            a,
            b
          ) =>
            new Date(
              `${a.dateISO}T${
                a.time ||
                "00:00"
              }:00`
            ).getTime() -
            new Date(
              `${b.dateISO}T${
                b.time ||
                "00:00"
              }:00`
            ).getTime()
        )
        .slice(0, 5);
    }, [
      events,
    ]);

  /* =======================================================
     SECTION LABEL
  ======================================================= */

  const sectionLabel =
    activeCategory ===
    "all"
      ? "Upcoming Events"
      : categories.find(
          (c) =>
            c.key ===
            activeCategory
        )?.label ??
        "Events";

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading ||
    preferencesLoading
  ) {
    return (
      <SafeAreaView
        style={
          styles.safeArea
        }
      >
        <Text
          style={{
            padding: 20,
          }}
        >
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <Header />

        <SearchBar
          value={search}
          onChangeText={
            setSearch
          }
          onPressAI={() => {
            if (
              filteredEvents.length >
              0
            ) {
              router.push(
                `/planner/${filteredEvents[0].event.id}`
              );
            }
          }}
        />

        {/* =================================================
            INFO LOCALISATION
        ================================================= */}

       {shouldUseCurrentLocation &&
         locationLoading && (
            <View
              style={
                styles.locationInfo
              }
            >
              <Text
                style={
                  styles.locationText
                }
              >
                📍 Recherche de votre
                position...
              </Text>
            </View>
          )}

       {shouldUseCurrentLocation &&
              !locationLoading &&
              !userLocation && (
            <View
              style={
                styles.locationInfo
              }
            >
              <Text
                style={
                  styles.locationText
                }
              >
                📍 Localisation
                indisponible
              </Text>
            </View>
          )}

      {shouldUseCurrentLocation &&
          userLocation &&
          !locationLoading && (
            <View
              style={
                styles.locationInfo
              }
            >
              <Text
                style={
                  styles.locationText
                }
              >
                📍 Événements à moins de{" "}
                {
                  preferences.maxDistanceKm
                }{" "}
                km
              </Text>
            </View>
          )}

        {/* =================================================
            FEATURED
        ================================================= */}

        {activeCategory ===
          "all" &&
          search.length ===
            0 && (
            <FeaturedCarousel
              events={featured}
            />
          )}

        {/* =================================================
            CATEGORIES
        ================================================= */}

        <CategoryList
          active={
            activeCategory
          }
          onChange={
            setActiveCategory
          }
        />

        {/* =================================================
            MAIN EVENTS
        ================================================= */}

        <View
          style={
            styles.section
          }
        >
          <View
            style={
              styles.sectionHeader
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              {sectionLabel}
            </Text>

            <Text
              style={
                styles.sectionCount
              }
            >
              {
                filteredEvents.length
              }{" "}
              events
            </Text>
          </View>

          {filteredEvents.length ===
          0 ? (
            <Text
              style={
                styles.emptyText
              }
            >
              Aucun événement ne
              correspond à vos
              préférences.
            </Text>
          ) : (
            filteredEvents.map(
              ({
                event,
              }) => (
                <EventCard
                  key={
                    event.id
                  }
                  event={
                    event
                  }
                />
              )
            )
          )}
        </View>

        {/* =================================================
            RECOMMENDED
        ================================================= */}

        {recommended.length >
          0 && (
          <View
            style={
              styles.section
            }
          >
            <Text
              style={
                styles.sectionTitleSmall
              }
            >
              ✨ Recommended for You
            </Text>

            <View
              style={
                styles.recommendedGrid
              }
            >
              {recommended.map(
                (
                  event
                ) => (
                  <RecommendedEventCard
                    key={
                      event.id
                    }
                    event={
                      event
                    }
                  />
                )
              )}
            </View>
          </View>
        )}

        {/* =================================================
            NEARBY
        ================================================= */}

        <NearbyEvents
          count={Math.min(
            5,
            filteredEvents.length
          )}
        />
      </ScrollView>

      {/* ===================================================
          BOTTOM NAVIGATION
      =================================================== */}

      <BottomNavigation
        active="events"
        onChange={(
          tab
        ) => {
          if (
            tab ===
            "events"
          ) {
            return;
          }

          if (
            tab ===
            "home"
          ) {
            router.push(
              "/home"
            );
          }
        }}
      />
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        Colors.background,
    },

    scroll: {
      flex: 1,
    },

    content: {
      paddingHorizontal:
        Layout.screenPadding,
      paddingTop:
        Spacing.sm,
      paddingBottom:
        Spacing.xl,
    },

    locationInfo: {
      marginVertical: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor:
        Colors.background,
    },

    locationText: {
      ...Typography.caption,
      color:
        Colors.textMuted,
    },

    section: {
      marginBottom: 24,
    },

    sectionHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginBottom: 14,
    },

    sectionTitle: {
      ...Typography.h3,
      color:
        Colors.textPrimary,
    },

    sectionTitleSmall: {
      ...Typography.h3,
      color:
        Colors.textPrimary,
    },

    sectionCount: {
      ...Typography.caption,
      color:
        Colors.brandBlue,
    },

    emptyText: {
      ...Typography.body,
      color:
        Colors.textMuted,
      textAlign:
        "center",
      paddingVertical: 24,
    },

    recommendedGrid: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      justifyContent:
        "space-between",
    },
  });