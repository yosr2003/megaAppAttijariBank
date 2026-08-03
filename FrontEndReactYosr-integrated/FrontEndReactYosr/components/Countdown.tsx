import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/home/Colors";
import { Radius, Spacing } from "../constants/home/Layout";
import { Typography } from "../constants/home/Typography";

interface CountdownProps {
  targetISO: string;
  availabilityLabel: string;
  ticketsLeft: number;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function computeTimeLeft(targetISO: string): TimeLeft {
  const target = new Date(targetISO).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, expired: false };
}

const pad = (n: number) => n.toString().padStart(2, "0");

export default function Countdown({ targetISO, availabilityLabel, ticketsLeft }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => computeTimeLeft(targetISO));

  useEffect(() => {
    // Vrai timer : mis à jour chaque seconde, pas de texte statique.
    const interval = setInterval(() => {
      setTimeLeft(computeTimeLeft(targetISO));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetISO]);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.headerLabel}>
            {timeLeft.expired ? "EVENT IS LIVE" : "EVENT STARTS IN"}
          </Text>
        </View>
        <View style={styles.availability}>
          <View style={styles.availabilityDot} />
          <Text style={styles.availabilityText}>Live availability</Text>
        </View>
      </View>

      <View style={styles.numbersRow}>
        <TimeBlock value={timeLeft.days} label="DAYS" />
        <Text style={styles.separator}>:</Text>
        <TimeBlock value={timeLeft.hours} label="HRS" />
        <Text style={styles.separator}>:</Text>
        <TimeBlock value={timeLeft.minutes} label="MIN" />
        <Text style={styles.separator}>:</Text>
        <TimeBlock value={timeLeft.seconds} label="SEC" />

        <Text style={styles.ticketsLeft}>{ticketsLeft} tickets left</Text>
      </View>
    </View>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.timeBlock}>
      <Text style={styles.timeNumber}>{pad(value)}</Text>
      <Text style={styles.timeLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerLabel: { ...Typography.label, color: Colors.textSecondary },
  availability: { flexDirection: "row", alignItems: "center", gap: 5 },
  availabilityDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  availabilityText: { ...Typography.caption, color: Colors.success, fontWeight: "600" },
  numbersRow: { flexDirection: "row", alignItems: "flex-end" },
  timeBlock: { alignItems: "center", minWidth: 42 },
  timeNumber: { ...Typography.countdownNumber, color: Colors.textPrimary },
  timeLabel: { ...Typography.caption, fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  separator: { ...Typography.countdownNumber, color: Colors.textMuted, marginHorizontal: 2, marginBottom: 14 },
  ticketsLeft: { ...Typography.caption, color: Colors.textMuted, marginLeft: "auto", marginBottom: 6 },
});
