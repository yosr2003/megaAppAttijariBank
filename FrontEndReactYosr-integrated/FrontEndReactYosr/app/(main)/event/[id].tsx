import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import Countdown from "../../../components/Countdown";
import PrimaryButton, { ButtonState } from "../../../components/PrimaryButton";
import ServicesGrid from "../../../components/ServicesGrid";
import BottomNavigation from "../../../components/BottomNavigation";

import { getEventById } from "../../../data/events";
import { Colors } from "../../../constants/home/Colors";
import { Radius, Spacing } from "../../../constants/home/Layout";
import { Typography } from "../../../constants/home/Typography";

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = getEventById(id ?? "");
  const [favorite, setFavorite] = useState(false);
  const [bookingState, setBookingState] = useState<ButtonState>("idle");

  if (!event) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Event not found.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleBook = () => {
    if (bookingState !== "idle") return;
    setBookingState("loading");
    // Simule l'appel réseau de réservation (comportement observé dans la vidéo)
    setTimeout(() => {
      setBookingState("success");
    }, 1800);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroWrapper}>
          <Image source={{ uri: event.image }} style={styles.hero} />

          <View style={styles.heroTopRow}>
            <TouchableOpacity style={styles.iconCircle} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.heroTopRight}>
              <TouchableOpacity style={styles.iconCircle} onPress={() => setFavorite((f) => !f)}>
                <Ionicons
                  name={favorite ? "heart" : "heart-outline"}
                  size={18}
                  color={favorite ? Colors.danger : Colors.white}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconCircle}>
                <Ionicons name="share-social-outline" size={17} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.badgeRow}>
            <View style={[styles.pill, { backgroundColor: event.categoryColor }]}>
              <Text style={styles.pillText}>{event.categoryLabel}</Text>
            </View>
            {event.trending && (
              <View style={[styles.pill, { backgroundColor: Colors.danger }]}>
                <Ionicons name="trending-up" size={11} color={Colors.white} />
                <Text style={styles.pillText}> TRENDING</Text>
              </View>
            )}
            {event.aiMatch != null && (
              <View style={[styles.pill, styles.aiPill]}>
                <Ionicons name="sparkles" size={11} color={Colors.white} />
                <Text style={styles.pillText}> {event.aiMatch}% AI Match</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{event.title}</Text>

          <View style={styles.organizerRow}>
            <Text style={styles.organizer}>by {event.organizer}</Text>
            <View style={styles.stars}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < Math.round(event.rating) ? "star" : "star-outline"}
                  size={13}
                  color={Colors.starActive}
                />
              ))}
            </View>
            <Text style={styles.ratingValue}>{event.rating}</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <InfoCell icon="calendar-outline" label="DATE" value={event.date} />
              <InfoCell icon="time-outline" label="TIME" value={event.time} />
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <InfoCell icon="location-outline" label="VENUE" value={event.venue} />
              <InfoCell
                icon="people-outline"
                label="ATTENDING"
                value={`${event.attending} / ${event.capacity}`}
              />
            </View>
          </View>

          <Countdown
            targetISO={event.dateISO}
            availabilityLabel={event.availabilityLabel}
            ticketsLeft={event.ticketsLeft}
          />

          <ServicesGrid eventId={event.id} />

          <View style={styles.tagsRow}>
            {event.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.stickyBar}>
        <View>
          <Text style={styles.priceLabel}>PRICE</Text>
          <Text style={styles.priceValue}>
            {event.priceFrom} <Text style={styles.priceCurrency}>{event.currency}</Text>
            {event.priceTo !== event.priceFrom && (
              <Text style={styles.priceRange}> – {event.priceTo} {event.currency}</Text>
            )}
          </Text>
        </View>
        <View style={styles.stickyButton}>
          <PrimaryButton
            label="Book Instantly"
            state={bookingState}
            onPress={handleBook}
            successIcon="checkmark-circle"
          />
        </View>
      </View>

      <BottomNavigation active="home" />
    </SafeAreaView>
  );
}

function InfoCell({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoCell}>
      <View style={styles.infoCellHeader}>
        <Ionicons name={icon} size={13} color={Colors.textMuted} />
        <Text style={styles.infoCellLabel}>{label}</Text>
      </View>
      <Text style={styles.infoCellValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: Spacing.xxl },
  heroWrapper: { width: "100%", height: 300 },
  hero: { width: "100%", height: "100%" },
  heroTopRow: {
    position: "absolute",
    top: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroTopRight: { flexDirection: "row", gap: Spacing.sm },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.overlayStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  aiPill: { backgroundColor: Colors.brandPurple },
  pillText: { ...Typography.caption, color: Colors.white, fontWeight: "700" },
  title: { ...Typography.h1, color: Colors.textPrimary, marginBottom: 8 },
  organizerRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 18 },
  organizer: { ...Typography.body, color: Colors.brandBlue },
  stars: { flexDirection: "row", marginLeft: 6, gap: 1 },
  ratingValue: { ...Typography.captionMedium, color: Colors.textSecondary },
  infoCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.lg },
  infoRow: { flexDirection: "row" },
  infoDivider: { height: 1, backgroundColor: Colors.cardBorder, marginVertical: Spacing.md },
  infoCell: { flex: 1, gap: 4 },
  infoCellHeader: { flexDirection: "row", alignItems: "center", gap: 5 },
  infoCellLabel: { ...Typography.label, color: Colors.textMuted },
  infoCellValue: { ...Typography.bodyMedium, color: Colors.textPrimary },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: Spacing.md },
  tag: {
    backgroundColor: Colors.card,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: { ...Typography.caption, color: Colors.textSecondary },
  stickyBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.backgroundAlt,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  priceLabel: { ...Typography.label, color: Colors.textMuted },
  priceValue: { ...Typography.priceLarge, color: Colors.textPrimary, marginTop: 2 },
  priceCurrency: { color: Colors.brandBlue },
  priceRange: { ...Typography.caption, color: Colors.textMuted },
  stickyButton: { flex: 1, maxWidth: 210 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { ...Typography.body, color: Colors.textSecondary },
  backLink: { ...Typography.bodyMedium, color: Colors.brandBlue },
});
