import { PrimaryButton, Screen } from "@/src/components/ui";
import { useTheme } from "@/src/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function OrderSuccessScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.content}>
          <View
            style={[
              styles.successIconContainer,
              { backgroundColor: `${theme.colors.success}20` },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={100}
              color={theme.colors.success}
            />
          </View>

          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Commande confirmée ! 🎉
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            Votre commande a été acceptée et est en cours de préparation.
          </Text>

          <View
            style={[
              styles.orderInfo,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.infoRow}>
              <Ionicons
                name="receipt-outline"
                size={24}
                color={theme.colors.primary}
              />
              <View style={styles.infoTextContainer}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Numéro de commande
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  #SD-2025-00123
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="time-outline"
                size={24}
                color={theme.colors.primary}
              />
              <View style={styles.infoTextContainer}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Heure de livraison estimée
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  20:30 - 21:00
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="location-outline"
                size={24}
                color={theme.colors.primary}
              />
              <View style={styles.infoTextContainer}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Adresse de livraison
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Rue de la Liberté, La Marsa
                </Text>
              </View>
            </View>
          </View>

          <PrimaryButton
            title="Suivre ma commande"
            onPress={() => router.replace("/(tabs)" as any)}
            style={{ marginBottom: 16 }}
            size="large"
          />

          <Pressable
            style={styles.homeButton}
            onPress={() => router.replace("/food-delivery" as any)}
          >
            <Text
              style={[styles.homeButtonText, { color: theme.colors.primary }]}
            >
              Retour à l'accueil
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  content: {
    padding: 32,
    alignItems: "center",
  },
  successIconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  orderInfo: {
    width: "100%",
    padding: 24,
    borderRadius: 20,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  homeButton: {
    width: "100%",
    paddingVertical: 16,
  },
  homeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});
