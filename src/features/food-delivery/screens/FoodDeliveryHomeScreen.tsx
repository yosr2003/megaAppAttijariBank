import {
    GlassCard,
    Screen,
    SearchBar,
    SectionTitle,
} from "@/src/components/ui";
import { useTheme } from "@/src/hooks/use-theme";
import { useFoodCartStore } from "@/src/store/food-cart-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    CATEGORIES,
    MOCK_AI_RECOMMENDATIONS,
    MOCK_RESTAURANTS,
    USER_NAME,
} from "../mocks";

export function FoodDeliveryHomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { getItemCount } = useFoodCartStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const cartCount = getItemCount();
  const aiRecommendation = MOCK_AI_RECOMMENDATIONS[0];

  const filteredRestaurants = selectedCategoryId
    ? MOCK_RESTAURANTS.filter((r) =>
        r.cuisineTypes.some((ct) =>
          ct
            .toLowerCase()
            .includes(
              CATEGORIES.find(
                (c) => c.id === selectedCategoryId,
              )?.name.toLowerCase() || "",
            ),
        ),
      )
    : MOCK_RESTAURANTS;

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <SafeAreaView edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.locationContainer}>
            <Ionicons
              name="location-outline"
              size={24}
              color={theme.colors.primary}
            />
            <View style={styles.locationTextContainer}>
              <Text
                style={[
                  styles.locationLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Bonjour {USER_NAME} 👋
              </Text>
              <Text
                style={[
                  styles.locationText,
                  { color: theme.colors.textPrimary },
                ]}
              >
                Tunis, La Marsa
              </Text>
            </View>
            <Ionicons
              name="chevron-down"
              size={20}
              color={theme.colors.textPrimary}
            />
          </Pressable>

          <View style={styles.headerRight}>
            <Pressable
              style={[
                styles.iconButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => router.push("/food-delivery/cart" as any)}
            >
              <Ionicons
                name="cart-outline"
                size={24}
                color={theme.colors.textPrimary}
              />
              {cartCount > 0 && (
                <View
                  style={[
                    styles.cartBadge,
                    { backgroundColor: theme.colors.danger },
                  ]}
                >
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </Pressable>
            <Pressable
              style={[
                styles.avatarButton,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text
                style={[styles.avatarText, { color: theme.colors.primaryOn }]}
              >
                {USER_NAME[0]}
              </Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Search Bar */}
          <View style={{ paddingHorizontal: theme.spacing.md }}>
            <SearchBar placeholder="What do you want to eat?" />
          </View>

          {/* AI Recommendation Card */}
          <View style={{ paddingHorizontal: theme.spacing.md }}>
            <GlassCard style={{ padding: theme.spacing.lg }}>
              <View style={styles.aiCardHeader}>
                <Ionicons
                  name="sparkles-outline"
                  size={24}
                  color={theme.colors.primary}
                />
                <SectionTitle style={{ fontSize: 16, marginBottom: 0 }}>
                  AI Assistant
                </SectionTitle>
              </View>
              <Text
                style={[
                  styles.aiMessage,
                  {
                    color: theme.colors.textPrimary,
                    marginTop: theme.spacing.sm,
                  },
                ]}
              >
                {aiRecommendation.message}
              </Text>
              <Pressable
                style={[
                  styles.aiButton,
                  {
                    backgroundColor: theme.colors.primary,
                    marginTop: theme.spacing.md,
                  },
                ]}
                onPress={() => {
                  if (aiRecommendation.restaurantId) {
                    router.push(
                      `/food-delivery/${aiRecommendation.restaurantId}` as any,
                    );
                  }
                }}
              >
                <Text
                  style={[
                    styles.aiButtonText,
                    { color: theme.colors.primaryOn },
                  ]}
                >
                  Show Suggestions
                </Text>
                <Ionicons
                  name="arrow-forward-outline"
                  size={16}
                  color={theme.colors.primaryOn}
                />
              </Pressable>
            </GlassCard>
          </View>

          {/* Banner */}
          <View style={{ paddingHorizontal: theme.spacing.md }}>
            <View style={styles.bannerContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1555396273-368ea6160c71?w=800",
                }}
                style={styles.bannerImage}
              />
              <View
                style={[
                  styles.bannerOverlay,
                  { backgroundColor: theme.colors.glassStrong },
                ]}
              >
                <View
                  style={[
                    styles.bannerTag,
                    { backgroundColor: theme.colors.danger },
                  ]}
                >
                  <Text style={styles.bannerTagText}>🔥 OFFRE DU JOUR</Text>
                </View>
                <Text
                  style={[
                    styles.bannerTitle,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Livraison gratuite
                </Text>
                <Text
                  style={[
                    styles.bannerSubtitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Sur votre 1ère commande • Code{" "}
                  <Text
                    style={{ color: theme.colors.primary, fontWeight: "bold" }}
                  >
                    TOUNSI
                  </Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Cuisine Categories */}
          <View style={{ paddingHorizontal: theme.spacing.md }}>
            <SectionTitle>Catégories</SectionTitle>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.primary
                          : theme.colors.surface,
                        borderColor: isSelected
                          ? theme.colors.primary
                          : theme.colors.border,
                        borderWidth: 1,
                      },
                    ]}
                    onPress={() =>
                      setSelectedCategoryId(isSelected ? null : cat.id)
                    }
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text
                      style={[
                        styles.categoryText,
                        {
                          color: isSelected
                            ? theme.colors.primaryOn
                            : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Popular Restaurants */}
          <View style={{ paddingHorizontal: theme.spacing.md }}>
            <View style={styles.restaurantsHeader}>
              <SectionTitle>Populaires près de vous</SectionTitle>
              <Pressable>
                <Text
                  style={[styles.seeAllText, { color: theme.colors.primary }]}
                >
                  Voir tout
                </Text>
              </Pressable>
            </View>
            {filteredRestaurants.map((restaurant) => (
              <Pressable
                key={restaurant.id}
                style={{ marginBottom: theme.spacing.md }}
                onPress={() =>
                  router.push(`/food-delivery/${restaurant.id}` as any)
                }
              >
                <GlassCard style={{ overflow: "hidden", padding: 0 }}>
                  <View style={styles.restaurantImageContainer}>
                    <Image
                      source={{ uri: restaurant.coverImage }}
                      style={styles.restaurantImage}
                    />
                    {restaurant.tags && restaurant.tags.length > 0 && (
                      <View style={styles.tagsContainer}>
                        {restaurant.tags.slice(0, 2).map((tag, index) => (
                          <View
                            key={index}
                            style={[
                              styles.tag,
                              {
                                backgroundColor:
                                  index === 0
                                    ? theme.colors.primary
                                    : theme.colors.danger,
                              },
                            ]}
                          >
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                  <View style={styles.restaurantInfo}>
                    <View style={styles.restaurantTopRow}>
                      <Text
                        style={[
                          styles.restaurantName,
                          { color: theme.colors.textPrimary },
                        ]}
                      >
                        {restaurant.name}
                      </Text>
                      <View
                        style={[
                          styles.ratingBadge,
                          { backgroundColor: theme.colors.surfaceElevated },
                        ]}
                      >
                        <Ionicons
                          name="star"
                          size={14}
                          color={theme.colors.primary}
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={[
                            styles.ratingText,
                            { color: theme.colors.textPrimary },
                          ]}
                        >
                          {restaurant.rating}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.restaurantDetailsRow}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={theme.colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.detailText,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        {restaurant.deliveryTime} min
                      </Text>
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: theme.colors.border },
                        ]}
                      />
                      <Ionicons
                        name="bicycle-outline"
                        size={14}
                        color={theme.colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.detailText,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        {restaurant.deliveryFee > 0
                          ? `${restaurant.deliveryFee.toFixed(3)} TND`
                          : "Gratuite"}
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  locationText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  headerRight: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 1,
  },
  cartBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingBottom: 40,
    gap: 24,
  },
  aiCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aiMessage: {
    fontSize: 15,
    lineHeight: 22,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  aiButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  bannerContainer: {
    position: "relative",
    borderRadius: 24,
    overflow: "hidden",
    height: 200,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  bannerTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  bannerTagText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
  },
  categoriesScroll: {
    gap: 12,
    marginTop: 12,
  },
  categoryButton: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
  },
  categoryIcon: {
    fontSize: 28,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  restaurantsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  restaurantImageContainer: {
    position: "relative",
  },
  restaurantImage: {
    width: "100%",
    height: 180,
  },
  tagsContainer: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tagText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "700",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700",
  },
  restaurantDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 14,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
