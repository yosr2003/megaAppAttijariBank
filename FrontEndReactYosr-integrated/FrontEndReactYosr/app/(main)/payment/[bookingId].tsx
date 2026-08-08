import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import BankAccountCard from "../../../components/payment/BankAccountCard";
import TransferSummaryCard from "../../../components/payment/TransferSummaryCard";
import PaymentConfirmationSheet from "../../../components/payment/PaymentConfirmationSheet";
import PaymentStatusOverlay, { PaymentOverlayStatus } from "../../../components/payment/PaymentStatusOverlay";
import PrimaryButton from "../../../components/PrimaryButton";

import { Colors } from "../../../constants/home/Colors";
import { Radius, Spacing } from "../../../constants/home/Layout";
import { Typography } from "../../../constants/home/Typography";

// TODO(backend): remplacer par un GET /accounts/me réel une fois l'endpoint Spring Boot branché.
const CLIENT_ACCOUNT = {
  owner: "Titulaire du compte",
  rib: "TN591234567890",
  balance: 350,
  currency: "TND",
  status: "ACTIVE" as const,
};

// TODO(backend): remplacer par le compte agence renvoyé par la Mock Bank API.
const AGENCY_ACCOUNT = {
  owner: "SuperTounsi Events",
  rib: "TN127654321000",
  balance: 2500,
  currency: "TND",
  status: "ACTIVE" as const,
};

export default function PaymentScreen() {
  const params = useLocalSearchParams<{
    bookingId: string;
    eventId?: string;
    eventTitle?: string;
    eventDate?: string;
    eventTime?: string;
    venue?: string;
    amount?: string;
    currency?: string;
  }>();

  const bookingId = params.bookingId ?? "—";
  const eventTitle = params.eventTitle ?? "Événement";
  const currency = params.currency ?? CLIENT_ACCOUNT.currency;
  const amount = Number(params.amount ?? 0);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayStatus, setOverlayStatus] = useState<PaymentOverlayStatus>("processing");
  const [transactionId, setTransactionId] = useState<string>("");

  const runPayment = () => {
    setSheetVisible(false);
    setOverlayVisible(true);
    setOverlayStatus("processing");

    // TODO(backend): remplacer cette simulation par un vrai POST /payments
    // vers Spring Boot, qui appelle ensuite la Mock Bank API et confirme le booking.
    setTimeout(() => {
      if (CLIENT_ACCOUNT.balance >= amount) {
        setTransactionId(`TXN-${Date.now().toString().slice(-8)}`);
        setOverlayStatus("success");
      } else {
        setOverlayStatus("failed");
      }
    }, 2600);
  };

  const handleViewTicket = () => {
    setOverlayVisible(false);
    router.replace({
      pathname: "/(main)/ticket/[bookingId]",
      params: {
        bookingId,
        eventTitle,
        eventDate: params.eventDate ?? "",
        eventTime: params.eventTime ?? "",
        venue: params.venue ?? "",
        amount: String(amount),
        currency,
        transactionId,
      },
    });
  };

  const handleDone = () => {
    setOverlayVisible(false);
    router.replace("/(main)/home");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <BankAccountCard
          owner={CLIENT_ACCOUNT.owner}
          rib={CLIENT_ACCOUNT.rib}
          balance={CLIENT_ACCOUNT.balance}
          currency={CLIENT_ACCOUNT.currency}
          status={CLIENT_ACCOUNT.status}
          variant="client"
        />

        <View style={{ height: Spacing.lg }} />

        <TransferSummaryCard
          fromRib={CLIENT_ACCOUNT.rib}
          toRib={AGENCY_ACCOUNT.rib}
          amount={amount}
          currency={currency}
          eventTitle={eventTitle}
          bookingId={bookingId}
        />

        <View style={styles.noticeRow}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.noticeText}>
            Paiement simulé via la Mock Bank API. Aucun virement réel ne sera effectué.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={`Payer ${amount.toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} ${currency}`}
          onPress={() => setSheetVisible(true)}
        />
      </View>

      <PaymentConfirmationSheet
        visible={sheetVisible}
        amount={amount}
        currency={currency}
        toLabel={AGENCY_ACCOUNT.owner}
        onCancel={() => setSheetVisible(false)}
        onConfirm={runPayment}
      />

      <PaymentStatusOverlay
        visible={overlayVisible}
        status={overlayStatus}
        amount={amount}
        currency={currency}
        errorMessage={
          overlayStatus === "failed"
            ? `Solde insuffisant sur le compte •••• ${CLIENT_ACCOUNT.rib.slice(-4)}. Le virement a été refusé par la Mock Bank API.`
            : undefined
        }
        onViewTicket={handleViewTicket}
        onDone={handleDone}
        onRetry={runPayment}
        onCancel={() => setOverlayVisible(false)}
      />
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
  backButton: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  headerTitle: { ...Typography.h3, color: Colors.textPrimary },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  noticeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "flex-start",
    marginTop: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  noticeText: { ...Typography.caption, color: Colors.textMuted, flex: 1 },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    backgroundColor: Colors.backgroundAlt,
  },
});