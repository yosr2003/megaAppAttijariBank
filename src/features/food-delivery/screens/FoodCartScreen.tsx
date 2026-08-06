import {
  GlassCard,
  PrimaryButton,
  Screen,
  SectionTitle,
} from "@/src/components/ui";
import { useTheme } from "@/src/hooks/use-theme";
import { useFoodCartStore } from "@/src/store/food-cart-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function FoodCartScreen() {
  const router = useRouter();
  const theme = useTheme();
  const {
    restaurant,
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    addItem,
  } = useFoodCartStore();

  const subtotal = getSubtotal();
  const deliveryFee = restaurant?.deliveryFee || 0;
  const serviceFee = 0.500;
  const taxAmount = subtotal * 0.07; // 7% TVA
  const total = subtotal + deliveryFee + serviceFee;

  if (!restaurant || items.length === 0) {
    return (
      <Screen>
        <SafeAreaView edges={["top"]}>
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
            <Text
              style={[styles.headerTitle, { color: theme.colors.textPrimary }]}
            >
              Panier
            </Text>
            <View style={{ width: 44 }} />
          </View>
          <View style={styles.emptyContainer}>
            <Ionicons
              name="cart-outline"
              size={80}
              color={theme.colors.textSecondary}
            />
            <Text
              style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}
            >
              Votre panier est vide
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              Ajoutez des articles pour commencer votre commande
            </Text>
            <PrimaryButton
              title="Commencer à commander"
              onPress={() => router.push("/food-delivery" as any)}
              style={{ marginTop: 32 }}
            />
          </View>
        </SafeAreaView>
      </Screen>
    );
  }

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
          <Text
            style={[styles.headerTitle, { color: theme.colors.textPrimary }]}
          >
            Panier
          </Text>
          <Pressable
            style={[
              styles.clearButton,
              { backgroundColor: theme.colors.surfaceElevated },
            ]}
            onPress={clearCart}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={theme.colors.danger}
            />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Restaurant Info */}
          <View
            style={{
              paddingHorizontal: theme.spacing.md,
              marginBottom: theme.spacing.md,
            }}
          >
            <GlassCard style={{ padding: theme.spacing.md }}>
              <View style={styles.restaurantRow}>
                <Ionicons
                  name="storefront-outline"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text
                  style={[
                    styles.restaurantName,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {restaurant.name}
                </Text>
              </View>
            </GlassCard>
          </View>

          {/* Cart Items */}
          <View
            style={{
              paddingHorizontal: theme.spacing.md,
              marginBottom: theme.spacing.md,
            }}
          >
            <SectionTitle>Vos articles</SectionTitle>
            {items.map((item, index) => (
              <View
                key={`${item.menuItemId}-${index}`}
                style={{ marginBottom: theme.spacing.md }}
              >
                <GlassCard style={{ padding: theme.spacing.md }}>
                  <View style={styles.cartItem}>
                    {item.imageUrl && (
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.itemImage}
                      />
                    )}
                    <View style={styles.itemDetails}>
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
                          styles.itemPrice,
                          { color: theme.colors.primary },
                        ]}
                      >
                        {(item.price * item.quantity).toFixed(3)} TND
                      </Text>
                    </View>
                    <View style={styles.itemActions}>
                      <View style={styles.quantityControls}>
                        <Pressable
                          style={[
                            styles.quantityButton,
                            { backgroundColor: theme.colors.surfaceElevated },
                          ]}
                          onPress={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
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
                          {item.quantity}
                        </Text>
                        <Pressable
                          style={[
                            styles.quantityButton,
                            { backgroundColor: theme.colors.primary },
                          ]}
                          onPress={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Ionicons
                            name="add"
                            size={16}
                            color={theme.colors.primaryOn}
                          />
                        </Pressable>
                      </View>
                      <Pressable
                        style={[
                          styles.removeButton,
                          { backgroundColor: theme.colors.surfaceElevated },
                        ]}
                        onPress={() => removeItem(item.id)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color={theme.colors.danger}
                        />
                      </Pressable>
                    </View>
                  </View>
                </GlassCard>
              </View>
            ))}
          </View>

          {/* Cross-Selling Recommendations */}
          <View style={{ paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.md }}>
            <SectionTitle>Souvent acheté ensemble 🍟</SectionTitle>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
              {[
                { id: "991", name: "Frites Croustillantes", price: 3.500, icon: "🍟", desc: "Portion dorée salée" },
                { id: "992", name: "Coca-Cola Canette", price: 2.200, icon: "🥤", desc: "Soda frais 33cl" },
                { id: "993", name: "Sauce Harissa Arbi", price: 1.000, icon: "🌶️", desc: "Piquante faite maison" }
              ].map((rec) => {
                // If item already in cart, don't show or style differently
                const isInCart = items.some(i => i.menuItemId === rec.id);
                return (
                  <Pressable
                    key={rec.id}
                    onPress={() => {
                      if (restaurant) {
                        addItem(restaurant, {
                          menuItemId: rec.id,
                          name: rec.name,
                          price: rec.price,
                          quantity: 1,
                          extras: []
                        });
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                    style={{
                      width: 140,
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border + '50',
                      borderWidth: 1,
                      borderRadius: 16,
                      padding: 12,
                      gap: 4
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{rec.icon}</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.textPrimary }} numberOfLines={1}>{rec.name}</Text>
                    <Text style={{ fontSize: 11, color: theme.colors.textSecondary }}>{rec.desc}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: theme.colors.primary }}>{rec.price.toFixed(3)} DT</Text>
                      <View style={{ backgroundColor: theme.colors.primary + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: theme.colors.primary }}>Ajouter +</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Order Summary */}
          <View
            style={{
              paddingHorizontal: theme.spacing.md,
              marginBottom: theme.spacing.xl,
            }}
          >
            <GlassCard style={{ padding: theme.spacing.lg }}>
              <SectionTitle style={{ marginBottom: theme.spacing.md }}>
                Résumé de la commande
              </SectionTitle>
              <View style={styles.summaryRow}>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Sous-total
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {subtotal.toFixed(3)} TND
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Livraison
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {deliveryFee > 0
                    ? `${deliveryFee.toFixed(3)} TND`
                    : "Gratuite"}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Frais de service SuperTounsi
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {serviceFee.toFixed(3)} TND
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: theme.colors.textSecondary, fontStyle: 'italic' },
                  ]}
                >
                  TVA incluse (7%)
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: theme.colors.textSecondary, fontStyle: 'italic' },
                  ]}
                >
                  {taxAmount.toFixed(3)} TND
                </Text>
              </View>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: theme.colors.border },
                ]}
              />
              <View style={styles.totalRow}>
                <Text
                  style={[
                    styles.totalLabel,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Total
                </Text>
                <Text
                  style={[styles.totalValue, { color: theme.colors.primary }]}
                >
                  {total.toFixed(3)} TND
                </Text>
              </View>
            </GlassCard>
          </View>
        </ScrollView>

        {/* Checkout Button - Glovo Style */}
        <View style={styles.checkoutContainer}>
          <Pressable
            style={styles.glovoButton}
            onPress={() => router.push("/food-delivery/order" as any)}
          >
            <Text style={styles.glovoButtonText}>
              Commander
            </Text>
            <Text style={styles.glovoButtonTotal}>
              {total.toFixed(3)} TND
            </Text>
          </Pressable>
        </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  clearButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  restaurantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "700",
  },
  cartItem: {
    flexDirection: "row",
    gap: 16,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 16,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "700",
  },
  itemActions: {
    alignItems: "center",
    gap: 8,
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
    minWidth: 24,
    textAlign: "center",
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "800",
  },
  checkoutContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "transparent",
  },
  glovoButton: {
    backgroundColor: "#FFC244", // Glovo Yellow
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 30, // Extremely rounded like Glovo
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#FFC244",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  glovoButtonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "800",
  },
  glovoButtonTotal: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "800",
  },
});
