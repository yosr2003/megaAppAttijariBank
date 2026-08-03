import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/home/Colors";
import { Radius, Spacing } from "../constants/home/Layout";
import { Typography } from "../constants/home/Typography";

interface InfoCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  value: string;
}

export default function InfoCard({ icon, iconColor = Colors.brandBlue, label, value }: InfoCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: `${iconColor}22` }]}>
        <Ionicons name={icon} size={17} color={iconColor} />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
    alignItems: "flex-start",
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: { flex: 1 },
  label: { ...Typography.label, color: Colors.textMuted, marginBottom: 3 },
  value: { ...Typography.body, color: Colors.textPrimary, lineHeight: 19 },
});
