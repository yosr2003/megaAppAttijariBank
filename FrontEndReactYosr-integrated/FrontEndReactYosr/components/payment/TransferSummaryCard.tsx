import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/home/Colors";
import { Radius, Spacing } from "../../constants/home/Layout";
import { Typography } from "../../constants/home/Typography";

interface TransferSummaryCardProps {
  fromRib: string;
  toRib: string;
  amount: number;
  currency?: string;
  eventTitle: string;
  bookingId: string;
}

function maskRib(rib: string) {
  const clean = rib.replace(/\s/g, "");
  return `•••• ${clean.slice(-4)}`;
}

export default function TransferSummaryCard({
  fromRib,
  toRib,
  amount,
  currency = "TND",
  eventTitle,
  bookingId,
}: TransferSummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Résumé du virement</Text>

      <View style={styles.pathRow}>
        <View style={styles.pathNode}>
          <View style={styles.pathIconCircle}>
            <Ionicons name="person-outline" size={16} color={Colors.brandBlue} />
          </View>
          <Text style={styles.pathLabel}>Vous</Text>
          <Text style={styles.pathRib}>{maskRib(fromRib)}</Text>
        </View>

        <View style={styles.pathArrow}>
          <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
        </View>

        <View style={styles.pathNode}>
          <View style={[styles.pathIconCircle, styles.pathIconAgency]}>
            <Ionicons name="business-outline" size={16} color={Colors.brandPurple} />
          </View>
          <Text style={styles.pathLabel}>Agence</Text>
          <Text style={styles.pathRib}>{maskRib(toRib)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>Montant à payer</Text>
        <Text style={styles.amountValue}>
          {amount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
          <Text style={styles.amountCurrency}>{currency}</Text>
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel} numberOfLines={1}>
          {eventTitle}
        </Text>
        <Text style={styles.metaValue}>Réf. {bookingId}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  title: { ...Typography.title, color: Colors.textPrimary },
  pathRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pathNode: { alignItems: "center", flex: 1, gap: 4 },
  pathIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(76,110,245,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  pathIconAgency: { backgroundColor: "rgba(139,92,246,0.15)" },
  pathLabel: { ...Typography.captionMedium, color: Colors.textPrimary },
  pathRib: { ...Typography.caption, color: Colors.textMuted },
  pathArrow: { paddingHorizontal: Spacing.sm },
  divider: { height: 1, backgroundColor: Colors.cardBorder },
  amountRow: { alignItems: "center", gap: 2 },
  amountLabel: { ...Typography.caption, color: Colors.textMuted },
  amountValue: { ...Typography.priceLarge, color: Colors.textPrimary },
  amountCurrency: { ...Typography.body, color: Colors.brandBlue },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metaLabel: { ...Typography.caption, color: Colors.textSecondary, flex: 1, marginRight: Spacing.sm },
  metaValue: { ...Typography.caption, color: Colors.textMuted },
});