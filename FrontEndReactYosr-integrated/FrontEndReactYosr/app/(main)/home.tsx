import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import Header from "../../components/Header";
import SearchBar from "../../components/SearchBar";
import FeaturedCarousel from "../../components/FeaturedCarousel";
import CategoryList from "../../components/CategoryList";
import EventCard from "../../components/EventCard";
import RecommendedEventCard from "../../components/RecommendedEventCard";
import NearbyEvents from "../../components/NearbyEvents";
import BottomNavigation from "../../components/BottomNavigation";

import { events } from "../../data/events";
import { categories } from "../../data/categories";
import { CategoryKey } from "../../types";
import { Colors } from "../../constants/home/Colors";
import { Typography } from "../../constants/home/Typography";
import { Layout, Spacing } from "../../constants/home/Layout";

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [search, setSearch] = useState("");

  const filteredEvents = useMemo(() => {
    let list = events;
    if (activeCategory !== "all") {
      list = list.filter((e) => e.category === activeCategory);
    }
    if (search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.categoryLabel.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeCategory, search]);

  const recommended = useMemo(
    () => [...events].sort((a, b) => (b.aiMatch ?? 0) - (a.aiMatch ?? 0)).slice(0, 2),
    []
  );

  const featured = useMemo(() => events.slice(0, 3), []);

  const sectionLabel =
    activeCategory === "all"
      ? "Upcoming Events"
      : categories.find((c) => c.key === activeCategory)?.label ?? "Events";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <SearchBar
          value={search}
          onChangeText={setSearch}
          onPressAI={() => router.push(`/planner/${events[0].id}`)}
        />

        {activeCategory === "all" && search.length === 0 && (
          <FeaturedCarousel events={featured} />
        )}

        <CategoryList active={activeCategory} onChange={setActiveCategory} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{sectionLabel}</Text>
            <Text style={styles.sectionCount}>{filteredEvents.length} events</Text>
          </View>

          {filteredEvents.length === 0 ? (
            <Text style={styles.emptyText}>No events found for this category yet.</Text>
          ) : (
            filteredEvents.map((event) => <EventCard key={event.id} event={event} />)
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleSmall}>✨ Recommended for You</Text>
          </View>
          <View style={styles.recommendedGrid}>
            {recommended.map((event) => (
              <RecommendedEventCard key={event.id} event={event} />
            ))}
          </View>
        </View>

        <NearbyEvents count={5} />
      </ScrollView>

      <BottomNavigation active="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary },
  sectionTitleSmall: { ...Typography.h3, color: Colors.textPrimary },
  sectionCount: { ...Typography.caption, color: Colors.brandBlue },
  emptyText: { ...Typography.body, color: Colors.textMuted, textAlign: "center", paddingVertical: 24 },
  recommendedGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
});
