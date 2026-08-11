import { GlassCard, Screen, SectionTitle } from "@/src/components/ui";
import { useTheme } from "@/src/hooks/use-theme";
import { useFoodCartStore } from "@/src/store/food-cart-store";
import { useFavoritesStore } from "@/src/store/favorites-store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useMemo } from "react";
import * as Haptics from "expo-haptics";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MOCK_RESTAURANTS } from "../mocks";
import { useRestaurantMenu } from "../hooks/use-restaurant-menu";

export function RestaurantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { toggleFoodFavorite, isFoodFavorited } = useFavoritesStore();
  const { addItem, getItemCount, getTotal } = useFoodCartStore();
  
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedMenuCategory, setSelectedMenuCategory] = useState<string>("Tous");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const restaurant =
    MOCK_RESTAURANTS.find((r) => r.id === id) || MOCK_RESTAURANTS[0];
  const { foodItems, isLoading, error } = useRestaurantMenu(restaurant);
  const itemCount = getItemCount();
  const total = getTotal();

  // Extract all distinct menu categories for this restaurant
  const categoriesList = useMemo(() => {
    if (!foodItems || foodItems.length === 0) return ["Tous"];
    const cats = Array.from(new Set(foodItems.map((item) => item.category)));
    return ["Tous", "🔥 Populaires", ...cats];
  }, [foodItems]);

  // Filter items based on active category & search query
  const filteredFoodItems = useMemo(() => {
    return foodItems.filter((item) => {
      // Category match
      let matchesCat = true;
      if (selectedMenuCategory === "🔥 Populaires") {
        matchesCat = item.isPopular;
      } else if (selectedMenuCategory !== "Tous") {
        matchesCat = item.category === selectedMenuCategory;
      }

      // Search match
      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        matchesSearch =
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q);
      }

      return matchesCat && matchesSearch;
    });
  }, [foodItems, selectedMenuCategory, searchQuery]);

  const getQuantity = (itemId: string) => quantities[itemId] || 1;

  const updateQuantity = (itemId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[itemId] || 1;
      const newQty = Math.max(1, current + delta);
      return { ...prev, [itemId]: newQty };
    });
  };

  const handleAddItem = (item: any) => {
    const qty = getQuantity(item.id);
    addItem(
      {
        id: restaurant.id,
        name: restaurant.name,
        deliveryFee: restaurant.deliveryFee,
        minOrder: restaurant.minOrder,
      },
      {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: qty,
        imageUrl: item.image,
        extras: [],
      },
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Article ajouté 🛒", `${item.name} (x${qty}) a été ajouté à votre panier !`);
  };

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        {/* Top Navigation Bar */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Pressable
            style={[
              styles.backButton,
              { backgroundColor: theme.colors.surfaceElevated },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.textPrimary}
            />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <View style={styles.headerRight}>
            <Pressable
              style={[
                styles.headerButton,
                { backgroundColor: theme.colors.surfaceElevated },
              ]}
            >
              <Ionicons
                name="heart-outline"
                size={22}
                color={theme.colors.textPrimary}
              />
            </Pressable>
            <Pressable
              style={[
                styles.headerButton,
                { backgroundColor: theme.colors.surfaceElevated },
              ]}
            >
              <Ionicons
                name="share-outline"
                size={22}
                color={theme.colors.textPrimary}
              />
            </Pressable>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Cover Banner */}
          <View style={{ paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.md }}>
            <View style={styles.restaurantImageContainer}>
              <Image
                source={{ uri: restaurant.coverImage }}
                style={styles.restaurantImage}
              />
              {restaurant.tags && restaurant.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {restaurant.tags.map((tag, index) => (
                    <View
                      key={index}
                      style={[
                        styles.tag,
                        {
                          backgroundColor:
                            index === 0 ? "#FFC244" : "#00A082",
                        },
                      ]}
                    >
                      <Text style={[styles.tagText, { color: index === 0 ? "#000" : "#FFF" }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Restaurant Card Details */}
          <View style={{ paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.md }}>
            <GlassCard style={{ padding: theme.spacing.lg }}>
              <View style={styles.restaurantTopRow}>
                <Text style={[styles.restaurantName, { color: theme.colors.textPrimary }]}>
                  {restaurant.name}
                </Text>
                <View style={[styles.ratingBadge, { backgroundColor: "#FFC24420" }]}>
                  <Ionicons name="star" size={16} color="#FFC244" style={{ marginRight: 4 }} />
                  <Text style={[styles.ratingText, { color: theme.colors.textPrimary }]}>
                    {restaurant.rating}
                  </Text>
                </View>
              </View>
              <View style={styles.restaurantDetailsRow}>
                <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                  {restaurant.deliveryTime} min
                </Text>
                <View style={[styles.dot, { backgroundColor: theme.colors.border }]} />
                <Ionicons name="bicycle-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                  {restaurant.deliveryFee > 0 ? `${restaurant.deliveryFee.toFixed(3)} TND` : "Gratuite"}
                </Text>
                <View style={[styles.dot, { backgroundColor: theme.colors.border }]} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                  Min. {restaurant.minOrder.toFixed(3)} TND
                </Text>
              </View>
              <View style={styles.cuisineTags}>
                {restaurant.cuisineTypes.map((cuisine, idx) => (
                  <View
                    key={idx}
                    style={[styles.cuisineTag, { backgroundColor: theme.colors.surfaceElevated }]}
                  >
                    <Text style={[styles.cuisineTagText, { color: theme.colors.textSecondary }]}>
                      {cuisine}
                    </Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </View>

          {/* Menu Search Bar */}
          <View style={{ paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.sm }}>
            <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.searchInput, { color: theme.colors.textPrimary }]}
                placeholder={`Rechercher chez ${restaurant.name}...`}
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {Boolean(searchQuery) && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Menu Category Filter Tabs */}
          <View style={{ marginBottom: theme.spacing.md }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryTabsScroll}
            >
              {categoriesList.map((catName) => {
                const isActive = selectedMenuCategory === catName;
                return (
                  <Pressable
                    key={catName}
                    style={[
                      styles.categoryTab,
                      {
                        backgroundColor: isActive ? "#FFC244" : theme.colors.surface,
                        borderColor: isActive ? "#FFC244" : theme.colors.border,
                      },
                    ]}
                    onPress={() => setSelectedMenuCategory(catName)}
                  >
                    <Text
                      style={[
                        styles.categoryTabText,
                        { color: isActive ? "#000000" : theme.colors.textSecondary },
                      ]}
                    >
                      {catName}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Menu Items List */}
          <View style={{ paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.lg }}>
            <SectionTitle>
              {selectedMenuCategory === "Tous" ? "Menu Complet" : selectedMenuCategory}
            </SectionTitle>
            
            {isLoading && (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FFC244" />
                <Text style={{ marginTop: 10, color: theme.colors.textSecondary }}>Préparation du menu savoureux...</Text>
              </View>
            )}

            {error && (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.danger, textAlign: 'center' }}>{error}</Text>
              </View>
            )}

            {!isLoading && !error && filteredFoodItems.length === 0 && (
              <GlassCard style={{ padding: 30, alignItems: 'center' }}>
                <Ionicons name="fast-food-outline" size={40} color={theme.colors.textSecondary} style={{ marginBottom: 8 }} />
                <Text style={{ color: theme.colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
                  Aucun article trouvé
                </Text>
                <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', fontSize: 13 }}>
                  Essayez un autre mot-clé ou sélectionnez une autre catégorie.
                </Text>
              </GlassCard>
            )}

            {!isLoading && filteredFoodItems.map((item) => (
              <View key={item.id} style={{ marginBottom: theme.spacing.md }}>
                <GlassCard style={{ padding: theme.spacing.md }}>
                  <View style={styles.menuItem}>
                    <View style={styles.menuItemInfo}>
                      {item.isPopular && (
                        <View style={styles.popularBadge}>
                          <Text style={styles.popularText}>🔥 Populaires</Text>
                        </View>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '92%' }}>
                        <Text style={[styles.itemName, { color: theme.colors.textPrimary, flex: 1 }]}>
                          {item.name}
                        </Text>
                        <Pressable 
                          style={{ padding: 6, marginLeft: 8 }}
                          onPress={() => {
                            toggleFoodFavorite({
                              id: item.id,
                              name: item.name,
                              price: item.price,
                              description: item.description,
                              image: item.image,
                              restaurantId: restaurantId,
                              restaurantName: restaurant?.name,
                              deliveryFee: restaurant?.deliveryFee,
                              minOrder: restaurant?.minOrder
                            });
                          }}
                        >
                          <Ionicons 
                            name={isFoodFavorited(item.id) ? "heart" : "heart-outline"} 
                            size={20} 
                            color={isFoodFavorited(item.id) ? "#FF5353" : theme.colors.textSecondary} 
                          />
                        </Pressable>
                      </View>
                      <Text style={[styles.itemDescription, { color: theme.colors.textSecondary }]}>
                        {item.description}
                      </Text>
                      <Text style={[styles.itemPrice, { color: "#FFC244" }]}>
                        {item.price.toFixed(3)} TND
                      </Text>
                    </View>
                    <View style={styles.itemActions}>
                      {Boolean(item.image) && (
                        <Image source={{ uri: item.image }} style={styles.itemImage} />
                      )}
                      <View style={styles.quantityControls}>
                        <Pressable
                          style={[styles.quantityButton, { backgroundColor: theme.colors.surfaceElevated }]}
                          onPress={() => updateQuantity(item.id, -1)}
                        >
                          <Ionicons name="remove" size={16} color={theme.colors.textPrimary} />
                        </Pressable>
                        <Text style={[styles.quantityText, { color: theme.colors.textPrimary }]}>
                          {getQuantity(item.id)}
                        </Text>
                        <Pressable
                          style={[styles.quantityButton, { backgroundColor: "#FFC244" }]}
                          onPress={() => updateQuantity(item.id, 1)}
                        >
                          <Ionicons name="add" size={16} color="#000000" />
                        </Pressable>
                      </View>
                      <Pressable
                        style={[styles.addButton, { backgroundColor: "#FFC244" }]}
                        onPress={() => handleAddItem(item)}
                      >
                        <Ionicons name="cart" size={20} color="#000000" />
                      </Pressable>
                    </View>
                  </View>
                </GlassCard>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Floating Cart Button - Glovo Style */}
        {itemCount > 0 && (
          <View style={styles.cartContainer}>
            <Pressable
              style={[styles.cartButton, { backgroundColor: "#FFC244" }]}
              onPress={() => router.push("/food-delivery/cart" as any)}
            >
              <View style={styles.cartInfo}>
                <View style={[styles.cartCountBadge, { backgroundColor: "#000000" }]}>
                  <Text style={[styles.cartCount, { color: "#FFC244" }]}>{itemCount}</Text>
                </View>
                <Text style={[styles.cartButtonText, { color: "#000000" }]}>Voir le panier</Text>
              </View>
              <Text style={[styles.cartTotal, { color: "#000000" }]}>{total.toFixed(3)} TND</Text>
            </Pressable>
          </View>
        )}
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
    paddingVertical: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 120,
  },
  restaurantImageContainer: {
    position: "relative",
    borderRadius: 24,
    overflow: "hidden",
  },
  restaurantImage: {
    width: "100%",
    height: 200,
  },
  tagsContainer: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
  },
  restaurantTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: "800",
    flex: 1,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "800",
  },
  restaurantDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  detailText: {
    fontSize: 13,
    fontWeight: "500",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  cuisineTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cuisineTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cuisineTagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  categoryTabsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: "700",
  },
  menuItem: {
    flexDirection: "row",
    gap: 12,
  },
  menuItemInfo: {
    flex: 1,
  },
  popularBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FF3B30",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  popularText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 17,
    fontWeight: "800",
  },
  itemActions: {
    alignItems: "center",
    gap: 10,
  },
  itemImage: {
    width: 75,
    height: 75,
    borderRadius: 14,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "700",
    minWidth: 20,
    textAlign: "center",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  cartButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cartInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cartCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cartCount: {
    fontSize: 14,
    fontWeight: "800",
  },
  cartButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: "800",
  },
});
