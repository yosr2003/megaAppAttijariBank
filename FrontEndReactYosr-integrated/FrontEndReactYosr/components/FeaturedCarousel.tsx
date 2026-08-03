import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { EventItem } from "../types";
import { Colors, Gradients } from "../constants/home/Colors";
import { Radius, Spacing } from "../constants/home/Layout";
import { Typography } from "../constants/home/Typography";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - Spacing.lg * 2;

interface FeaturedCarouselProps {
  events: EventItem[];
}

export default function FeaturedCarousel({ events }: FeaturedCarouselProps) {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    if (newIndex !== index) setIndex(newIndex);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {events.map((event) => (
          <TouchableOpacity
            key={event.id}
            activeOpacity={0.92}
            style={styles.card}
            onPress={() => router.push(`/event/${event.id}`)}
          >
            <Image source={{ uri: event.image }} style={styles.image} />
            <LinearGradient colors={Gradients.cardOverlay} style={StyleSheet.absoluteFill} />

            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>
                {event.priceFrom} <Text style={styles.priceBadgeCurrency}>{event.currency}</Text>
              </Text>
            </View>

            <View style={styles.bottomContent}>
              <View style={styles.categoryRow}>
                <View style={[styles.categoryPill, { backgroundColor: event.categoryColor }]}>
                  <Text style={styles.categoryPillText}>{event.categoryLabel}</Text>
                </View>
                <Ionicons name="star" size={13} color={Colors.starActive} />
                <Text style={styles.rating}>{event.rating}</Text>
              </View>

              <Text style={styles.title}>{event.title}</Text>

              <View style={styles.footerRow}>
                <View>
                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                    <Text style={styles.metaText}>{event.location}</Text>
                    <Ionicons
                      name="calendar-outline"
                      size={12}
                      color={Colors.textSecondary}
                      style={{ marginLeft: 10 }}
                    />
                    <Text style={styles.metaText}>{event.date}</Text>
                  </View>
                </View>
                <LinearGradient colors={Gradients.primary} style={styles.bookNowButton}>
                  <Text style={styles.bookNowText}>Book Now</Text>
                </LinearGradient>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {events.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  card: {
    width: CARD_WIDTH,
    height: 220,
    borderRadius: Radius.xl,
    overflow: "hidden",
    backgroundColor: Colors.card,
  },
  image: { width: "100%", height: "100%", position: "absolute" },
  priceBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: Colors.overlayStrong,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  priceBadgeText: { ...Typography.captionMedium, color: Colors.white },
  priceBadgeCurrency: { color: Colors.brandBlue },
  bottomContent: { position: "absolute", left: 16, right: 16, bottom: 14, gap: 6 },
  categoryRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  categoryPill: { borderRadius: Radius.pill, paddingHorizontal: 9, paddingVertical: 3 },
  categoryPillText: { ...Typography.caption, color: Colors.white, fontWeight: "700" },
  rating: { ...Typography.captionMedium, color: Colors.white },
  title: { ...Typography.h2, color: Colors.white },
  footerRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  metaRow: { flexDirection: "row", alignItems: "center" },
  metaText: { ...Typography.caption, color: Colors.textSecondary, marginLeft: 4 },
  bookNowButton: { borderRadius: Radius.pill, paddingHorizontal: 18, paddingVertical: 10 },
  bookNowText: { ...Typography.captionMedium, color: Colors.white, fontWeight: "700" },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.cardAlt },
  dotActive: { width: 18, backgroundColor: Colors.brandBlue },
});
