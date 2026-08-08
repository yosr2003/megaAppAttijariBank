import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Gradients } from "../../constants/home/Colors";
import { Radius, Spacing } from "../../constants/home/Layout";
import { Typography } from "../../constants/home/Typography";

export type AccountStatus = "ACTIVE" | "SUSPENDED" | "CLOSED";

interface BankAccountCardProps {
  owner: string;
  rib: string;
  balance: number;
  currency?: string;
  status?: AccountStatus;
  variant?: "client" | "agency";
  label?: string;
}

function maskRib(rib: string) {
  const clean = rib.replace(/\s/g, "");
  return `${clean.slice(0, 2)} •••• •••• ${clean.slice(-4)}`;
}

const STATUS_LABEL: Record<AccountStatus, string> = {
  ACTIVE: "Compte actif",
  SUSPENDED: "Compte suspendu",
  CLOSED: "Compte clôturé",
};

export default function BankAccountCard({
  owner,
  rib,
  balance,
  currency = "TND",
  status = "ACTIVE",
  variant = "client",
  label,
}: BankAccountCardProps) {
  const gradientColors =
    variant === "client"
      ? (Gradients.primary as unknown as readonly [string, string])
      : (["#1E293B", "#334155"] as const);

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.chip}>
          <Ionicons name="wifi-outline" size={16} color={Colors.white} style={styles.chipIcon} />
        </View>
        <View style={[styles.statusPill, status !== "ACTIVE" && styles.statusPillWarning]}>
          <View style={[styles.statusDot, status !== "ACTIVE" && styles.statusDotWarning]} />
          <Text style={styles.statusText}>{STATUS_LABEL[status]}</Text>
        </View>
      </View>

      <Text style={styles.label}>
        {label ?? (variant === "client" ? "MON COMPTE" : "COMPTE AGENCE")}
      </Text>
      <Text style={styles.rib}>{maskRib(rib)}</Text>

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.ownerLabel}>TITULAIRE</Text>
          <Text style={styles.owner} numberOfLines={1}>
            {owner}
          </Text>
        </View>
        <View style={styles.balanceBlock}>
          <Text style={styles.ownerLabel}>SOLDE</Text>
          <Text style={styles.balance}>
            {balance.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <Text style={styles.currency}> {currency}</Text>
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chip: {
    width: 38,
    height: 28,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  chipIcon: { transform: [{ rotate: "90deg" }] },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillWarning: { backgroundColor: Colors.dangerBg },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  statusDotWarning: { backgroundColor: Colors.danger },
  statusText: { ...Typography.caption, color: Colors.white, fontWeight: "600" },
  label: { ...Typography.label, color: "rgba(255,255,255,0.75)", marginTop: Spacing.sm },
  rib: { ...Typography.h3, color: Colors.white, letterSpacing: 1.5 },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: Spacing.sm,
  },
  ownerLabel: { ...Typography.label, color: "rgba(255,255,255,0.6)", marginBottom: 4 },
  owner: { ...Typography.bodyMedium, color: Colors.white, maxWidth: 140 },
  balanceBlock: { alignItems: "flex-end" },
  balance: { ...Typography.priceLarge, color: Colors.white },
  currency: { ...Typography.body, color: "rgba(255,255,255,0.75)" },
});