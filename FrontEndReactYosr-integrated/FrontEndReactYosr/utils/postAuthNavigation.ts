import { getUserEventPreferences } from "@/services/eventPreferenceService";
import { router } from "expo-router";


export const redirectAfterAuth = async (
  user: {
    role?: string;
    id?: number;
    userId?: number;
  }
) => {
  try {
    const role = user?.role;
    const userId = user?.id ?? user?.userId;

    console.log("REDIRECT AFTER AUTH");
    console.log("ROLE :", role);
    console.log("USER ID :", userId);

    // Seuls les CLIENTS configurent les préférences événements
    if (role === "CLIENT" && userId !== undefined) {
      try {
        const preferences = await getUserEventPreferences(userId);

        console.log(
          "EVENT PREFERENCES FROM BACKEND:",
          preferences
        );

        /*
         * Si le backend retourne des préférences,
         * l'utilisateur les a déjà configurées.
         */
        if (preferences) {
          router.replace("/(main)/home");
          return;
        }

        /*
         * Pas de préférences enregistrées
         * → parcours de configuration
         */
        router.replace({
          pathname: "/(auth)/event-preferences",
          params: {
            userId: String(userId),
          },
        });

        return;

      } catch (error: any) {
        /*
         * Si le backend répond 404, cela signifie
         * généralement qu'aucune préférence n'existe encore.
         */

        const status = error?.response?.status;

        console.log(
          "GET EVENT PREFERENCES ERROR:",
          status,
          error?.response?.data
        );

        if (status === 404) {
          router.replace({
            pathname: "/(auth)/event-preferences",
            params: {
              userId: String(userId),
            },
          });

          return;
        }

        /*
         * Pour une vraie erreur serveur/réseau,
         * on évite de bloquer complètement la connexion.
         */
        router.replace("/(main)/home");
        return;
      }
    }

    // Autres rôles
    router.replace("/(main)/home");

  } catch (error) {
    console.error(
      "Erreur redirectAfterAuth:",
      error
    );

    router.replace("/(main)/home");
  }
};