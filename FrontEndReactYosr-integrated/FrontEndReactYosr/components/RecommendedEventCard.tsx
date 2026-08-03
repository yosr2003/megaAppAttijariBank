import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { EventItem } from "../types";
import { Colors } from "../constants/home/Colors";
import { Radius, Spacing } from "../constants/home/Layout";
import { Typography } from "../constants/home/Typography";

interface RecommendedEventCardProps {
  event: EventItem;
}

export default function RecommendedEventCard({ event }: RecommendedEventCardProps) {
  const [favorite, setFavorite] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => router.push(`/event/${event.id}`)}
    >
      <View>
        <Image source={{ uri: event.image }} style={styles.image} />
        {event.aiMatch != null && (
          <View style={styles.matchBadge}>
            <Ionicons name="sparkles" size={10} color={Colors.white} />
            <Text style={styles.matchText}>{event.aiMatch}% match</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.heart}
          onPress={(e) => {
            e.stopPropagation?.();
            setFavorite((f) => !f);
          }}
        >
          <Ionicons
            name={favorite ? "heart" : "heart-outline"}
            size={14}
            color={favorite ? Colors.danger : Colors.white}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {event.title}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
          <Text style={styles.metaText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>
        <Text style={styles.price}>
          {event.priceFrom} <Text style={styles.currency}>{event.currency}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const CARD_WIDTH = "48%";

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  image: { width: "100%", height: 110 },
  matchBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.brandPurple,
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  matchText: { color: Colors.white, fontSize: 9, fontWeight: "700" },
  heart: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.overlayStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { padding: 10, gap: 4 },
  title: { ...Typography.captionMedium, color: Colors.textPrimary, fontSize: 13 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { ...Typography.caption, color: Colors.textMuted, fontSize: 11 },
  price: { ...Typography.captionMedium, color: Colors.brandBlue, marginTop: 2 },
  currency: { color: Colors.textMuted, fontWeight: "400" },
});
