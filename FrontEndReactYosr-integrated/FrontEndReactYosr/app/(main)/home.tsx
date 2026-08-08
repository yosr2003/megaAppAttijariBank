import React, { useMemo, useState, useEffect } from "react";
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

import { categories } from "../../data/categories";
import { CategoryKey, EventItem } from "../../types"; // ✅ IMPORTANT
import { Colors } from "../../constants/home/Colors";
import { Typography } from "../../constants/home/Typography";
import { Layout, Spacing } from "../../constants/home/Layout";

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
const mapCategory = (apiCategory: string): CategoryKey => {
  const c = apiCategory.toLowerCase();

  if (c.includes("music") || c.includes("concert")) return "concerts";
  if (c.includes("festival")) return "festival";
  if (c.includes("sport")) return "sports";
  if (c.includes("cinema") || c.includes("movie") || c.includes("film")) return "cinema";
  if (c.includes("conference") || c.includes("business")) return "conferences";
  if (c.includes("family") || c.includes("kids")) return "family";
  if (c.includes("travel") || c.includes("trip")) return "travel";

  return "all";
};
  useEffect(() => {
    fetch("https://mock.apidog.com/m1/1351051-1353850-default/events")
      .then((res) => res.json())
      .then((data) => {
        const formatted: EventItem[] = data.events.map((e: any) => ({
          id: e.id.toString(),
          title: e.title,
          location: e.city,
          venue: e.venue, // ✅ requis
          category: e.category,
          categoryLabel: e.subcategory,
          categoryColor: "#4F46E5",

          image: e.image,

          date: e.date,
          dateISO: e.date, // ✅ requis

          time: e.time,

          priceFrom: e.price,
          currency: e.currency,

          organizer: e.source || "Unknown",

          rating: 4.5,
          reviews: 120,

          attending: 50,   // ✅ requis
          capacity: 200,   // ✅ requis

          description: e.description || "",

          isFeatured: true, // optionnel selon ton type
        }));

        setEvents(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Text style={{ padding: 20 }}>Loading...</Text>;
  }

 const filteredEvents = useMemo(() => {
  let list = [...events];
  const now = new Date();

  // ✅ garder uniquement events futurs
  list = list.filter(
    (e) => new Date(e.dateISO + "T00:00:00") >= now
  );

  // ✅ filtre catégorie
  if (activeCategory !== "all") {
    list = list.filter((e) => e.category === activeCategory);
  }

  // ✅ recherche
  if (search.trim().length > 0) {
    const q = search.trim().toLowerCase();

    list = list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.categoryLabel.toLowerCase().includes(q)
    );
  }
  return list.sort(
    (a, b) =>
      new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
  );
}, [events, activeCategory, search]);

  const recommended = useMemo(() => events.slice(0, 2), [events]);
  const featured = useMemo(() => {
  const now = new Date();

  return events
    .filter((e) => new Date(e.dateISO + "T00:00:00") >= now) // events futurs
    .sort(
      (a, b) =>
        new Date(a.dateISO).getTime() -
        new Date(b.dateISO).getTime()
    ) // du plus proche au plus loin
    .slice(0, 5); // seulement 5
}, [events]);

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
          onPressAI={() => {
            if (events.length > 0) {
              router.push(`/planner/${events[0].id}`);
            }
          }}
        />

        {activeCategory === "all" && search.length === 0 && (
          <FeaturedCarousel events={featured} />
        )}

        <CategoryList active={activeCategory} onChange={setActiveCategory} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{sectionLabel}</Text>
            <Text style={styles.sectionCount}>
              {filteredEvents.length} events
            </Text>
          </View>

          {filteredEvents.length === 0 ? (
            <Text style={styles.emptyText}>
              No events found for this category yet.
            </Text>
          ) : (
            filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitleSmall}>
            ✨ Recommended for You
          </Text>

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
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: "center",
    paddingVertical: 24,
  },
  recommendedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});