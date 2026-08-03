import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { EventItem } from "../types";
import { Colors } from "../constants/home/Colors";
import { Radius, Spacing } from "../constants/home/Layout";
import { Typography } from "../constants/home/Typography";
import AvailabilityBar from "./AvailabilityBar";

interface EventCardProps {
  event: EventItem;
}

export default function EventCard({ event }: EventCardProps) {
  const [favorite, setFavorite] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => router.push(`/event/${event.id}`)}
    >
      <View>
        <Image source={{ uri: event.image }} style={styles.image} />
        {event.trending && (
          <View style={styles.trendingBadge}>
            <Ionicons name="trending-up" size={11} color={Colors.white} />
            <Text style={styles.trendingText}>TRENDING</Text>
          </View>
        )}
        <View style={styles.topRightRow}>
          <TouchableOpacity
            style={styles.iconCircle}
            onPress={(e) => {
              e.stopPropagation?.();
              setFavorite((f) => !f);
            }}
          >
            <Ionicons
              name={favorite ? "heart" : "heart-outline"}
              size={16}
              color={favorite ? Colors.danger : Colors.white}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCircle}>
            <Ionicons name="share-social-outline" size={15} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>
        <View style={[styles.categoryPill, { backgroundColor: event.categoryColor }]}>
          <Text style={styles.categoryPillText}>{event.categoryLabel}</Text>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {event.title}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.metaText}>{event.location}</Text>
          <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} style={styles.metaIconSpacer} />
          <Text style={styles.metaText}>{event.date}</Text>
          <Ionicons name="time-outline" size={13} color={Colors.textMuted} style={styles.metaIconSpacer} />
          <Text style={styles.metaText}>{event.time}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statsLeft}>
            <Ionicons name="star" size={13} color={Colors.starActive} />
            <Text style={styles.statsText}>{event.rating}</Text>
            <Ionicons name="people-outline" size={13} color={Colors.textMuted} style={styles.metaIconSpacer} />
            <Text style={styles.statsText}>{event.attending}</Text>
          </View>
          <Text style={styles.price}>
            FROM <Text style={styles.priceValue}>{event.priceFrom} {event.currency}</Text>
          </Text>
        </View>

        <AvailabilityBar percent={event.availabilityPercent} label={event.availabilityLabel} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  image: { width: "100%", height: 190 },
  trendingBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.danger,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  trendingText: { color: Colors.white, fontSize: 10, fontWeight: "800", letterSpacing: 0.4 },
  topRightRow: { position: "absolute", top: 12, right: 12, flexDirection: "row", gap: 8 },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.overlayStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { padding: Spacing.lg, gap: 8 },
  categoryPill: {
    alignSelf: "flex-start",
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryPillText: { ...Typography.captionMedium, color: Colors.white },
  title: { ...Typography.h3, color: Colors.textPrimary },
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  metaText: { ...Typography.caption, color: Colors.textMuted, marginLeft: 4 },
  metaIconSpacer: { marginLeft: 10 },
  statsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statsLeft: { flexDirection: "row", alignItems: "center" },
  statsText: { ...Typography.captionMedium, color: Colors.textSecondary, marginLeft: 4 },
  price: { ...Typography.caption, color: Colors.textMuted },
  priceValue: { ...Typography.price, color: Colors.brandBlue },
});
