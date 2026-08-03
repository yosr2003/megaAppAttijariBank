import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { nearbyPins } from "../data/events";
import { Colors } from "../constants/home/Colors";
import { Radius, Spacing } from "../constants/home/Layout";
import { Typography } from "../constants/home/Typography";

interface NearbyEventsProps {
  count?: number;
}

export default function NearbyEvents({ count = 5 }: NearbyEventsProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Nearby Events</Text>
        <TouchableOpacity style={styles.viewMapRow}>
          <Text style={styles.viewMap}>View Full Map</Text>
          <Ionicons name="chevron-forward" size={13} color={Colors.brandBlue} />
        </TouchableOpacity>
      </View>

      <View style={styles.mapBox}>
        {nearbyPins.map((pin) => (
          <View key={pin.id} style={[styles.pinWrapper, { top: `${pin.top}%`, left: `${pin.left}%` }]}>
            <View style={[styles.pin, { backgroundColor: pin.color }]}>
              <Ionicons name="location" size={12} color={Colors.white} />
            </View>
            <Text style={styles.pinLabel}>{pin.label}</Text>
          </View>
        ))}

        <View style={styles.mapFooter}>
          <Ionicons name="navigate-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.mapFooterText}>Greater Tunis Region</Text>
          <Text style={styles.mapFooterCount}>{count} events nearby</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary },
  viewMapRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  viewMap: { ...Typography.captionMedium, color: Colors.brandBlue },
  mapBox: {
    height: 160,
    borderRadius: Radius.xl,
    backgroundColor: Colors.card,
    overflow: "hidden",
    padding: Spacing.lg,
  },
  pinWrapper: { position: "absolute", alignItems: "center" },
  pin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.background,
  },
  pinLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
    backgroundColor: Colors.overlayStrong,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  mapFooter: {
    position: "absolute",
    bottom: Spacing.md,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mapFooterText: { ...Typography.caption, color: Colors.textSecondary, flex: 1 },
  mapFooterCount: { ...Typography.caption, color: Colors.textMuted },
});
