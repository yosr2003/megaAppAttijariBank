import { GlassCard, Screen, SectionTitle } from "@/src/components/ui";
import { useTheme } from "@/src/hooks/use-theme";
import { useFoodCartStore } from "@/src/store/food-cart-store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MOCK_RESTAURANTS } from "../mocks";
import { useRestaurantMenu } from "../hooks/use-restaurant-menu";

export function RestaurantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { addItem, getItemCount, getTotal } = useFoodCartStore();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const restaurant =
    MOCK_RESTAURANTS.find((r) => r.id === id) || MOCK_RESTAURANTS[0];
  const { foodItems, isLoading, error } = useRestaurantMenu(restaurant);
  const itemCount = getItemCount();
  const total = getTotal();

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
    Alert.alert("Article ajouté 🛒", `${item.name} (x${qty}) a été ajouté à votre panier !`);
  };

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View
          style={[styles.header, { backgroundColor: theme.colors.surface }]}
        >
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
          <View style={styles.headerRight}>
            <Pressable
              style={[
                styles.headerButton,
                { backgroundColor: theme.colors.surfaceElevated },
              ]}
            >
              <Ionicons
                name="heart-outline"
                size={24}
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
                size={24}
                color={theme.colors.textPrimary}
              />
            </Pressable>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Restaurant Header Image */}
          <View
            style={{
              paddingHorizontal: theme.spacing.md,
              marginBottom: theme.spacing.md,
            }}
          >
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
          </View>

          {/* Restaurant Info */}
          <View
            style={{
              paddingHorizontal: theme.spacing.md,
              marginBottom: theme.spacing.md,
            }}
          >
            <GlassCard style={{ padding: theme.spacing.lg }}>
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
                    size={16}
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
                  size={16}
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
                  style={[styles.dot, { backgroundColor: theme.colors.border }]}
                />
                <Ionicons
                  name="bicycle-outline"
                  size={16}
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
              <View style={styles.cuisineTags}>
                {restaurant.cuisineTypes.map((cuisine, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.cuisineTag,
                      { backgroundColor: theme.colors.surfaceElevated },
                    ]}
                  >
                    <Text
                      style={[
                        styles.cuisineTagText,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {cuisine}
                    </Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </View>

          {/* Menu */}
          <View
            style={{
              paddingHorizontal: theme.spacing.md,
              marginBottom: theme.spacing.lg,
            }}
          >
            <SectionTitle>Menu</SectionTitle>
            
            {isLoading && (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ marginTop: 10, color: theme.colors.textSecondary }}>Loading delicious meals...</Text>
              </View>
            )}

            {error && (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.danger, textAlign: 'center' }}>{error}</Text>
              </View>
            )}

            {!isLoading && !error && foodItems.length === 0 && (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>No menu items available.</Text>
              </View>
            )}

            {!isLoading && foodItems.map((item) => (
              <View key={item.id} style={{ marginBottom: theme.spacing.md }}>
                <GlassCard style={{ padding: theme.spacing.md }}>
                  <View style={styles.menuItem}>
                    <View style={styles.menuItemInfo}>
                      {item.isPopular && (
                        <View
                          style={[
                            styles.popularBadge,
                            { backgroundColor: theme.colors.danger },
                          ]}
                        >
                          <Text style={styles.popularText}>Populaire</Text>
                        </View>
                      )}
                      <Text
                        style={[
                          styles.itemName,
                          { color: theme.colors.textPrimary },
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          styles.itemDescription,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        {item.description}
                      </Text>
                      <Text
                        style={[
                          styles.itemPrice,
                          { color: theme.colors.primary },
                        ]}
                      >
                        {item.price.toFixed(3)} TND
                      </Text>
                    </View>
                    <View style={styles.itemActions}>
                      {item.image && (
                        <Image
                          source={{ uri: item.image }}
                          style={styles.itemImage}
                        />
                      )}
                      <View style={styles.quantityControls}>
                        <Pressable
                          style={[
                            styles.quantityButton,
                            { backgroundColor: theme.colors.surfaceElevated },
                          ]}
                          onPress={() => updateQuantity(item.id, -1)}
                        >
                          <Ionicons
                            name="remove"
                            size={16}
                            color={theme.colors.textPrimary}
                          />
                        </Pressable>
                        <Text
                          style={[
                            styles.quantityText,
                            { color: theme.colors.textPrimary },
                          ]}
                        >
                          {getQuantity(item.id)}
                        </Text>
                        <Pressable
                          style={[
                            styles.quantityButton,
                            { backgroundColor: "#FFC244" },
                          ]}
                          onPress={() => updateQuantity(item.id, 1)}
                        >
                          <Ionicons
                            name="add"
                            size={16}
                            color="#000000"
                          />
                        </Pressable>
                      </View>
                      <Pressable
                        style={[
                          styles.addButton,
                          { backgroundColor: "#FFC244" },
                        ]}
                        onPress={() => handleAddItem(item)}
                      >
                        <Ionicons
                          name="cart"
                          size={20}
                          color="#000000"
                        />
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
              style={[
                styles.cartButton,
                { backgroundColor: "#FFC244" },
              ]}
              onPress={() => router.push("/food-delivery/cart" as any)}
            >
              <View style={styles.cartInfo}>
                <View
                  style={[
                    styles.cartCountBadge,
                    { backgroundColor: "#000000" },
                  ]}
                >
                  <Text
                    style={[styles.cartCount, { color: "#FFC244" }]}
                  >
                    {itemCount}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.cartButtonText,
                    { color: "#000000" },
                  ]}
                >
                  Voir le panier
                </Text>
              </View>
              <Text
                style={[styles.cartTotal, { color: "#000000" }]}
              >
                {total.toFixed(3)} TND
              </Text>
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
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    height: 220,
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
  restaurantTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: "800",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "700",
  },
  restaurantDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 15,
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
    fontSize: 13,
    fontWeight: "500",
  },
  menuItem: {
    flexDirection: "row",
  },
  menuItemInfo: {
    flex: 1,
  },
  popularBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  popularText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  itemName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: "800",
  },
  itemActions: {
    alignItems: "center",
    gap: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "700",
    minWidth: 24,
    textAlign: "center",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 20,
    fontWeight: "800",
  },
});
