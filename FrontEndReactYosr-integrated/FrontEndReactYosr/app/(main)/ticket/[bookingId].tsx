import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import TicketStub from "../../../components/payment/TicketStub";
import PrimaryButton from "../../../components/PrimaryButton";

import { Colors } from "../../../constants/home/Colors";
import { Spacing } from "../../../constants/home/Layout";
import { Typography } from "../../../constants/home/Typography";

export default function TicketScreen() {
  const params = useLocalSearchParams<{
    bookingId: string;
    eventTitle?: string;
    eventDate?: string;
    eventTime?: string;
    venue?: string;
    amount?: string;
    currency?: string;
    transactionId?: string;
  }>();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.replace("/(main)/home")}>
          <Ionicons name="close" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon billet</Text>
        <View style={styles.closeButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TicketStub
          eventTitle={params.eventTitle ?? "Événement"}
          eventDate={params.eventDate ?? ""}
          eventTime={params.eventTime ?? ""}
          venue={params.venue ?? ""}
          amount={Number(params.amount ?? 0)}
          currency={params.currency ?? "TND"}
          bookingId={params.bookingId ?? "—"}
          transactionId={params.transactionId ?? "—"}
        />
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Retour à l’accueil" onPress={() => router.replace("/(main)/home")} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  closeButton: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  headerTitle: { ...Typography.h3, color: Colors.textPrimary },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xxl },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    backgroundColor: Colors.backgroundAlt,
  },
});