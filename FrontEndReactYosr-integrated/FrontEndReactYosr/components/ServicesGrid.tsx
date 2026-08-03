import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { services } from "../data/services";
import { Colors } from "../constants/home/Colors";
import { Spacing } from "../constants/home/Layout";
import { Typography } from "../constants/home/Typography";
import ServiceCard from "./ServiceCard";
import OutingPlannerBanner from "./OutingPlannerBanner";

interface ServicesGridProps {
  eventId: string;
}

export default function ServicesGrid({ eventId }: ServicesGridProps) {
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Ionicons name="flash" size={16} color={Colors.brandBlue} />
        <Text style={styles.title}>SuperTounsi Services</Text>
      </View>

      <View style={styles.grid}>
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </View>

      <OutingPlannerBanner eventId={eventId} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: Spacing.xl, marginBottom: Spacing.lg },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 },
  title: { ...Typography.h3, color: Colors.textPrimary },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: "2.5%", rowGap: Spacing.sm },
});
