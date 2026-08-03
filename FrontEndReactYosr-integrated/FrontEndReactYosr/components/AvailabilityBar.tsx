import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/home/Colors";
import { Typography } from "../constants/home/Typography";
import { Radius } from "../constants/home/Layout";

interface AvailabilityBarProps {
  percent: number; // 0-100
  label: string;
}

function colorForLabel(label: string) {
  if (label === "Available") return Colors.success;
  if (label === "Almost full") return Colors.danger;
  return Colors.warning; // Filling fast
}

export default function AvailabilityBar({ percent, label }: AvailabilityBarProps) {
  const color = colorForLabel(label);
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(percent, 100)}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  track: {
    flex: 1,
    height: 5,
    borderRadius: Radius.pill,
    backgroundColor: Colors.cardAlt,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: Radius.pill },
  label: { ...Typography.captionMedium },
});
