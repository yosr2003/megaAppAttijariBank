import Ionicons from "@expo/vector-icons/Ionicons";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton, StarField } from "@/src/components/ui";
import { useDb } from "@/src/hooks/use-db";
import { useFormValidation } from "@/src/hooks/use-form-validation";
import { dbService, WalletCard } from "@/src/services/db-service";
import { format, V } from "@/src/utils/form-validation";

interface FlipCardProps {
  card: WalletCard;
  onDelete: (id: string) => void;
}

const FlipCard = ({ card, onDelete }: FlipCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const flipToBack = () => {
    Animated.timing(animatedValue, {
      toValue: 180,
      duration: 400,
      useNativeDriver: true,
    }).start(() => setIsFlipped(true));
  };

  const flipToFront = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => setIsFlipped(false));
  };

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <View style={styles.flipCardContainer}>
      <Pressable onPress={isFlipped ? flipToFront : flipToBack}>
        <Animated.View
          style={[styles.cardContainer, styles.cardFront, frontAnimatedStyle]}
        >
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={[styles.gridLineH, { top: "25%" }]} />
            <View style={[styles.gridLineH, { top: "50%" }]} />
            <View style={[styles.gridLineH, { top: "75%" }]} />
            <View style={[styles.gridLineV, { left: "25%" }]} />
            <View style={[styles.gridLineV, { left: "50%" }]} />
            <View style={[styles.gridLineV, { left: "75%" }]} />
          </View>
          <View style={styles.cardHeader}>
            <View style={styles.cardLogoSection}>
              <Text style={styles.cardLogoText}>
                {card.card_type === "Platinum"
                  ? "SuperTounsi Platinum"
                  : "SuperTounsi Gold"}
              </Text>
            </View>
            <Ionicons
              name="wifi"
              size={20}
              color="#F7FAFF"
              style={styles.wifiIcon}
            />
          </View>
          <View style={styles.chipContainer}>
            <View style={styles.goldChip}>
              <View style={styles.chipLineH} />
              <View style={styles.chipLineV} />
            </View>
          </View>
          <View style={styles.cardNumberContainer}>
            {card.card_number.split(" ").map((chunk, index) => (
              <Text
                key={index}
                style={
                  chunk === "••••"
                    ? styles.cardNumberDots
                    : styles.cardNumberText
                }
              >
                {chunk}
              </Text>
            ))}
          </View>
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardFooterLabel}>CARD HOLDER</Text>
              <Text style={styles.cardholderName}>{card.cardholder_name}</Text>
            </View>
            <View style={styles.expirySection}>
              <View style={styles.expiryLabels}>
                <Text style={styles.cardFooterLabel}>EXPIRES</Text>
                <Text style={styles.expiryDate}>{card.expiry_date}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
        <Animated.View
          style={[
            styles.cardContainer,
            styles.cardBack,
            backAnimatedStyle,
            { position: "absolute", top: 0, left: 0 },
          ]}
        >
          <View style={styles.magneticStrip} />
          <View style={styles.cvvSection}>
            <View style={styles.signatureStrip} />
            <View style={styles.cvvBox}>
              <Text style={styles.cvvText}>
                ••• {card.id ? card.id.slice(-3) : "123"}
              </Text>
            </View>
          </View>
          <Text style={styles.backNote}>Tap to flip back</Text>
        </Animated.View>
      </Pressable>
      <Pressable
        style={styles.deleteButton}
        onPress={() => {
          Alert.alert(
            "Delete Card",
            "Are you sure you want to delete this card?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => onDelete(card.id!),
              },
            ],
          );
        }}
      >
        <Ionicons name="trash-outline" size={20} color="#F7FAFF" />
      </Pressable>
    </View>
  );
};

