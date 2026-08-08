import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/home/Colors";
import { Radius, Spacing } from "../../constants/home/Layout";
import { Typography } from "../../constants/home/Typography";
import PrimaryButton from "../PrimaryButton";

interface PaymentConfirmationSheetProps {
  visible: boolean;
  amount: number;
  currency?: string;
  toLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function PaymentConfirmationSheet({
  visible,
  amount,
  currency = "TND",
  toLabel,
  onCancel,
  onConfirm,
}: PaymentConfirmationSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onCancel} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark-outline" size={26} color={Colors.brandBlue} />
          </View>

          <Text style={styles.title}>Confirmer le virement</Text>
          <Text style={styles.subtitle}>
            Vous êtes sur le point de transférer{" "}
            <Text style={styles.amount}>
              {amount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
            </Text>{" "}
            vers {toLabel}. Cette opération est simulée par la Mock Bank API.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.8}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <View style={styles.confirmButton}>
              <PrimaryButton label="Confirmer le paiement" onPress={onConfirm} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: Colors.overlayStrong, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: Colors.backgroundAlt,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    alignItems: "center",
    gap: Spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.cardBorder,
    marginBottom: Spacing.md,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(76,110,245,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  title: { ...Typography.h2, color: Colors.textPrimary },
  subtitle: { ...Typography.body, color: Colors.textSecondary, textAlign: "center", marginBottom: Spacing.md },
  amount: { color: Colors.textPrimary, fontWeight: "700" },
  actions: { width: "100%", gap: Spacing.sm },
  cancelButton: { alignItems: "center", paddingVertical: Spacing.sm },
  cancelText: { ...Typography.bodyMedium, color: Colors.textMuted },
  confirmButton: { width: "100%" },
});