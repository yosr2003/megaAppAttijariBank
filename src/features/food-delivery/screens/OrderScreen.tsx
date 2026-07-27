import {
    GlassCard,
    Input,
    PrimaryButton,
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

type PaymentMethod = "wallet" | "card" | "cash";

export function OrderScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { errors, validate, clearError } = useFormValidation();
  const { items, clearCart, getSubtotal, getTotal, getDeliveryFee } =
    useFoodCartStore();
  const [selectedAddressId, setSelectedAddressId] = useState(
    MOCK_ADDRESSES.find((a) => a.isDefault)?.id || MOCK_ADDRESSES[0].id,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wallet");
  const [notes, setNotes] = useState("");

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  useEffect(() => {
    if (!items.length) {
      router.back();
    }
  }, [items.length, router]);

  const handleConfirmOrder = () => {
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

    clearCart();
    router.replace("/food-delivery/success" as any);
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
          <Text
            style={[styles.headerTitle, { color: theme.colors.textPrimary }]}
          >
            Confirmer la commande
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Delivery Address */}
          <View
            style={{
              paddingHorizontal: theme.spacing.md,
              marginBottom: theme.spacing.md,
            }}
          >
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
                    borderColor:
                      selectedAddressId === address.id
                        ? theme.colors.primary
                        : "transparent",
                  }}
                >
                  <View style={styles.addressRow}>
                    <Ionicons
                      name={
                        address.id === selectedAddressId
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={24}
                      color={
                        selectedAddressId === address.id
                          ? theme.colors.primary
                          : theme.colors.textSecondary
                      }
                    />
                    <View style={styles.addressDetails}>
                      <Text
                        style={[
                          styles.addressLabel,
                          { color: theme.colors.textPrimary },
                        ]}
                      >
                        {address.label}
                      </Text>
                      <Text
                        style={[
                          styles.addressText,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        {address.address}
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              </Pressable>
            ))}
            {errors.selectedAddressId ? (
              <Text style={{ color: theme.colors.danger, fontSize: 12, marginTop: 4 }}>
                {errors.selectedAddressId}
              </Text>
            ) : null}
          </View>

          {/* Payment Method */}
          <View
            style={{
              paddingHorizontal: theme.spacing.md,
              marginBottom: theme.spacing.md,
            }}
          >
            <SectionTitle title="Moyen de paiement" />
            <View
              style={{
                flexDirection: "row",
                gap: theme.spacing.sm,
                flexWrap: "wrap",
              }}
            >
              {[
                { id: "wallet", label: "Portefeuille", icon: "wallet-outline" },
                { id: "card", label: "Carte bancaire", icon: "card-outline" },
                { id: "cash", label: "Espèces", icon: "cash-outline" },
              ].map((method) => (
                <Pressable
                  key={method.id}
                  onPress={() => setPaymentMethod(method.id as PaymentMethod)}
                  style={{ flex: 1, minWidth: "30%" }}
                >
                  <GlassCard
                    style={{
                      padding: theme.spacing.md,
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor:
                        paymentMethod === method.id
                          ? theme.colors.primary
                          : "transparent",
                    }}
                  >
                    <Ionicons
                      name={method.icon as any}
                      size={28}
                      color={
                        paymentMethod === method.id
                          ? theme.colors.primary
                          : theme.colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.paymentLabel,
                        {
                          color:
                            paymentMethod === method.id
                              ? theme.colors.primary
                              : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      {method.label}
                    </Text>
                  </GlassCard>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View
            style={{
              paddingHorizontal: theme.spacing.md,
              marginBottom: theme.spacing.md,
            }}
          >
            <SectionTitle title="Note pour la livraison" />
            <GlassCard style={{ padding: theme.spacing.md }}>
              <Input
                placeholder="Ajouter une note (ex: appartement 3ème étage)"
                value={notes}
                onChangeText={(text) => {
                  setNotes(text);
                  clearError('notes');
                }}
                error={errors.notes}
                maxLength={200}
                multiline
              />
            </GlassCard>
          </View>

          {/* Order Summary */}
          <View
            style={{
              paddingHorizontal: theme.spacing.md,
              marginBottom: theme.spacing.xl,
            }}
          >
            <GlassCard style={{ padding: theme.spacing.lg }}>
              <SectionTitle
                title="Résumé de la commande"
                style={{ marginBottom: theme.spacing.md }}
              />
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

        {/* Confirm Button */}
        <View style={styles.confirmContainer}>
          <PrimaryButton
            title="Confirmer la commande"
            onPress={handleConfirmOrder}
            size="large"
          />
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
  scrollContent: {
    paddingBottom: 40,
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
  paymentLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
  },
  notesInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notesText: {
    fontSize: 14,
    flex: 1,
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
  },
});
