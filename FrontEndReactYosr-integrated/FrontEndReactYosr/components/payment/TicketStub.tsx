import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Gradients } from "../../constants/home/Colors";
import { Radius, Spacing } from "../../constants/home/Layout";
import { Typography } from "../../constants/home/Typography";

interface TicketStubProps {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  amount: number;
  currency?: string;
  bookingId: string;
  transactionId: string;
}

function BarcodePattern({ seed }: { seed: string }) {
  const bars = Array.from(seed || "TICKET").map((char, i) => {
    const code = char.charCodeAt(0);
    const width = (code % 3) + 1.5;
    return <View key={i} style={[styles.bar, { width, opacity: i % 7 === 0 ? 0.4 : 1 }]} />;
  });

  return <View style={styles.barcodeRow}>{bars}</View>;
}

export default function TicketStub({
  eventTitle,
  eventDate,
  eventTime,
  venue,
  amount,
  currency = "TND",
  bookingId,
  transactionId,
}: TicketStubProps) {
  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={Gradients.primary as unknown as readonly [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topSection}
      >
        <View style={styles.statusRow}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.white} />
          <Text style={styles.statusText}>CONFIRMÉ</Text>
        </View>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {eventTitle}
        </Text>
        <Text style={styles.eventMeta}>
          {eventDate} · {eventTime}
        </Text>
        <Text style={styles.eventMeta}>{venue}</Text>
      </LinearGradient>

      <View style={styles.perforationRow}>
        {Array.from({ length: 16 }).map((_, i) => (
          <View key={i} style={styles.perforationDot} />
        ))}
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.detailRow}>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>RÉSERVATION</Text>
            <Text style={styles.detailValue}>{bookingId}</Text>
          </View>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>MONTANT PAYÉ</Text>
            <Text style={styles.detailValue}>
              {amount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>TRANSACTION</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {transactionId}
            </Text>
          </View>
        </View>

        <BarcodePattern seed={transactionId || bookingId} />
        <Text style={styles.scanHint}>Présentez ce billet à l’entrée</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Radius.xl,
    overflow: "hidden",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  topSection: { padding: Spacing.lg, gap: 4 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  statusText: { ...Typography.captionMedium, color: Colors.white, letterSpacing: 1 },
  eventTitle: { ...Typography.h2, color: Colors.white },
  eventMeta: { ...Typography.body, color: "rgba(255,255,255,0.85)" },
  perforationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    backgroundColor: Colors.card,
  },
  perforationDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.background, marginTop: -4 },
  bottomSection: { padding: Spacing.lg, gap: Spacing.md },
  detailRow: { flexDirection: "row", gap: Spacing.lg },
  detailCell: { flex: 1, gap: 2 },
  detailLabel: { ...Typography.label, color: Colors.textMuted },
  detailValue: { ...Typography.bodyMedium, color: Colors.textPrimary },
  barcodeRow: { flexDirection: "row", alignItems: "flex-end", height: 46, gap: 2, marginTop: Spacing.sm },
  bar: { height: "100%", backgroundColor: Colors.textPrimary, borderRadius: 1 },
  scanHint: { ...Typography.caption, color: Colors.textMuted, textAlign: "center" },
});