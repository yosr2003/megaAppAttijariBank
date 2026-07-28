import {
    GlassCard,
    Input,
    Screen,
    SectionTitle,
} from "@/src/components/ui";
import { useTheme } from "@/src/hooks/use-theme";
import { useFormValidation } from "@/src/hooks/use-form-validation";
import { useFoodCartStore } from "@/src/store/food-cart-store";
import { V } from "@/src/utils/form-validation";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MOCK_ADDRESSES } from "../mocks";
import { dbService, WalletCard } from "@/src/services/db-service";
import { TEST_USER_ID } from "@/src/hooks/use-db";
import { FaceIdModal } from "../components/FaceIdModal";

type PaymentMethod = "wallet" | "card" | "cash";
type DeliveryTimeMode = "now" | "schedule";

export function OrderScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { errors, validate, clearError } = useFormValidation();
  const { items, clearCart, getSubtotal, getTotal, restaurant } = useFoodCartStore();

  // Address & Time State
  const [selectedAddressId, setSelectedAddressId] = useState(
    MOCK_ADDRESSES.find((a) => a.isDefault)?.id || MOCK_ADDRESSES[0].id,
  );
  const [deliveryTimeMode, setDeliveryTimeMode] = useState<DeliveryTimeMode>("now");
  const [scheduledTime, setScheduledTime] = useState("Aujourd'hui · 20:30");

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wallet");
  const [userCards, setUserCards] = useState<WalletCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  // Promo Code State
  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isPromoApplied, setIsPromoApplied] = useState(false);

  // Face ID Modal State
  const [isFaceIdVisible, setIsFaceIdVisible] = useState(false);

  const subtotal = getSubtotal();
  const deliveryFee = restaurant?.deliveryFee || 0;
  const finalTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

  // Fetch Saved Cards & Wallet Balance
  const loadCards = async () => {
    try {
      const cards = await dbService.getCards(TEST_USER_ID);
      setUserCards(cards);
      if (cards.length > 0 && !selectedCardId) {
        setSelectedCardId(cards[0].id || null);
      }
    } catch (e) {
      console.error("Failed to fetch cards:", e);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  useEffect(() => {
    if (!items.length) {
      router.back();
    }
  }, [items.length, router]);

  const activeCard = userCards.find((c) => c.id === selectedCardId) || userCards[0];
  const primaryWalletBalance = userCards.reduce((acc, c) => acc + (c.balance || 0), 0);
  const hasSufficientWalletBalance = primaryWalletBalance >= finalTotal;

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === "TOUNSI") {
      setDiscountAmount(3.0);
      setIsPromoApplied(true);
      Alert.alert("Code Promo Appliqué 🎉", "Réduction de 3.000 TND appliquée !");
    } else {
      Alert.alert("Code Promo Invalide", "Utilisez le code 'TOUNSI' pour tester.");
    }
  };

  const handleStartPayment = () => {
    const isValid = validate({
      selectedAddressId: {
        value: selectedAddressId,
        rules: [V.required('Adresse de livraison')],
      },
      notes: { value: notes, rules: [V.orderNotes] },
    });
    if (!isValid) return;

    if (!items.length) {
      Alert.alert('Panier vide', 'Ajoutez des articles avant de commander.');
      return;
    }

    if (paymentMethod === 'wallet' && !hasSufficientWalletBalance) {
      Alert.alert(
        'Solde Insuffisant',
        `Le solde de votre portefeuille (${primaryWalletBalance.toFixed(3)} TND) est insuffisant pour régler ${finalTotal.toFixed(3)} TND.`
      );
      return;
    }

    if (paymentMethod === 'card' && !selectedCardId) {
      Alert.alert('Aucune carte sélectionnée', 'Veuillez choisir une carte bancaire.');
      return;
    }

    // Trigger Apple Face ID Modal
    setIsFaceIdVisible(true);
  };

  const handleFaceIdSuccess = async () => {
    setIsFaceIdVisible(false);

    try {
      const selectedAddress = MOCK_ADDRESSES.find((a) => a.id === selectedAddressId)?.address || "La Marsa, Tunis";
      const chosenDeliveryTime = deliveryTimeMode === "now" ? "Maintenant (25-35 min)" : scheduledTime;

      // Deduct card balance if paying by card or wallet
      if (paymentMethod === 'card' && activeCard?.id) {
        const newBal = Math.max(0, activeCard.balance - finalTotal);
        await dbService.updateCardBalance(activeCard.id, newBal);
      } else if (paymentMethod === 'wallet' && userCards[0]?.id) {
        const newBal = Math.max(0, userCards[0].balance - finalTotal);
        await dbService.updateCardBalance(userCards[0].id, newBal);
      }

      // Persist Order, Items, Payment, and Transaction with Receipt JSON
      await dbService.createOrderWithPayment(
        {
          user_id: TEST_USER_ID,
          restaurant_name: restaurant?.name || "Restaurant",
          delivery_address: selectedAddress,
          delivery_time: chosenDeliveryTime,
          subtotal,
          delivery_fee: deliveryFee,
          discount: discountAmount,
          total: finalTotal,
          payment_method: paymentMethod.toUpperCase() as any,
          card_used_title: paymentMethod === 'card' ? `Visa •••• ${activeCard?.card_number?.slice(-4) || '4589'}` : 'SuperTounsi Wallet',
          status: 'CONFIRMED',
        },
        items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
        {
          card_id: paymentMethod === 'card' ? activeCard?.id : undefined,
          payment_method: paymentMethod.toUpperCase() as any,
          amount: finalTotal,
        }
      );

      clearCart();
      router.replace("/food-delivery/order-tracking" as any);
    } catch (err) {
      console.error("Order completion failed:", err);
      Alert.alert("Erreur", "Impossible de valider la commande.");
    }
  };

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Pressable
            style={[styles.backButton, { backgroundColor: theme.colors.surfaceElevated }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            Confirmer la commande
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* 1. Delivery Address */}
          <View style={{ paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.md }}>
            <SectionTitle title="Adresse de livraison" />
            {MOCK_ADDRESSES.map((address) => (
              <Pressable
                key={address.id}
                onPress={() => {
                  setSelectedAddressId(address.id);
                  clearError('selectedAddressId');
                }}
                style={{ marginBottom: theme.spacing.sm }}
              >
                <GlassCard
                  style={{
                    padding: theme.spacing.md,
                    borderWidth: 2,
                    borderColor: selectedAddressId === address.id ? "#FFC244" : "transparent",
                  }}
                >
                  <View style={styles.addressRow}>
                    <Ionicons
                      name={address.id === selectedAddressId ? "radio-button-on" : "radio-button-off"}
                      size={24}
                      color={selectedAddressId === address.id ? "#FFC244" : theme.colors.textSecondary}
                    />
                    <View style={styles.addressDetails}>
                      <Text style={[styles.addressLabel, { color: theme.colors.textPrimary }]}>
                        {address.label}
                      </Text>
                      <Text style={[styles.addressText, { color: theme.colors.textSecondary }]}>
                        {address.address}
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              </Pressable>
            ))}
          </View>

          {/* 2. Delivery Time */}
          <View style={{ paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.md }}>
            <SectionTitle title="Heure de livraison" />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                style={[
                  styles.timeTab,
                  deliveryTimeMode === "now" && styles.timeTabActive,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => setDeliveryTimeMode("now")}
              >
                <Ionicons
                  name="flash-outline"
                  size={20}
                  color={deliveryTimeMode === "now" ? "#000000" : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.timeTabText,
                    { color: deliveryTimeMode === "now" ? "#000000" : theme.colors.textSecondary },
                  ]}
                >
                  Maintenant (25-35 min)
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.timeTab,
                  deliveryTimeMode === "schedule" && styles.timeTabActive,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => setDeliveryTimeMode("schedule")}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={deliveryTimeMode === "schedule" ? "#000000" : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.timeTabText,
                    { color: deliveryTimeMode === "schedule" ? "#000000" : theme.colors.textSecondary },
                  ]}
                >
                  Planifier
                </Text>
              </Pressable>
            </View>
          </View>

          {/* 3. Payment Method Selection */}
          <View style={{ paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.md }}>
            <SectionTitle title="Moyen de paiement" />
            
            {/* Payment Tabs */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
              {[
                { id: "wallet", label: "Portefeuille", icon: "wallet-outline" },
                { id: "card", label: "Carte Bancaire", icon: "card-outline" },
                { id: "cash", label: "Espèces", icon: "cash-outline" },
              ].map((method) => (
                <Pressable
                  key={method.id}
                  onPress={() => setPaymentMethod(method.id as PaymentMethod)}
                  style={[
                    styles.paymentOptionBtn,
                    paymentMethod === method.id && styles.paymentOptionBtnActive,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <Ionicons
                    name={method.icon as any}
                    size={22}
                    color={paymentMethod === method.id ? "#000000" : theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.paymentOptionText,
                      { color: paymentMethod === method.id ? "#000000" : theme.colors.textSecondary },
                    ]}
                  >
                    {method.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Wallet Details View */}
            {paymentMethod === 'wallet' && (
              <GlassCard style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Solde Portefeuille SuperTounsi</Text>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: theme.colors.textPrimary }}>
                    {primaryWalletBalance.toFixed(3)} TND
                  </Text>
                </View>
                {hasSufficientWalletBalance ? (
                  <View style={styles.successBanner}>
                    <Ionicons name="checkmark-circle" size={18} color="#00A082" />
                    <Text style={{ color: "#00A082", fontWeight: '700', fontSize: 13 }}>
                      ✓ Le paiement sera directement prélevé sur votre solde.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.dangerBanner}>
                    <Ionicons name="alert-circle" size={18} color="#FF3B30" />
                    <Text style={{ color: "#FF3B30", fontWeight: '700', fontSize: 13 }}>
                      Solde Insuffisant. Veuillez recharger votre portefeuille ou choisir une carte.
                    </Text>
                  </View>
                )}
              </GlassCard>
            )}

            {/* Bank Card Selector View */}
            {paymentMethod === 'card' && (
              <View style={{ gap: 10 }}>
                {userCards.map((card) => {
                  const isSelected = selectedCardId === card.id;
                  return (
                    <Pressable
                      key={card.id}
                      onPress={() => setSelectedCardId(card.id || null)}
                    >
                      <GlassCard
                        style={[
                          styles.cardItemBox,
                          isSelected && styles.cardItemBoxSelected,
                        ]}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                          <Ionicons
                            name="card"
                            size={28}
                            color={isSelected ? "#FFC244" : theme.colors.textSecondary}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary }}>
                              {card.card_type} •••• {card.card_number.slice(-4)}
                            </Text>
                            <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>
                              Expire {card.expiry_date} · Solde: {card.balance.toFixed(3)} TND
                            </Text>
                          </View>
                          <Ionicons
                            name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                            size={24}
                            color={isSelected ? "#FFC244" : theme.colors.border}
                          />
                        </View>
                      </GlassCard>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* 4. Promo Code */}
          <View style={{ paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.md }}>
            <SectionTitle title="Code Promo" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Input
                  placeholder="Tapez 'TOUNSI' pour 3.000 TND de réduction"
                  value={promoCode}
                  onChangeText={setPromoCode}
                  autoCapitalize="characters"
                />
              </View>
              <Pressable style={styles.applyBtn} onPress={handleApplyPromo}>
                <Text style={styles.applyBtnText}>Appliquer</Text>
              </Pressable>
            </View>
          </View>

          {/* 5. Order Summary */}
          <View style={{ paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.xl }}>
            <GlassCard style={{ padding: theme.spacing.lg }}>
              <SectionTitle title="Résumé de la commande" style={{ marginBottom: theme.spacing.md }} />
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Sous-total</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>{subtotal.toFixed(3)} TND</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Frais de livraison</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>
                  {deliveryFee > 0 ? `${deliveryFee.toFixed(3)} TND` : "Gratuite"}
                </Text>
              </View>

              {isPromoApplied && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: "#00A082", fontWeight: '700' }]}>Réduction Code Promo</Text>
                  <Text style={[styles.summaryValue, { color: "#00A082", fontWeight: '800' }]}>
                    -3.000 TND
                  </Text>
                </View>
              )}

              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: theme.colors.textPrimary }]}>Total à Payer</Text>
                <Text style={[styles.totalValue, { color: "#FFC244" }]}>{finalTotal.toFixed(3)} TND</Text>
              </View>
            </GlassCard>
          </View>
        </ScrollView>

        {/* 6. Apple Pay & Glovo Button */}
        <View style={styles.confirmContainer}>
          <Pressable style={styles.glovoButton} onPress={handleStartPayment}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="scan-outline" size={22} color="#000000" />
              <Text style={styles.glovoButtonText}>Payer avec Face ID</Text>
            </View>
            <Text style={styles.glovoButtonText}>{finalTotal.toFixed(3)} TND</Text>
          </Pressable>
        </View>

        {/* Apple Face ID Confirmation Modal */}
        <FaceIdModal
          visible={isFaceIdVisible}
          amountText={`${finalTotal.toFixed(3)} TND`}
          restaurantName={restaurant?.name || "Burger House"}
          paymentMethodText={
            paymentMethod === 'card'
              ? `${activeCard?.card_type || 'Visa'} •••• ${activeCard?.card_number?.slice(-4) || '4589'}`
              : 'SuperTounsi Wallet'
          }
          onSuccess={handleFaceIdSuccess}
          onCancel={() => setIsFaceIdVisible(false)}
        />
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
  scrollContent: {
    paddingBottom: 90,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  addressDetails: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
  },
  timeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  timeTabActive: {
    backgroundColor: '#FFC244',
    borderColor: '#FFC244',
  },
  timeTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  paymentOptionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    gap: 6,
  },
  paymentOptionBtnActive: {
    backgroundColor: '#FFC244',
    borderColor: '#FFC244',
  },
  paymentOptionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardItemBox: {
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardItemBoxSelected: {
    borderColor: '#FFC244',
    shadowColor: '#FFC244',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#00A08215',
  },
  dangerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FF3B3015',
  },
  applyBtn: {
    backgroundColor: '#FFC244',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 16,
  },
  applyBtnText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 14,
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
  confirmContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "transparent",
  },
  glovoButton: {
    backgroundColor: "#FFC244",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 30,
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
});
