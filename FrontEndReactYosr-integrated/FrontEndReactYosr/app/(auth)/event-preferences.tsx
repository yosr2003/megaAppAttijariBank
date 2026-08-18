// app/(auth)/event-preferences.tsx

import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Colors as AuthColors } from "../../constants/Colors";
import {
  Colors as HomeColors,
  Gradients,
} from "../../constants/home/Colors";

import Logo from "../../components/Logo";
import PreferenceProgress from "../../components/PreferenceProgress";
import PreferenceOptionCard from "../../components/PreferenceOptionCard";
import BudgetRangeSelector from "../../components/BudgetRangeSelector";
import DistanceSlider from "../../components/DistanceSlider";

import {
  BUDGET_MAX_DT,
  BUDGET_MIN_DT,
  DEFAULT_EVENT_PREFERENCES,
  EventPreferences,
  MIN_INTERESTS_REQUIRED,
} from "../../types/eventPreferences";

import {
  getEventPreferenceOptions,
  getUserEventPreferences,
  saveEventPreferences,
} from "../../services/eventPreferenceService";



/* =========================================================
   TYPES
========================================================= */

interface EventPreferenceOption {
  id?: number;
  key: string;
  label: string;
  icon?: string;
}

/* =========================================================
   CONSTANTS
========================================================= */

const TOTAL_STEPS = 5;

const STEP_META: Record<
  number,
  {
    title: string;
    subtitle: string;
    kicker?: string;
  }
> = {
  1: {
    kicker: "Personnalisons ton expérience ✨",
    title: "Qu'est-ce qui t'intéresse ?",
    subtitle:
      "Sélectionne les catégories d'événements que tu aimerais découvrir.",
  },

  2: {
    title: "Quand aimes-tu sortir ? 🗓️",
    subtitle:
      "On te montrera davantage d'événements pendant tes moments préférés.",
  },

  3: {
    title: "Où veux-tu découvrir des événements ? 📍",
    subtitle: "Choisis les endroits qui t'intéressent.",
  },

  4: {
    title: "Quel budget te convient ? 💳",
    subtitle:
      "On évitera de te proposer des événements hors de ton budget.",
  },

  5: {
    title: "C'est tout bon ! 🎉",
    subtitle:
      "SuperTounsi est maintenant prêt à te proposer des événements qui te ressemblent.",
  },
};

/* =========================================================
   SCREEN
========================================================= */

