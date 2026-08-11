import {
    GlassCard,
    Screen,
    SearchBar,
    SectionTitle,
} from "@/src/components/ui";
import { useTheme } from "@/src/hooks/use-theme";
import { FavoritesModal } from "@/src/components/ui/FavoritesModal";
import { useFoodCartStore } from "@/src/store/food-cart-store";
import { useFoodPromoStore } from "@/src/store/food-promo-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState, useRef, useEffect } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Animated,
    Alert,
    Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    CATEGORIES,
    MOCK_AI_RECOMMENDATIONS,
    MOCK_RESTAURANTS,
    USER_NAME,
} from "../mocks";
import { AddressPickerModal } from "../components/AddressPickerModal";

export function FoodDeliveryHomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [isFavoritesVisible, setIsFavoritesVisible] = useState(false);
  const { getItemCount } = useFoodCartStore();
  
  // Promo and coupon store integration
  const { unlockedCoupons, addCoupon, lastSpinTime, setLastSpinTime, canSpin } = useFoodPromoStore();
  const [isWheelModalVisible, setIsWheelModalVisible] = useState(false);
  const [isCouponsModalVisible, setIsCouponsModalVisible] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [countdownText, setCountdownText] = useState("");

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("Tunis, La Marsa");

  const cartCount = getItemCount();

  // Sector config for Spin the Wheel
  const WHEEL_SECTORS = [
    { label: "Livraison Gratuite 🚚", code: "SPIN_FREE", val: 0, type: "free_delivery" as const, min: 15 },
    { label: "5% de remise 💸", code: "SPIN_5", val: 5, type: "percent" as const, min: 10 },
    { label: "10% de remise 💸", code: "SPIN_10", val: 10, type: "percent" as const, min: 12 },
    { label: "15% de remise ⚡", code: "SPIN_15", val: 15, type: "percent" as const, min: 15 },
    { label: "20% de remise 🎯", code: "SPIN_20", val: 20, type: "percent" as const, min: 20 },
    { label: "3 TND de remise 💰", code: "SPIN_CASH", val: 3.0, type: "amount" as const, min: 15 },
    { label: "15% de remise 🍀", code: "SPIN_LUCKY", val: 15, type: "percent" as const, min: 15 },
    { label: "25% de remise 🎁", code: "SPIN_MYSTERY", val: 25, type: "percent" as const, min: 25 },
  ];

  // Update countdown timer for spin wheel
  useEffect(() => {
    const updateTimer = () => {
      if (!lastSpinTime) return;
      const nextSpin = lastSpinTime + 24 * 60 * 60 * 1000;
      const remaining = nextSpin - Date.now();
      if (remaining <= 0) {
        setCountdownText("");
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        setCountdownText(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lastSpinTime]);

  const handleSpinWheel = () => {
    if (isSpinning || !canSpin()) return;

    setIsSpinning(true);
    // Select a random sector index
    const winningIdx = Math.floor(Math.random() * WHEEL_SECTORS.length);
    const sectorAngle = 360 / WHEEL_SECTORS.length;
    // Rotate 5 times + alignment offset
    const finalVal = 360 * 5 + (WHEEL_SECTORS.length - winningIdx) * sectorAngle;

    spinAnim.setValue(0);
    Animated.timing(spinAnim, {
      toValue: finalVal,
      duration: 4000,
      useNativeDriver: true,
    }).start(async () => {
      const winner = WHEEL_SECTORS[winningIdx];
      
      // Save coupon to store
      addCoupon({
        code: `${winner.code}_${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        title: winner.label,
        discountType: winner.type,
        discountValue: winner.val,
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days validity
        minOrder: winner.min,
        remainingUses: 1,
      });

      setLastSpinTime(Date.now());
      setIsSpinning(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Félicitations! 🎉",
        `Vous avez gagné : ${winner.label} ! Le coupon a été ajouté à votre compte.`
      );
    });
  };
  const aiRecommendation = MOCK_AI_RECOMMENDATIONS[0];

  const selectedCategoryObj = CATEGORIES.find((c) => c.id === selectedCategoryId);

  const filteredRestaurants = MOCK_RESTAURANTS.filter((r) => {
    // 1. Category match
    let matchesCategory = true;
    if (selectedCategoryObj) {
      const targetName = selectedCategoryObj.name.toLowerCase();
      matchesCategory = r.cuisineTypes.some((ct) =>
        ct.toLowerCase().includes(targetName)
      );
    }

    // 2. Search match
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      matchesSearch =
        r.name.toLowerCase().includes(q) ||
        r.cuisineTypes.some((ct) => ct.toLowerCase().includes(q)) ||
        (r.tags && r.tags.some((t) => t.toLowerCase().includes(q)));
    }

    return matchesCategory && matchesSearch;
  });

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <SafeAreaView edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.locationContainer} onPress={() => setIsMapVisible(true)}>
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
                numberOfLines={1}
              >
                {currentAddress}
              </Text>
            </View>
            <Ionicons
              name="chevron-down"
              size={20}
              color={theme.colors.textPrimary}
            />
          </Pressable>

          <View style={styles.headerRight}>
            {/* Live Order Tracking Button */}
            <Pressable
              style={[
                styles.iconButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => router.push("/food-delivery/order-tracking" as any)}
            >
              <Ionicons
                name="bicycle-outline"
                size={22}
                color="#00A082"
              />
            </Pressable>

            {/* Order History Button */}
            <Pressable
              style={[
                styles.iconButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => router.push("/food-delivery/history" as any)}
            >
              <Ionicons
                name="receipt-outline"
                size={22}
                color="#FFC244"
              />
            </Pressable>

            {/* Favorites Button */}
            <Pressable
              style={[
                styles.iconButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  marginRight: 8,
                },
              ]}
              onPress={() => setIsFavoritesVisible(true)}
            >
              <Ionicons
                name="heart-outline"
                size={24}
                color="#FF5353"
              />
            </Pressable>

            {/* Cart Button */}
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
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Search Bar */}
          <View style={{ paddingHorizontal: theme.spacing.md }}>
            <SearchBar
              placeholder="Rechercher un restaurant ou un plat..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
            />
            {isSearchFocused && (
              <View style={{ marginTop: 8, gap: 12, backgroundColor: theme.colors.surface, borderRadius: 16, padding: 14, borderColor: '#2F80ED30', borderWidth: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: theme.colors.textSecondary }}>Suggestions & Tendances</Text>
                  <Pressable onPress={() => setIsSearchFocused(false)}>
                    <Text style={{ fontSize: 12, color: '#FFC244', fontWeight: '800' }}>Fermer</Text>
                  </Pressable>
                </View>
                
                {/* Trending */}
                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: theme.colors.textSecondary }}>RECHERCHES POPULAIRES</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {["Couscous", "Pizza", "Mlaoui", "Burger", "Sushi"].map((t) => (
                      <Pressable
                        key={t}
                        onPress={() => {
                          setSearchQuery(t);
                          setIsSearchFocused(false);
                        }}
                        style={{ backgroundColor: theme.colors.surfaceSubtle, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}
                      >
                        <Text style={{ fontSize: 11, color: theme.colors.textPrimary }}>🔥 {t}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* AI Suggestions */}
                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: theme.colors.textSecondary }}>SUGGESTIONS IA ⚡</Text>
                  {["Dar Zaman (Couscous)", "Sushi Master (Poké Bowls)", "Green & Fresh (Sain)"].map((ai) => (
                    <Pressable
                      key={ai}
                      onPress={() => {
                        const clean = ai.split(' ')[0];
                        setSearchQuery(clean);
                        setIsSearchFocused(false);
                      }}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2 }}
                    >
                      <Ionicons name="sparkles" size={12} color="#FFC244" />
                      <Text style={{ fontSize: 12, color: theme.colors.textPrimary }}>{ai}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
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
                    backgroundColor: "#FFC244",
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
                    { color: "#000000" },
                  ]}
                >
                  Show Suggestions
                </Text>
                <Ionicons
                  name="arrow-forward-outline"
                  size={16}
                  color="#000000"
                />
              </Pressable>
            </GlassCard>
          </View>

          {/* Interactive Gamified Promos */}
          <View style={{ paddingHorizontal: theme.spacing.md, flexDirection: 'row', gap: 12, marginVertical: 8 }}>
            {/* Spin the Wheel Card */}
            <Pressable
              style={{
                flex: 1.2,
                backgroundColor: theme.mode === 'dark' ? '#1E1B4B' : '#EEF2FF',
                borderColor: '#6366F1',
                borderWidth: 1.5,
                borderRadius: 20,
                padding: 16,
                justifyContent: 'space-between',
                height: 120,
                position: 'relative',
                overflow: 'hidden'
              }}
              onPress={() => setIsWheelModalVisible(true)}
            >
              <View>
                <View style={{ backgroundColor: '#6366F120', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 6 }}>
                  <Text style={{ fontSize: 9, fontWeight: '800', color: '#6366F1', letterSpacing: 0.5 }}>DAILY REWARD</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '900', color: theme.colors.textPrimary }}>Roue Fortune 🎡</Text>
                <Text style={{ fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 }}>
                  {canSpin() ? "Lancez pour gagner !" : `Prochain spin dans: ${countdownText}`}
                </Text>
              </View>
            </Pressable>

            {/* My Coupons Card */}
            <Pressable
              style={{
                flex: 1,
                backgroundColor: theme.mode === 'dark' ? '#312E81' : '#EEF2FF',
                borderColor: '#4F46E5',
                borderWidth: 1.5,
                borderRadius: 20,
                padding: 16,
                justifyContent: 'space-between',
                height: 120
              }}
              onPress={() => setIsCouponsModalVisible(true)}
            >
              <View>
                <View style={{ backgroundColor: '#4F46E520', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 6 }}>
                  <Text style={{ fontSize: 9, fontWeight: '800', color: '#4F46E5', letterSpacing: 0.5 }}>MY REWARDS</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '900', color: theme.colors.textPrimary }}>Mes Coupons 🎟️</Text>
                <Text style={{ fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 }}>
                  {unlockedCoupons.length} coupons actifs
                </Text>
              </View>
            </Pressable>
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
                          ? "#FFC244"
                          : theme.colors.surface,
                        borderColor: isSelected
                          ? "#FFC244"
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
                            ? "#000000"
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
              <SectionTitle>
                {selectedCategoryObj
                  ? `Restaurants ${selectedCategoryObj.name}`
                  : "Populaires près de vous"}
              </SectionTitle>
              {selectedCategoryId && (
                <Pressable onPress={() => setSelectedCategoryId(null)}>
                  <Text style={[styles.seeAllText, { color: "#FFC244" }]}>
                    Réinitialiser
                  </Text>
                </Pressable>
              )}
            </View>

            {filteredRestaurants.length === 0 && (
              <GlassCard style={{ padding: 30, alignItems: "center", marginVertical: 10 }}>
                <Ionicons name="restaurant-outline" size={44} color={theme.colors.textSecondary} style={{ marginBottom: 10 }} />
                <Text style={{ color: theme.colors.textPrimary, fontSize: 16, fontWeight: "700", marginBottom: 4 }}>
                  Aucun restaurant trouvé
                </Text>
                <Text style={{ color: theme.colors.textSecondary, textAlign: "center", fontSize: 13 }}>
                  Essayez une autre catégorie ou modifiez votre recherche.
                </Text>
              </GlassCard>
            )}
            {filteredRestaurants.map((restaurant) => {
              const isClosed = restaurant.id === "8";
              const isBusy = restaurant.id === "3";
              const deliveryTime = isBusy ? "35-50" : restaurant.deliveryTime;

              return (
                <Pressable
                  key={restaurant.id}
                  style={{ marginBottom: theme.spacing.md, opacity: isClosed ? 0.6 : 1 }}
                  onPress={() => {
                    if (isClosed) {
                      Alert.alert("Fermé 🌙", "Ce restaurant est fermé temporairement. Veuillez commander auprès d'un autre établissement !");
                      return;
                    }
                    router.push(`/food-delivery/${restaurant.id}` as any);
                  }}
                >
                  <GlassCard style={{ overflow: "hidden", padding: 0 }}>
                    <View style={styles.restaurantImageContainer}>
                      <Image
                        source={{ uri: restaurant.coverImage }}
                        style={styles.restaurantImage}
                      />
                      
                      {/* Status overlays */}
                      {isClosed && (
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                          <View style={{ backgroundColor: 'rgba(235, 87, 87, 0.95)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 }}>
                            <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>FERMÉ TEMPORAIREMENT 🌙</Text>
                          </View>
                        </View>
                      )}

                      {isBusy && (
                        <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(242, 153, 74, 0.95)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
                          <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800' }}>TRÈS OCCUPÉ ⏱️</Text>
                        </View>
                      )}

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
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                          <Text
                            style={[
                              styles.restaurantName,
                              { color: theme.colors.textPrimary },
                            ]}
                            numberOfLines={1}
                          >
                            {restaurant.name}
                          </Text>
                          {restaurant.rating >= 4.8 && (
                            <View style={{ backgroundColor: 'rgba(255, 194, 68, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                              <Text style={{ fontSize: 9, fontWeight: '800', color: '#FFC244' }}>👑 TOP</Text>
                            </View>
                          )}
                          {restaurant.id === "1" && (
                            <View style={{ backgroundColor: 'rgba(39, 174, 96, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                              <Text style={{ fontSize: 9, fontWeight: '800', color: '#27AE60' }}>❤️ LOCAL</Text>
                            </View>
                          )}
                        </View>
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
              );
            })}
          </View>
        </ScrollView>
        {/* Interactive Address Picker Map Modal */}
        <AddressPickerModal
          visible={isMapVisible}
          onSaveAddress={(newAdd) => {
            setCurrentAddress(newAdd.address);
            setIsMapVisible(false);
          }}
          onClose={() => setIsMapVisible(false)}
        />

        {/* 🎡 SPIN THE WHEEL MODAL */}
        <Modal visible={isWheelModalVisible} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: 'rgba(3, 12, 22, 0.9)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: theme.colors.surface, width: '90%', borderRadius: 24, padding: 24, borderColor: '#2F80ED40', borderWidth: 1.2, alignItems: 'center', gap: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.colors.border + '20', paddingBottom: 10 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: theme.colors.textPrimary }}>Roue de la Fortune 🎡</Text>
                <Pressable onPress={() => setIsWheelModalVisible(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                </Pressable>
              </View>

              {/* The Wheel */}
              <View style={{ marginVertical: 16, position: 'relative', width: 270, height: 270, justifyContent: 'center', alignItems: 'center' }}>
                <Animated.View style={[{
                  width: 250,
                  height: 250,
                  borderRadius: 125,
                  borderWidth: 6,
                  borderColor: '#FFC244',
                  backgroundColor: '#091E36',
                  position: 'relative',
                  justifyContent: 'center',
                  alignItems: 'center'
                }, {
                  transform: [{
                    rotate: spinAnim.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg']
                    })
                  }]
                }]}>
                  {/* Sector partition lines */}
                  {[0, 45, 90, 135].map((angle) => (
                    <View key={angle} style={{ position: 'absolute', width: 2, height: 238, backgroundColor: 'rgba(255,255,255,0.1)', transform: [{ rotate: `${angle}deg` }] }} />
                  ))}
                  {/* Number Labels */}
                  {WHEEL_SECTORS.map((sec, idx) => {
                    const angle = idx * 45 + 22.5;
                    return (
                      <View key={idx} style={{ position: 'absolute', transform: [{ rotate: `${angle}deg` }, { translateY: -85 }] }}>
                        <Text style={{ fontSize: 16, fontWeight: '900', color: '#FFC244', transform: [{ rotate: `${-angle}deg` }] }}>{idx + 1}</Text>
                      </View>
                    );
                  })}
                </Animated.View>

                {/* Central Pointer Arrow */}
                <View style={{ position: 'absolute', top: -14, width: 0, height: 0, borderLeftWidth: 14, borderRightWidth: 14, borderTopWidth: 24, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#FF5353', zIndex: 10 }} />
                
                {/* Central Spin Button */}
                <Pressable
                  style={{
                    position: 'absolute',
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: canSpin() ? '#FFC244' : '#7891B2',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 4,
                    borderColor: '#091E36',
                    zIndex: 20
                  }}
                  onPress={handleSpinWheel}
                  disabled={isSpinning || !canSpin()}
                >
                  <Text style={{ fontSize: 13, fontWeight: '900', color: '#000000' }}>SPIN</Text>
                </Pressable>
              </View>

              {/* Reward Legend List */}
              <View style={{ width: '100%', gap: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 4 }}>Légende des Récompenses :</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {WHEEL_SECTORS.map((sec, idx) => (
                    <View key={idx} style={{ width: '48%', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFC244' }}>{idx + 1}.</Text>
                      <Text style={{ fontSize: 11, color: theme.colors.textPrimary }} numberOfLines={1}>{sec.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {!canSpin() && (
                <View style={{ backgroundColor: 'rgba(235, 87, 87, 0.1)', borderColor: '#EB5757', borderWidth: 1, borderRadius: 12, padding: 10, width: '100%', alignItems: 'center', marginTop: 10 }}>
                  <Text style={{ color: '#EB5757', fontSize: 12, fontWeight: '700' }}>Déjà tourné aujourd'hui 🔒</Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 11, marginTop: 2 }}>Revenez dans : {countdownText}</Text>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* 🎟️ MY COUPONS MODAL */}
        <Modal visible={isCouponsModalVisible} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: 'rgba(3, 12, 22, 0.9)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: theme.colors.surface, width: '90%', maxHeight: '80%', borderRadius: 24, padding: 24, borderColor: '#2F80ED40', borderWidth: 1.2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.colors.border + '20', paddingBottom: 10, marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: theme.colors.textPrimary }}>Mes Coupons 🎟️</Text>
                <Pressable onPress={() => setIsCouponsModalVisible(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={{ gap: 12 }} showsVerticalScrollIndicator={false}>
                {unlockedCoupons.length === 0 ? (
                  <View style={{ alignItems: 'center', paddingVertical: 40, gap: 8 }}>
                    <Ionicons name="ticket-outline" size={48} color="#7891B260" />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary }}>Aucun coupon actif</Text>
                    <Text style={{ fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center' }}>Tournez la roue de la fortune quotidienne pour gagner des réductions exclusifs !</Text>
                  </View>
                ) : (
                  unlockedCoupons.map((coupon) => (
                    <View key={coupon.code} style={{ backgroundColor: theme.mode === 'dark' ? '#091E36' : '#F7FAFF', borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#2F80ED', borderRadius: 16, padding: 14, gap: 4 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#2F80ED' }}>{coupon.title}</Text>
                        <View style={{ backgroundColor: 'rgba(47, 128, 237, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                          <Text style={{ fontSize: 11, fontWeight: '900', color: '#2F80ED' }}>{coupon.code}</Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 11, color: theme.colors.textSecondary }}>Min. commande: {coupon.minOrder.toFixed(3)} TND</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <Text style={{ fontSize: 11, color: theme.colors.textSecondary }}>Exp: {coupon.expiryDate}</Text>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: theme.colors.textPrimary }}>{coupon.remainingUses} util. restantes</Text>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