export function CardsScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { userId, isReady } = useDb();
  const { errors, validate, clearError, clearAll } = useFormValidation();
  const [cards, setCards] = useState<WalletCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cardType, setCardType] = useState<"Platinum" | "Gold">("Platinum");
  const [balance, setBalance] = useState("");

  const fetchCards = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const userCards = await dbService.getCards(userId);
      setCards(userCards);
    } catch (e) {
      console.error("Error loading cards:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady && userId && isFocused) {
      fetchCards();
    }
  }, [isReady, userId, isFocused]);

  const handleDeleteCard = async (id: string) => {
    try {
      await dbService.deleteCard(id);
      fetchCards();
    } catch (e) {
      console.error("Error deleting card:", e);
    }
  };

  const handleAddCard = async () => {
    if (!userId) return;

    const isValid = validate({
      cardNumber: { value: cardNumber, rules: [V.cardNumber] },
      cardholderName: { value: cardholderName, rules: [V.cardholderName] },
      expiryDate: { value: expiryDate, rules: [V.cardExpiry] },
      balance: { value: balance, rules: [V.tndAmount({ min: 0, allowZero: true, max: 999_999_999 })] },
    });
    if (!isValid) return;

    const digits = cardNumber.replace(/\D/g, '');
    const formattedCardNumber = digits.replace(/(.{4})(?=.)/g, "$1 •••• •••• ");
    const maskedNumber =
      formattedCardNumber.length > 4
        ? `${formattedCardNumber.substring(0, 4)} •••• •••• ${formattedCardNumber.substring(formattedCardNumber.length - 4)}`
        : "5412 •••• •••• 3891";

    try {
      await dbService.createCard({
        user_id: userId,
        card_number: maskedNumber,
        cardholder_name: cardholderName.trim(),
        expiry_date: expiryDate,
        card_type: cardType,
        status: 'active',
        balance: parseFloat(balance),
      });

      setIsAddModalVisible(false);
      setCardNumber("");
      setCardholderName("");
      setExpiryDate("");
      setBalance("");
      clearAll();

      await fetchCards();
      Alert.alert("Success", "Card added successfully!");
    } catch (e) {
      console.error("Error adding card:", e);
      Alert.alert("Error", "Could not add card");
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="card-outline" size={64} color="#7891B260" />
      <Text style={styles.emptyTitle}>No Cards Yet</Text>
      <Text style={styles.emptySubtitle}>
        Add your first card to get started
      </Text>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <StatusBar style="light" />
      <StarField />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#F7FAFF" />
          </Pressable>
          <Text style={styles.title}>Your Cards</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={styles.subtitle}>
          Secure payment, designed around you.
        </Text>

        {loading ? (
          <View style={styles.skeletonContainer}>
            {[1, 2].map((i) => (
              <View key={i} style={styles.skeletonCard} />
            ))}
          </View>
        ) : cards.length > 0 ? (
          <View style={styles.cardsList}>
            {cards.map((card) => (
              <FlipCard key={card.id} card={card} onDelete={handleDeleteCard} />
            ))}
          </View>
        ) : (
          renderEmptyState()
        )}

        <View style={styles.addButtonContainer}>
          <PrimaryButton
            label="Add Virtual Card"
            onPress={() => setIsAddModalVisible(true)}
          />
        </View>
      </ScrollView>

      {/* Add Card Modal */}
      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.slideModalOverlay}>
          <View style={styles.slideModalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Add New Card</Text>
              <Pressable onPress={() => setIsAddModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color="#F7FAFF" />
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={styles.formContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={[styles.textInput, errors.cardNumber && styles.textInputError]}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="#7891B280"
                  value={cardNumber}
                  onChangeText={(text) => {
                    setCardNumber(format.cardNumber(text));
                    clearError('cardNumber');
                  }}
                  keyboardType="numeric"
                  maxLength={22}
                />
                {errors.cardNumber ? <Text style={styles.fieldError}>{errors.cardNumber}</Text> : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cardholder Name</Text>
                <TextInput
                  style={[styles.textInput, errors.cardholderName && styles.textInputError]}
                  placeholder="John Doe"
                  placeholderTextColor="#7891B280"
                  value={cardholderName}
                  onChangeText={(text) => {
                    setCardholderName(text);
                    clearError('cardholderName');
                  }}
                  autoCapitalize="words"
                />
                {errors.cardholderName ? <Text style={styles.fieldError}>{errors.cardholderName}</Text> : null}
              </View>

              <View style={styles.formRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <TextInput
                    style={[styles.textInput, errors.expiryDate && styles.textInputError]}
                    placeholder="MM/YY"
                    placeholderTextColor="#7891B280"
                    value={expiryDate}
                    onChangeText={(text) => {
                      setExpiryDate(format.cardExpiry(text));
                      clearError('expiryDate');
                    }}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                  {errors.expiryDate ? <Text style={styles.fieldError}>{errors.expiryDate}</Text> : null}
                </View>

                <View style={[styles.inputGroup, { flex: 1.2 }]}>
                  <Text style={styles.inputLabel}>Card Type</Text>
                  <View style={styles.badgeSelectorRow}>
                    {(["Platinum", "Gold"] as const).map((type) => {
                      const isActive = cardType === type;
                      return (
                        <Pressable
                          key={type}
                          style={[
                            styles.badgeSelectorItem,
                            isActive && styles.badgeSelectorItemActive,
                            { flex: 1 },
                          ]}
                          onPress={() => setCardType(type)}
                        >
                          <Text
                            style={[
                              styles.badgeSelectorText,
                              isActive && styles.badgeSelectorTextActive,
                            ]}
                          >
                            {type}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Initial Balance (TND)</Text>
                <TextInput
                  style={[styles.textInput, errors.balance && styles.textInputError]}
                  placeholder="0.000"
                  placeholderTextColor="#7891B280"
                  value={balance}
                  onChangeText={(text) => {
                    setBalance(format.tndAmount(text));
                    clearError('balance');
                  }}
                  keyboardType="decimal-pad"
                />
                {errors.balance ? <Text style={styles.fieldError}>{errors.balance}</Text> : null}
              </View>

              <View style={styles.rowButtons}>
                <Pressable
                  style={styles.buttonCancel}
                  onPress={() => setIsAddModalVisible(false)}
                >
                  <Text style={styles.buttonCancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.buttonSubmit} onPress={handleAddCard}>
                  <Text style={styles.buttonSubmitText}>Add Card</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#030C16",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F7FAFF",
  },
  subtitle: {
    fontSize: 14,
    color: "#7891B2",
  },
  skeletonContainer: {
    gap: 16,
  },
  skeletonCard: {
    height: 210,
    borderRadius: 24,
    backgroundColor: "#091E3660",
    borderWidth: 1,
    borderColor: "#1B5B9F20",
  },
  cardsList: {
    gap: 16,
  },
  flipCardContainer: {
    height: 210,
    position: "relative",
  },
  cardContainer: {
    backgroundColor: "#0B234299",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#2F80ED33",
    padding: 24,
    height: 210,
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
    backfaceVisibility: "hidden",
  },
  cardFront: {},
  cardBack: {
    backgroundColor: "#05152999",
    justifyContent: "center",
    gap: 20,
  },
  gridLineH: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#2F80ED",
    opacity: 0.05,
  },
  gridLineV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#2F80ED",
    opacity: 0.05,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLogoSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardLogoText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F7FAFF",
  },
  wifiIcon: {
    transform: [{ rotate: "90deg" }],
    opacity: 0.8,
  },
  chipContainer: {
    marginTop: 8,
  },
  goldChip: {
    width: 38,
    height: 28,
    backgroundColor: "#ECC863",
    borderRadius: 6,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  chipLineH: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 1,
    backgroundColor: "#52431F",
    opacity: 0.25,
  },
  chipLineV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: 1,
    backgroundColor: "#52431F",
    opacity: 0.25,
  },
  cardNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 12,
  },
  cardNumberText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F7FAFF",
    letterSpacing: 2,
  },
  cardNumberDots: {
    fontSize: 16,
    fontWeight: "800",
    color: "#F7FAFF",
    letterSpacing: 3,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 8,
  },
  cardFooterLabel: {
    fontSize: 8,
    color: "#7891B2",
    letterSpacing: 1.2,
    marginBottom: 4,
    fontWeight: "600",
  },
  cardholderName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F7FAFF",
  },
  expirySection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  expiryLabels: {
    alignItems: "flex-end",
  },
  expiryDate: {
    fontSize: 13,
    fontWeight: "600",
    color: "#F7FAFF",
  },
  magneticStrip: {
    height: 40,
    backgroundColor: "#000",
    marginHorizontal: -24,
    marginTop: -24,
  },
  cvvSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  signatureStrip: {
    flex: 1,
    height: 35,
    backgroundColor: "#F7FAFF",
    borderRadius: 6,
  },
  cvvBox: {
    backgroundColor: "#ECC863",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cvvText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#030C16",
  },
  backNote: {
    fontSize: 12,
    color: "#7891B2",
    textAlign: "center",
  },
  deleteButton: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF535330",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F7FAFF",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#7891B2",
    textAlign: "center",
  },
  addButtonContainer: {
    marginTop: 8,
  },

  // Modal styles
  slideModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(3, 12, 22, 0.85)",
    justifyContent: "flex-end",
  },
  slideModalContent: {
    backgroundColor: "#0B2342",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1.2,
    borderColor: "#2F80ED40",
    maxHeight: "92%",
    padding: 24,
    gap: 16,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1B5B9F2A",
    paddingBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F7FAFF",
  },
  formContainer: {
    gap: 14,
    paddingBottom: 24,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7891B2",
  },
  textInput: {
    backgroundColor: "#091E36",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1B5B9F50",
    color: "#F7FAFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  textInputError: {
    borderColor: "#FF5353",
  },
  fieldError: {
    color: "#FF5353",
    fontSize: 11,
    marginTop: 2,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  badgeSelectorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badgeSelectorItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#091E36",
    borderWidth: 1,
    borderColor: "#1B5B9F40",
  },
  badgeSelectorItemActive: {
    backgroundColor: "#2F80ED22",
    borderColor: "#2F80ED",
  },
  badgeSelectorText: {
    fontSize: 12,
    color: "#7891B2",
    fontWeight: "600",
    textAlign: "center",
  },
  badgeSelectorTextActive: {
    color: "#2F80ED",
    fontWeight: "700",
  },
  rowButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
    paddingBottom: 10,
  },
  buttonCancel: {
    flex: 1,
    borderColor: "#1B5B9F60",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonCancelText: {
    color: "#7891B2",
    fontWeight: "600",
  },
  buttonSubmit: {
    flex: 1,
    backgroundColor: "#2F80ED",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSubmitText: {
    color: "#F7FAFF",
    fontWeight: "700",
  },
});