export default function EventPreferencesScreen() {
  const params = useLocalSearchParams<{
    userId?: string;
  }>();

  /* -------------------------
     STEP
  ------------------------- */

  const [step, setStep] = useState(1);

  /* -------------------------
     USER PREFERENCES
  ------------------------- */

  const [prefs, setPrefs] = useState<EventPreferences>(
    DEFAULT_EVENT_PREFERENCES
  );

  /* -------------------------
     OPTIONS FROM DATABASE
  ------------------------- */

  const [interestOptions, setInterestOptions] = useState<
    EventPreferenceOption[]
  >([]);

  const [periodOptions, setPeriodOptions] = useState<
    EventPreferenceOption[]
  >([]);

  const [locationOptions, setLocationOptions] = useState<
    EventPreferenceOption[]
  >([]);

  /* -------------------------
     LOADING STATES
  ------------------------- */

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingUserPreferences, setLoadingUserPreferences] =
    useState(false);

  const [savingPreferences, setSavingPreferences] =
    useState(false);

  /* -------------------------
     ANIMATIONS
  ------------------------- */

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const slideAnim = useRef(new Animated.Value(0)).current;

  /* =========================================================
     LOAD OPTIONS FROM DATABASE
  ========================================================= */

  useEffect(() => {
    const loadPreferenceOptions = async () => {
      try {
        setLoadingOptions(true);

        console.log(
          "=========================================="
        );
        console.log(
          "GET EVENT PREFERENCE OPTIONS"
        );
        console.log(
          "=========================================="
        );

        const data = await getEventPreferenceOptions();

        console.log(
          "EVENT PREFERENCE OPTIONS FROM DATABASE:",
          data
        );

        /*
         * Backend attendu :
         *
         * {
         *   interests: [...],
         *   periods: [...],
         *   locations: [...]
         * }
         */

        setInterestOptions(
          Array.isArray(data?.interests)
            ? data.interests
            : []
        );

        setPeriodOptions(
          Array.isArray(data?.periods)
            ? data.periods
            : []
        );

        setLocationOptions(
          Array.isArray(data?.locations)
            ? data.locations
            : []
        );
      } catch (error: any) {
        console.error(
          "ERREUR récupération options événements:",
          error?.response?.data ||
            error?.message ||
            error
        );

        setInterestOptions([]);
        setPeriodOptions([]);
        setLocationOptions([]);
      } finally {
        setLoadingOptions(false);
      }
    };

    loadPreferenceOptions();
  }, []);

  /* =========================================================
     LOAD USER PREFERENCES FROM DATABASE
  ========================================================= */

  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!params.userId) {
        console.warn(
          "Aucun userId reçu pour les préférences."
        );
        return;
      }

      const userId = Number(params.userId);

      if (Number.isNaN(userId)) {
        console.error(
          "userId invalide:",
          params.userId
        );
        return;
      }

      try {
        setLoadingUserPreferences(true);

        console.log(
          "=========================================="
        );
        console.log(
          "GET USER EVENT PREFERENCES"
        );
        console.log(
          "USER ID:",
          userId
        );
        console.log(
          "=========================================="
        );

        const data =
          await getUserEventPreferences(userId);

        console.log(
          "USER EVENT PREFERENCES FROM DATABASE:",
          data
        );

        setPrefs({
          interests: Array.isArray(data?.interests)
            ? data.interests
            : [],

          preferredPeriods: Array.isArray(
            data?.preferredPeriods
          )
            ? data.preferredPeriods
            : [],

          locations: Array.isArray(
            data?.locations
          )
            ? data.locations
            : [],

          maxDistanceKm:
            data?.maxDistanceKm ?? 25,

          minBudget:
            data?.minBudget ?? BUDGET_MIN_DT,

          maxBudget:
            data?.maxBudget ?? BUDGET_MAX_DT,

          freeOnly:
            data?.freeOnly ?? false,

          anyBudget:
            data?.anyBudget ?? false,
          useCurrentLocation: data?.useCurrentLocation ?? false,
        });
     } catch (error: any) {
  const status = error?.response?.status;
  if (status === 404) {
    console.log(
      "Aucune préférence événement trouvée. Utilisation des valeurs par défaut."
    );

    setPrefs(DEFAULT_EVENT_PREFERENCES);
  } else {
    console.error(
      "ERREUR récupération préférences utilisateur:",
      error?.response?.data ||
        error?.message ||
        error
    );
  }
} finally {
        setLoadingUserPreferences(false);
      }
    };

    loadUserPreferences();
  }, [params.userId]);

  /* =========================================================
     STEP ANIMATION
  ========================================================= */

  const animateStepChange = (
    direction: 1 | -1,
    apply: () => void
  ) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: -18 * direction,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      apply();

      slideAnim.setValue(18 * direction);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),

        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  /* =========================================================
     NEXT / BACK
  ========================================================= */

  const goNext = () => {
    if (step < TOTAL_STEPS) {
      animateStepChange(1, () => {
        setStep((current) => current + 1);
      });
    }
  };

  const goBack = () => {
    if (step > 1) {
      animateStepChange(-1, () => {
        setStep((current) => current - 1);
      });
    }
  };

  /* =========================================================
     GENERIC TOGGLE
  ========================================================= */

  const toggleInArray = (
    list: string[],
    key: string
  ): string[] => {
    if (list.includes(key)) {
      return list.filter(
        (item) => item !== key
      );
    }

    return [...list, key];
  };

  /* =========================================================
     INTERESTS
  ========================================================= */

  const toggleInterest = (key: string) => {
    setPrefs((previous) => ({
      ...previous,

      interests: toggleInArray(
        previous.interests,
        key
      ),
    }));
  };

  /* =========================================================
     PERIODS
  ========================================================= */

  const togglePeriod = (key: string) => {
    setPrefs((previous) => ({
      ...previous,

      preferredPeriods: toggleInArray(
        previous.preferredPeriods,
        key
      ),
    }));
  };

  /* =========================================================
     LOCATIONS
  ========================================================= */

  const toggleLocation = (key: string) => {
    setPrefs((previous) => ({
      ...previous,

      locations: toggleInArray(
        previous.locations,
        key
      ),
    }));
  };

  /* =========================================================
     DISTANCE
  ========================================================= */

  const setDistance = (km: number) => {
    setPrefs((previous) => ({
      ...previous,
      maxDistanceKm: km,
    }));
  };

  /* =========================================================
     BUDGET RANGE
  ========================================================= */

  const setBudgetRange = (
    min: number,
    max: number
  ) => {
    setPrefs((previous) => ({
      ...previous,

      minBudget: min,
      maxBudget: max,

      freeOnly: false,
      anyBudget: false,
    }));
  };

  /* =========================================================
     FREE ONLY
  ========================================================= */

  const toggleFreeOnly = () => {
    setPrefs((previous) => {
      const nextFreeOnly =
        !previous.freeOnly;

      return {
        ...previous,

        freeOnly: nextFreeOnly,

        anyBudget: nextFreeOnly
          ? false
          : previous.anyBudget,

        minBudget: nextFreeOnly
          ? 0
          : previous.minBudget,

        maxBudget: nextFreeOnly
          ? 0
          : previous.maxBudget,
      };
    });
  };

  /* =========================================================
     ANY BUDGET
  ========================================================= */

  const toggleAnyBudget = () => {
    setPrefs((previous) => {
      const nextAnyBudget =
        !previous.anyBudget;

      return {
        ...previous,

        anyBudget: nextAnyBudget,

        freeOnly: nextAnyBudget
          ? false
          : previous.freeOnly,
      };
    });
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const isStepValid = (): boolean => {
    switch (step) {
      case 1:
        return (
          prefs.interests.length >=
          MIN_INTERESTS_REQUIRED
        );

      case 2:
        return (
          prefs.preferredPeriods.length >= 1
        );

      case 3:
        return prefs.locations.length >= 1;

      case 4:
        return true;

      case 5:
        return true;

      default:
        return false;
    }
  };

  /* =========================================================
     SAVE
  ========================================================= */

const handleFinish = async () => {
  if (!params.userId) {
    console.error("USER ID manquant.");
    return;
  }

  const userId = Number(params.userId);

  if (Number.isNaN(userId)) {
    console.error(
      "USER ID invalide:",
      params.userId
    );
    return;
  }

  try {
    setSavingPreferences(true);

    const payload = {
      userId,

      interests: prefs.interests,

      preferredPeriods:
        prefs.preferredPeriods,

      locations: prefs.locations,

      maxDistanceKm:
        prefs.maxDistanceKm,

      minBudget:
        prefs.minBudget,

      maxBudget:
        prefs.maxBudget,

      freeOnly:
        prefs.freeOnly,

      anyBudget:
        prefs.anyBudget,

      useCurrentLocation:
        prefs.useCurrentLocation,
    };

    console.log(
      "=========================================="
    );

    console.log(
      "SAVING EVENT PREFERENCES"
    );

    console.log(
      "PAYLOAD:",
      payload
    );

    console.log(
      "=========================================="
    );

    await saveEventPreferences(payload);

    console.log(
      "EVENT PREFERENCES SAVED SUCCESSFULLY"
    );

    // Pas de AsyncStorage
    // Pas de markEventPreferencesCompleted
    //
    // Le backend contient maintenant les préférences.
    // Au prochain login, redirectAfterAuth() les détectera.

    router.replace("/(main)/home");

  } catch (error: any) {
    console.error(
      "ERREUR sauvegarde préférences utilisateur:",
      error?.response?.data ||
        error?.message ||
        error
    );
  } finally {
    setSavingPreferences(false);
  }
};

  /* =========================================================
     SKIP
  ========================================================= */

const handleSkip = () => {
  console.log("EVENT PREFERENCES: skipped");

  router.replace("/(main)/home");
};

  /* =========================================================
     META
  ========================================================= */

  const meta = STEP_META[step];

  /* =========================================================
     LOADING
  ========================================================= */

  const isLoading =
    loadingOptions ||
    loadingUserPreferences;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mainContent}>
            {/* HEADER */}

            <View style={styles.headerRow}>
              {step > 1 ? (
                <TouchableOpacity
                  onPress={goBack}
                  hitSlop={10}
                  style={styles.backButton}
                >
                  <Feather
                    name="arrow-left"
                    size={20}
                    color={
                      AuthColors.textSecondary
                    }
                  />
                </TouchableOpacity>
              ) : (
                <View
                  style={styles.backButton}
                />
              )}

              <Logo />

              {step < TOTAL_STEPS ? (
                <TouchableOpacity
                  onPress={handleSkip}
                  hitSlop={10}
                >
                  <Text
                    style={styles.skipText}
                  >
                    Passer
                  </Text>
                </TouchableOpacity>
              ) : (
                <View
                  style={styles.backButton}
                />
              )}
            </View>

            {/* PROGRESS */}

            <PreferenceProgress
              currentStep={step}
              totalSteps={TOTAL_STEPS}
            />

            {/* BODY */}

            <Animated.View
              style={[
                styles.stepBody,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateX:
                        slideAnim,
                    },
                  ],
                },
              ]}
            >
              {isLoading ? (
                <View
                  style={
                    styles.loadingContainer
                  }
                >
                  <ActivityIndicator
                    size="large"
                    color={
                      HomeColors.brandPurple
                    }
                  />

                  <Text
                    style={
                      styles.loadingText
                    }
                  >
                    Chargement des préférences...
                  </Text>
                </View>
              ) : (
                <>
                  {/* KICKER */}

                  {step === 1 &&
                    meta.kicker && (
                      <Text
                        style={styles.kicker}
                      >
                        {meta.kicker}
                      </Text>
                    )}

                  {/* TITLE */}

                  <Text
                    style={styles.title}
                  >
                    {meta.title}
                  </Text>

                  {/* SUBTITLE */}

                  <Text
                    style={
                      styles.subtitle
                    }
                  >
                    {meta.subtitle}
                  </Text>

                  {/* STEP 1 */}

                  {step === 1 && (
                    <StepInterests
                      selected={
                        prefs.interests
                      }
                      onToggle={
                        toggleInterest
                      }
                      options={
                        interestOptions
                      }
                    />
                  )}

                  {/* STEP 2 */}

                  {step === 2 && (
                    <StepPeriods
                      selected={
                        prefs.preferredPeriods
                      }
                      onToggle={
                        togglePeriod
                      }
                      options={
                        periodOptions
                      }
                    />
                  )}

                  {/* STEP 3 */}

                  {step === 3 && (
                    <StepLocations
                      selected={
                        prefs.locations
                      }
                      onToggle={
                        toggleLocation
                      }
                      distanceKm={
                        prefs.maxDistanceKm ??
                        25
                      }
                      onDistanceChange={
                        setDistance
                      }
                      options={
                        locationOptions
                      }
                    />
                  )}

                  {/* STEP 4 */}

                  {step === 4 && (
                    <StepBudget
                      prefs={prefs}
                      onRangeChange={
                        setBudgetRange
                      }
                      onToggleFree={
                        toggleFreeOnly
                      }
                      onToggleAny={
                        toggleAnyBudget
                      }
                    />
                  )}

                  {/* STEP 5 */}

                  {step === 5 && (
                    <StepSummary
                      prefs={prefs}
                      interestOptions={
                        interestOptions
                      }
                      periodOptions={
                        periodOptions
                      }
                      locationOptions={
                        locationOptions
                      }
                    />
                  )}
                </>
              )}
            </Animated.View>
          </View>
        </ScrollView>

        {/* FOOTER */}

        <View style={styles.footer}>
          {step === 1 && (
            <Text
              style={
                styles.helperText
              }
            >
              Choisis au moins{" "}
              {MIN_INTERESTS_REQUIRED}{" "}
              centres d'intérêt
            </Text>
          )}

          <TouchableOpacity
            activeOpacity={
              isStepValid() ? 0.9 : 1
            }
            disabled={
              !isStepValid() ||
              isLoading ||
              savingPreferences
            }
            onPress={
              step === TOTAL_STEPS
                ? handleFinish
                : goNext
            }
          >
            {isStepValid() ? (
              <LinearGradient
                colors={
                  Gradients.ai as unknown as [
                    string,
                    string,
                    ...string[]
                  ]
                }
                start={{
                  x: 0,
                  y: 0,
                }}
                end={{
                  x: 1,
                  y: 0,
                }}
                style={
                  styles.ctaButton
                }
              >
                {savingPreferences ? (
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                  />
                ) : (
                  <>
                    <Text
                      style={
                        styles.ctaText
                      }
                    >
                      {step ===
                      TOTAL_STEPS
                        ? "Découvrir mes événements ✨"
                        : "Continuer"}
                    </Text>

                    <Feather
                      name="arrow-right"
                      size={16}
                      color="#fff"
                      style={{
                        marginLeft: 8,
                      }}
                    />
                  </>
                )}
              </LinearGradient>
            ) : (
              <View
                style={[
                  styles.ctaButton,
                  styles.ctaButtonDisabled,
                ]}
              >
                <Text
                  style={
                    styles.ctaTextDisabled
                  }
                >
                  Continuer
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

/* =========================================================
   STEP 1 — INTERESTS
========================================================= */

function StepInterests({
  selected,
  onToggle,
  options,
}: {
  selected: string[];
  onToggle: (key: string) => void;
  options: EventPreferenceOption[];
}) {
  return (
    <View style={styles.interestsGrid}>
      {options.map((option) => {
        const isSelected =
          selected.includes(
            option.key
          );

        return (
          <TouchableOpacity
            key={
              option.id ??
              option.key
            }
            activeOpacity={0.85}
            onPress={() =>
              onToggle(option.key)
            }
            style={[
              styles.interestCard,
              isSelected &&
                styles.interestCardSelected,
            ]}
          >
            <View
              style={[
                styles.interestIconContainer,
                isSelected &&
                  styles.interestIconContainerSelected,
              ]}
            >
              <Ionicons
                name={
                  (option.icon ||
                    "sparkles") as keyof typeof Ionicons.glyphMap
                }
                size={25}
                color={
                  isSelected
                    ? "#FFFFFF"
                    : HomeColors.brandPurple
                }
              />
            </View>

            <Text
              style={[
                styles.interestLabel,
                isSelected &&
                  styles.interestLabelSelected,
              ]}
            >
              {option.label}
            </Text>

            {isSelected && (
              <View
                style={
                  styles.selectedCheck
                }
              >
                <Ionicons
                  name="checkmark"
                  size={13}
                  color="#FFFFFF"
                />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/* =========================================================
   STEP 2 — PERIODS
========================================================= */

function StepPeriods({
  selected,
  onToggle,
  options,
}: {
  selected: string[];
  onToggle: (key: string) => void;
  options: EventPreferenceOption[];
}) {
  return (
    <View style={styles.chipWrap}>
      {options.map((option) => (
        <PreferenceOptionCard
          key={
            option.id ??
            option.key
          }
          variant="chip"
          label={option.label}
          icon={
            (option.icon ||
              "time-outline") as keyof typeof Ionicons.glyphMap
          }
          selected={selected.includes(
            option.key
          )}
          onPress={() =>
            onToggle(option.key)
          }
        />
      ))}
    </View>
  );
}

/* =========================================================
   STEP 3 — LOCATIONS
========================================================= */

function StepLocations({
  selected,
  onToggle,
  distanceKm,
  onDistanceChange,
  options,
}: {
  selected: string[];
  onToggle: (key: string) => void;
  distanceKm: number;
  onDistanceChange: (km: number) => void;
  options: EventPreferenceOption[];
}) {
  return (
    <View>
      <View style={styles.chipWrap}>
        {options.map((option) => (
          <PreferenceOptionCard
            key={
              option.id ??
              option.key
            }
            variant="chip"
            label={option.label}
            icon={
              (option.icon ||
                "location-outline") as keyof typeof Ionicons.glyphMap
            }
            selected={selected.includes(
              option.key
            )}
            onPress={() =>
              onToggle(option.key)
            }
          />
        ))}
      </View>

      {/* DISTANCE */}

      <View
        style={styles.distanceSection}
      >
        <Text
          style={
            styles.sectionLabel
          }
        >
          Distance maximale
        </Text>

        <DistanceSlider
          valueKm={distanceKm}
          onChangeKm={
            onDistanceChange
          }
        />
      </View>
    </View>
  );
}

/* =========================================================
   STEP 4 — BUDGET
========================================================= */

function StepBudget({
  prefs,
  onRangeChange,
  onToggleFree,
  onToggleAny,
}: {
  prefs: EventPreferences;
  onRangeChange: (
    min: number,
    max: number
  ) => void;
  onToggleFree: () => void;
  onToggleAny: () => void;
}) {
  return (
    <View>
      <BudgetRangeSelector
        min={prefs.minBudget}
        max={prefs.maxBudget}
        minBound={BUDGET_MIN_DT}
        maxBound={BUDGET_MAX_DT}
        step={10}
        disabled={
          prefs.freeOnly ||
          prefs.anyBudget
        }
        onChange={onRangeChange}
      />

      <View
        style={[
          styles.chipWrap,
          styles.sectionSpacer,
        ]}
      >
        <PreferenceOptionCard
          variant="chip"
          label="Gratuit uniquement"
          icon="gift-outline"
          selected={
            prefs.freeOnly
          }
          onPress={
            onToggleFree
          }
        />

        <PreferenceOptionCard
          variant="chip"
          label="Peu importe"
          icon="infinite-outline"
          selected={
            prefs.anyBudget
          }
          onPress={
            onToggleAny
          }
        />
      </View>
    </View>
  );
}

/* =========================================================
   STEP 5 — SUMMARY
========================================================= */

function StepSummary({
  prefs,
  interestOptions,
  periodOptions,
  locationOptions,
}: {
  prefs: EventPreferences;
  interestOptions: EventPreferenceOption[];
  periodOptions: EventPreferenceOption[];
  locationOptions: EventPreferenceOption[];
}) {
  const interestLabels =
    interestOptions
      .filter((option) =>
        prefs.interests.includes(
          option.key
        )
      )
      .map(
        (option) => option.label
      );

  const periodLabels =
    periodOptions
      .filter((option) =>
        prefs.preferredPeriods.includes(
          option.key
        )
      )
      .map(
        (option) => option.label
      );

  const locationLabels =
    locationOptions
      .filter((option) =>
        prefs.locations.includes(
          option.key
        )
      )
      .map(
        (option) => option.label
      );

  const budgetLabel =
    prefs.freeOnly
      ? "Gratuit uniquement"
      : prefs.anyBudget
      ? "Peu importe"
      : `${prefs.minBudget} DT — ${prefs.maxBudget} DT`;

  return (
    <View>
      <SummaryBlock
        icon="sparkles"
        title="Tes centres d'intérêt"
        value={interestLabels.join(
          " · "
        )}
      />

      <SummaryBlock
        icon="time-outline"
        title="Tes moments préférés"
        value={periodLabels.join(
          " · "
        )}
      />

      <SummaryBlock
        icon="location-outline"
        title="Tes destinations"
        value={locationLabels.join(
          " · "
        )}
      />

      <SummaryBlock
        icon="wallet-outline"
        title="Ton budget"
        value={budgetLabel}
      />

      <SummaryBlock
        icon="navigate-outline"
        title="Distance maximale"
        value={`${prefs.maxDistanceKm ?? 25} km`}
      />
    </View>
  );
}

/* =========================================================
   SUMMARY BLOCK
========================================================= */

function SummaryBlock({
  icon,
  title,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
}) {
  return (
    <View
      style={styles.summaryCard}
    >
      <View
        style={
          styles.summaryIconCircle
        }
      >
        <Ionicons
          name={icon}
          size={18}
          color={
            HomeColors.brandPurple
          }
        />
      </View>

      <View
        style={{ flex: 1 }}
      >
        <Text
          style={
            styles.summaryTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.summaryValue
          }
        >
          {value || "—"}
        </Text>
      </View>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      AuthColors.background,
  },

  safeArea: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,

    paddingTop:
      Platform.OS === "android"
        ? (RNStatusBar.currentHeight ??
            0) +
          8
        : 8,

    paddingBottom: 140,
  },

  mainContent: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },

  /* HEADER */

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent:
      "center",
  },

  skipText: {
    fontSize: 13,
    fontWeight: "600",
    color:
      AuthColors.textSecondary,
  },

  /* BODY */

  stepBody: {
    marginTop: 12,
  },

  kicker: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    color:
      HomeColors.brandPurple,
    textTransform:
      "uppercase",
    marginBottom: 6,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color:
      AuthColors.textPrimary,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 13,
    color:
      AuthColors.textSecondary,
    lineHeight: 19,
    marginBottom: 22,
  },

  /* LOADING */

  loadingContainer: {
    minHeight: 300,
    alignItems: "center",
    justifyContent:
      "center",
  },

  loadingText: {
    marginTop: 15,
    fontSize: 13,
    color:
      AuthColors.textSecondary,
  },

  /* INTERESTS */

  interestsGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent:
      "space-between",
    rowGap: 14,
  },

  interestCard: {
    width: "48%",
    minHeight: 125,
    borderRadius: 22,

    backgroundColor:
      AuthColors.cardBg,

    borderWidth: 1,
    borderColor:
      AuthColors.cardBorder,

    paddingVertical: 18,
    paddingHorizontal: 14,

    alignItems: "center",
    justifyContent:
      "center",

    position: "relative",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.08,
    shadowRadius: 10,

    elevation: 3,
  },

  interestCardSelected: {
    backgroundColor:
      "rgba(139, 92, 246, 0.12)",

    borderWidth: 1.5,

    borderColor:
      HomeColors.brandPurple,

    shadowColor:
      HomeColors.brandPurple,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.18,
    shadowRadius: 12,

    elevation: 5,
  },

  interestIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,

    alignItems: "center",
    justifyContent:
      "center",

    backgroundColor:
      "rgba(139, 92, 246, 0.10)",

    marginBottom: 11,
  },

  interestIconContainerSelected: {
    backgroundColor:
      HomeColors.brandPurple,
  },

  interestLabel: {
    fontSize: 14,
    fontWeight: "700",
    color:
      AuthColors.textPrimary,
    textAlign: "center",
  },

  interestLabelSelected: {
    color:
      HomeColors.brandPurple,
  },

  selectedCheck: {
    position: "absolute",

    top: 10,
    right: 10,

    width: 23,
    height: 23,

    borderRadius: 12,

    backgroundColor:
      HomeColors.brandPurple,

    alignItems: "center",
    justifyContent:
      "center",
  },

  /* CHIPS */

  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent:
      "flex-start",
    gap: 10,
  },

  /* DISTANCE */

  distanceSection: {
    marginTop: 28,
  },

  /* BUDGET */

  sectionSpacer: {
    marginTop: 26,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color:
      AuthColors.textSecondary,
    marginBottom: 14,
  },

  /* SUMMARY */

  summaryCard: {
    flexDirection: "row",
    alignItems:
      "flex-start",

    gap: 12,

    backgroundColor:
      AuthColors.cardBg,

    borderWidth: 1,
    borderColor:
      AuthColors.cardBorder,

    borderRadius: 18,

    padding: 14,

    marginBottom: 12,
  },

  summaryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,

    backgroundColor:
      "rgba(139, 92, 246, 0.15)",

    alignItems: "center",
    justifyContent:
      "center",
  },

  summaryTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,

    color:
      AuthColors.textSecondary,

    marginBottom: 4,

    textTransform:
      "uppercase",
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: "600",

    color:
      AuthColors.textPrimary,

    lineHeight: 20,
  },

  /* FOOTER */

  footer: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    paddingHorizontal: 20,
    paddingTop: 12,

    paddingBottom:
      Platform.OS === "ios"
        ? 28
        : 18,

    backgroundColor:
      AuthColors.background,

    borderTopWidth: 1,

    borderTopColor:
      AuthColors.cardBorder,
  },

  helperText: {
    fontSize: 12,

    color:
      AuthColors.textMuted,

    textAlign: "center",

    marginBottom: 10,
  },

  ctaButton: {
    height: 54,

    borderRadius: 16,

    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "center",

    shadowColor:
      HomeColors.brandPurple,

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.35,

    shadowRadius: 12,

    elevation: 6,
  },

  ctaButtonDisabled: {
    backgroundColor:
      "rgba(28, 46, 86, 0.2)",

    borderWidth: 1.5,

    borderColor:
      AuthColors.inputBorder,

    shadowOpacity: 0,

    elevation: 0,
  },

  ctaText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  ctaTextDisabled: {
    fontSize: 16,
    fontWeight: "700",
    color:
      AuthColors.textMuted,
  },
});