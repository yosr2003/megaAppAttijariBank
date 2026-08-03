import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ServiceItem } from "../types";
import { Colors } from "../constants/home/Colors";
import { Radius, Spacing } from "../constants/home/Layout";
import { Typography } from "../constants/home/Typography";

interface ServiceCardProps {
  service: ServiceItem;
  onPress?: () => void;
}

export default function ServiceCard({ service, onPress }: ServiceCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: service.color }]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Ionicons name={service.icon} size={20} color={Colors.white} />
      <Text style={styles.title}>{service.title}</Text>
      <Text style={styles.subtitle}>{service.subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: "31.5%",
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 6,
    minHeight: 84,
  },
  title: { ...Typography.captionMedium, color: Colors.white },
  subtitle: { ...Typography.caption, color: "rgba(255,255,255,0.75)", fontSize: 10 },
});
