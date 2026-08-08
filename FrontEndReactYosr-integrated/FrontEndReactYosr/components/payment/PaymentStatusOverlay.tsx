import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/home/Colors";
import { Radius, Spacing } from "../../constants/home/Layout";
import { Typography } from "../../constants/home/Typography";
import PrimaryButton from "../PrimaryButton";

export type PaymentOverlayStatus = "processing" | "success" | "failed";

interface PaymentStatusOverlayProps {
  visible: boolean;
  status: PaymentOverlayStatus;
  amount: number;
  currency?: string;
  errorMessage?: string;
  onViewTicket?: () => void;
  onDone?: () => void;
  onRetry?: () => void;
  onCancel?: () => void;
}

const PROCESSING_STEPS = [
  "Connexion à Spring Boot…",
  "Vérification du compte…",
  "Contact avec la Mock Bank API…",
  "Transfert bancaire en cours…",
];

export default function PaymentStatusOverlay({
  visible,
  status,
  amount,
  currency = "TND",
  errorMessage,
  onViewTicket,
  onDone,
  onRetry,
  onCancel,
}: PaymentStatusOverlayProps) {
  const spin = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.6)).current;
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (status !== "processing") return;

    setStepIndex(0);
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinLoop.start();

    const interval = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, PROCESSING_STEPS.length - 1));
    }, 700);

    return () => {
      spinLoop.stop();
      clearInterval(interval);
    };
  }, [status, spin]);

  useEffect(() => {
    if (status === "success" || status === "failed") {
      scale.setValue(0.6);
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }
  }, [status, scale]);

  const rotateInterpolate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {status === "processing" && (
            <>
              <Animated.View
                style={[styles.iconCircle, styles.processingCircle, { transform: [{ rotate: rotateInterpolate }] }]}
              >
                <Ionicons name="sync" size={30} color={Colors.brandBlue} />
              </Animated.View>
              <Text style={styles.title}>Paiement en cours</Text>
              <Text style={styles.subtitle}>{PROCESSING_STEPS[stepIndex]}</Text>
              <Text style={styles.amount}>
                {amount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
              </Text>
              <View style={styles.dotsRow}>
                {PROCESSING_STEPS.map((_, i) => (
                  <View key={i} style={[styles.dot, i <= stepIndex && styles.dotActive]} />
                ))}
              </View>
            </>
          )}

          {status === "success" && (
            <>
              <Animated.View style={[styles.iconCircle, styles.successCircle, { transform: [{ scale }] }]}>
                <Ionicons name="checkmark" size={34} color={Colors.white} />
              </Animated.View>
              <Text style={styles.title}>Paiement confirmé</Text>
              <Text style={styles.subtitle}>
                Votre réservation est confirmée.{"\n"}
                {amount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}{" "}
                ont été transférés à l’agence.
              </Text>

              <View style={styles.actions}>
                <PrimaryButton label="Voir mon billet" onPress={onViewTicket} successIcon="ticket-outline" />
                <TouchableOpacity style={styles.secondaryAction} onPress={onDone}>
                  <Text style={styles.secondaryActionText}>Terminer</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {status === "failed" && (
            <>
              <Animated.View style={[styles.iconCircle, styles.failedCircle, { transform: [{ scale }] }]}>
                <Ionicons name="close" size={30} color={Colors.white} />
              </Animated.View>
              <Text style={styles.title}>Échec du paiement</Text>
              <Text style={styles.subtitle}>
                {errorMessage ?? "La Mock Bank API n’a pas pu confirmer le virement. Aucun montant n’a été débité."}
              </Text>

              <View style={styles.actions}>
                <PrimaryButton label="Réessayer" onPress={onRetry} />
                <TouchableOpacity style={styles.secondaryAction} onPress={onCancel}>
                  <Text style={styles.secondaryActionText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlayStrong,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  card: {
    width: "100%",
    backgroundColor: Colors.backgroundAlt,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.xl,
    alignItems: "center",
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  processingCircle: { backgroundColor: "rgba(76,110,245,0.15)" },
  successCircle: { backgroundColor: Colors.success },
  failedCircle: { backgroundColor: Colors.danger },
  title: { ...Typography.h2, color: Colors.textPrimary, textAlign: "center" },
  subtitle: { ...Typography.body, color: Colors.textSecondary, textAlign: "center" },
  amount: { ...Typography.priceLarge, color: Colors.textPrimary, marginTop: Spacing.xs },
  dotsRow: { flexDirection: "row", gap: 6, marginTop: Spacing.md },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.cardBorder },
  dotActive: { backgroundColor: Colors.brandBlue },
  actions: { width: "100%", marginTop: Spacing.md, gap: Spacing.sm },
  secondaryAction: { alignItems: "center", paddingVertical: Spacing.sm },
  secondaryActionText: { ...Typography.bodyMedium, color: Colors.textMuted },
});