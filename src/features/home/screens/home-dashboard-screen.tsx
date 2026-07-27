import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useIsFocused } from "@react-navigation/native";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { StarField } from "@/src/components/ui";
import { useDb } from "@/src/hooks/use-db";
import { useTheme } from "@/src/hooks/use-theme";
import {
  dbService,
  WalletCard,
  WalletTransaction,
} from "@/src/services/db-service";

// Custom dynamic date helper in French with live time
const getFrenchDateTime = () => {
  const days = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];
  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  const now = new Date();
  const dayName = days[now.getDay()];
  const dayNum = now.getDate();
  const monthName = months[now.getMonth()];
  const time = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return { date: `${dayName}, ${dayNum} ${monthName}`, time };
};

export function HomeDashboardScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { userId, isReady } = useDb();
  const theme = useTheme();

  const [cards, setCards] = useState<WalletCard[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(getFrenchDateTime());
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  // Animated values
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const currentAnimatedValue = useRef(0);
  const [displayBalance, setDisplayBalance] = useState(0);

  const fetchHomeData = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [userCards, userTransactions] = await Promise.all([
        dbService.getCards(userId),
        dbService.getTransactions(userId),
      ]);
      setCards(userCards);
      setTransactions(userTransactions.slice(0, 3));
    } catch (e) {
      console.error("Error loading home dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady && userId && isFocused) {
      fetchHomeData();
    }
  }, [isReady, userId, isFocused]);

  // Live clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(getFrenchDateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Pulse animation for notification bell
  useEffect(() => {
    if (hasUnreadNotifications) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnimation.setValue(1);
    }
  }, [hasUnreadNotifications]);

  // Calculate total balance and animate
  const totalBalance = cards.reduce(
    (sum, card) => sum + Number(card.balance),
    0,
  );

  useEffect(() => {
    if (loading) return;
    const startValue = currentAnimatedValue.current;
    const endValue = totalBalance;

    const startTime = Date.now();
    const duration = 1500;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function: ease out exponential
      const easeOutExp = 1 - Math.pow(2, -10 * progress);

      const currentValue = startValue + (endValue - startValue) * easeOutExp;
      currentAnimatedValue.current = currentValue;
      setDisplayBalance(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [totalBalance, loading]);

  // Use the first card as primary, or fallback details if empty
  const primaryCard = cards.length > 0 ? cards[0] : null;
  const primaryCardNo = primaryCard
    ? primaryCard.card_number
    : "5412 •••• •••• 3891";
  const primaryCardName = primaryCard
    ? primaryCard.cardholder_name
    : "Nour Ben Salah";
  const primaryCardExpiry = primaryCard ? primaryCard.expiry_date : "09 / 28";
  const primaryCardType = primaryCard ? primaryCard.card_type : "Platinum";

  // Quick actions
  const quickActions = [
    {
      id: "virement",
      label: "Virement",
      icon: "arrow-redo-outline",
      iconType: "ionicons",
      border: theme.colors.primary,
      route: "/wallet",
    },
    {
      id: "food",
      label: "Food",
      icon: "fast-food-outline",
      iconType: "ionicons",
      border: theme.colors.success,
      route: "/food-delivery",
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: "wallet",
      iconType: "ionicons",
      isActive: true,
      route: "/wallet",
    },
    {
      id: "payer",
      label: "Payer",
      icon: "card-outline",
      iconType: "ionicons",
      border: theme.colors.danger,
      route: "/wallet",
    },
    {
      id: "epargne",
      label: "Épargne",
      icon: "piggy-bank-outline",
      iconType: "material",
      route: "/savings",
    },
  ];

  // Smart insights
  const getSmartInsight = () => {
    const numTransactions = transactions.length;
    if (numTransactions === 0)
      return "💡 Aucune transaction ce mois-ci. Démarrez votre gestion financière !";
    const totalSpent = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return `💡 Vous avez ${numTransactions} transaction${numTransactions > 1 ? "s" : ""} ce mois-ci. Épargne suggérée : ${(totalSpent * 0.2).toFixed(3)} TND`;
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar style={theme.mode === "dark" ? "light" : "dark"} />
      {theme.mode === "dark" && <StarField />}

      {/* Glow highlight behind header */}
      <View
        style={[
          styles.topGlow,
          {
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
          },
        ]}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Block */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
              {currentDateTime.date}
            </Text>
            <Text
              style={[
                styles.timeText,
                { color: theme.mode === "dark" ? "#B8D8FF" : theme.colors.primary },
              ]}
            >
              {currentDateTime.time}
            </Text>
            <Text style={[styles.greetingText, { color: theme.colors.textPrimary }]}>
              Bonjour Nour 👋
            </Text>
          </View>

          <View style={styles.headerActions}>
            {/* Theme Toggle Button */}
            <Pressable
              style={[
                styles.notificationButton,
                {
                  backgroundColor:
                    theme.mode === "dark" ? "#091E3680" : theme.colors.surfaceElevated,
                  borderColor: theme.mode === "dark" ? "#1B5B9F60" : theme.colors.border,
                },
              ]}
              onPress={theme.toggleMode}
            >
              <Ionicons
                name={theme.mode === "dark" ? "sunny-outline" : "moon-outline"}
                size={20}
                color={theme.colors.textPrimary}
              />
            </Pressable>
            {/* Notification Bell with pulse */}
            <Pressable
              style={[
                styles.notificationButton,
                {
                  backgroundColor:
                    theme.mode === "dark" ? "#091E3680" : theme.colors.surfaceElevated,
                  borderColor: theme.mode === "dark" ? "#1B5B9F60" : theme.colors.border,
                },
              ]}
              onPress={() => {
                setHasUnreadNotifications(false);
                router.push("/modal");
              }}
            >
              <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={theme.mode === "dark" ? "#F7FAFF" : theme.colors.textPrimary}
                />
                {hasUnreadNotifications && (
                  <View
                    style={[
                      styles.notificationBadge,
                      {
                        backgroundColor: theme.colors.danger,
                        borderColor: theme.colors.background,
                      },
                    ]}
                  />
                )}
              </Animated.View>
            </Pressable>

            {/* User Avatar */}
            <Pressable
              style={[
                styles.profileAvatar,
                {
                  backgroundColor: theme.colors.primary,
                  shadowColor: theme.colors.primary,
                },
              ]}
              onPress={() =>
                Alert.alert(
                  "Profil Utilisateur",
                  "Nour Ben Salah\nnour.bensalah@supertounsi.tn",
                )
              }
            >
              <Text
                style={[styles.profileAvatarText, { color: theme.colors.primaryOn }]}
              >
                N
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Balance Section */}
        <View style={styles.balanceContainer}>
          <Text style={[styles.soldeLabel, { color: theme.colors.textSecondary }]}>
            SOLDE DISPONIBLE
          </Text>
          <View style={styles.balanceTextContainer}>
            {loading && cards.length === 0 ? (
              <Text
                style={[styles.balanceAmount, { color: theme.colors.textPrimary }]}
              >
                ...
              </Text>
            ) : (
              <Text
                style={[styles.balanceAmount, { color: theme.colors.textPrimary }]}
              >
                {displayBalance.toLocaleString("fr-FR", {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })}
              </Text>
            )}
            <Text
              style={[styles.balanceCurrency, { color: theme.colors.textPrimary }]}
            >
              TND
            </Text>
          </View>
          <View style={styles.trendContainer}>
            <View
              style={[
                styles.trendBadge,
                { backgroundColor: `${theme.colors.success}15` },
              ]}
            >
              <Ionicons
                name="arrow-up-circle"
                size={16}
                color={theme.colors.success}
              />
              <Text style={[styles.trendTextGreen, { color: theme.colors.success }]}>
                +2.4% ce mois
              </Text>
            </View>
            <Text
              style={[styles.trendTextMuted, { color: theme.colors.textSecondary }]}
            >
              vs mois dernier
            </Text>
          </View>
        </View>

        {/* Smart Insights Banner */}
        <View
          style={[
            styles.insightsBanner,
            {
              backgroundColor: `${theme.colors.primary}15`,
              borderColor: `${theme.colors.primary}30`,
            },
          ]}
        >
          <Text
            style={[
              styles.insightsText,
              { color: theme.mode === "dark" ? "#B8D8FF" : theme.colors.primary },
            ]}
          >
            {getSmartInsight()}
          </Text>
        </View>

        {/* Premium Featured Credit Card */}
        <View style={[styles.cardWrapper, { shadowColor: theme.colors.primary }]}>
          <View
            style={[
              styles.cardContainer,
              {
                backgroundColor:
                  theme.mode === "dark" ? "#0B234299" : `${theme.colors.primary}15`,
                borderColor: theme.mode === "dark" ? "#2F80ED33" : theme.colors.border,
              },
              primaryCardType === "Gold" && {
                borderColor: theme.mode === "dark" ? "#ECC86344" : "#ECC86380",
                backgroundColor: theme.mode === "dark" ? "#0C1C2E99" : "#ECC86320",
              },
            ]}
          >
            {/* Grid overlay lines */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <View
                style={[
                  styles.gridLineH,
                  {
                    top: "25%",
                    backgroundColor: theme.colors.primary,
                    opacity: theme.mode === "dark" ? 0.05 : 0.1,
                  },
                ]}
              />
              <View
                style={[
                  styles.gridLineH,
                  {
                    top: "50%",
                    backgroundColor: theme.colors.primary,
                    opacity: theme.mode === "dark" ? 0.05 : 0.1,
                  },
                ]}
              />
              <View
                style={[
                  styles.gridLineH,
                  {
                    top: "75%",
                    backgroundColor: theme.colors.primary,
                    opacity: theme.mode === "dark" ? 0.05 : 0.1,
                  },
                ]}
              />
              <View
                style={[
                  styles.gridLineV,
                  {
                    left: "25%",
                    backgroundColor: theme.colors.primary,
                    opacity: theme.mode === "dark" ? 0.05 : 0.1,
                  },
                ]}
              />
              <View
                style={[
                  styles.gridLineV,
                  {
                    left: "50%",
                    backgroundColor: theme.colors.primary,
                    opacity: theme.mode === "dark" ? 0.05 : 0.1,
                  },
                ]}
              />
              <View
                style={[
                  styles.gridLineV,
                  {
                    left: "75%",
                    backgroundColor: theme.colors.primary,
                    opacity: theme.mode === "dark" ? 0.05 : 0.1,
                  },
                ]}
              />
            </View>

            <View style={styles.cardHeader}>
              <View style={styles.cardLogoSection}>
                <Image
                  source={require("../../../../assets/images/supertounsi_logo.png")}
                  style={[
                    styles.cardLogoIcon,
                    { borderColor: `${theme.colors.primary}aa` },
                  ]}
                />
                <Text
                  style={[
                    styles.cardLogoText,
                    { color: theme.mode === "dark" ? "#F7FAFF" : theme.colors.textPrimary },
                  ]}
                >
                  {primaryCardType === "Platinum"
                    ? "SuperTounsi Platinum"
                    : "SuperTounsi Gold"}
                </Text>
              </View>
              <Ionicons
                name="wifi"
                size={20}
                color={theme.mode === "dark" ? "#F7FAFF" : theme.colors.textPrimary}
                style={styles.wifiIcon}
              />
            </View>

            {/* Gold Chip */}
            <View style={styles.chipContainer}>
              <View style={styles.goldChip}>
                <View style={styles.chipLineH} />
                <View style={styles.chipLineV} />
              </View>
            </View>

            {/* Card Number */}
            <View style={styles.cardNumberContainer}>
              {primaryCardNo.split(" ").map((chunk, index) => (
                <Text
                  key={index}
                  style={[
                    chunk === "••••"
                      ? styles.cardNumberDots
                      : styles.cardNumberText,
                    { color: theme.mode === "dark" ? "#F7FAFF" : theme.colors.textPrimary },
                  ]}
                >
                  {chunk}
                </Text>
              ))}
            </View>

            {/* Card Footer */}
            <View style={styles.cardFooter}>
              <View>
                <Text
                  style={[
                    styles.cardFooterLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  CARD HOLDER
                </Text>
                <Text
                  style={[
                    styles.cardholderName,
                    { color: theme.mode === "dark" ? "#F7FAFF" : theme.colors.textPrimary },
                  ]}
                >
                  {primaryCardName}
                </Text>
              </View>

              <View style={styles.expirySection}>
                <View style={styles.expiryLabels}>
                  <Text
                    style={[
                      styles.cardFooterLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    EXPIRES
                  </Text>
                  <Text
                    style={[
                      styles.expiryDate,
                      {
                        color: theme.mode === "dark" ? "#F7FAFF" : theme.colors.textPrimary,
                      },
                    ]}
                  >
                    {primaryCardExpiry}
                  </Text>
                </View>
                {/* Mastercard-like overlapping bubbles */}
                <View style={styles.mcCircles}>
                  <View
                    style={[
                      styles.mcCircle,
                      primaryCardType === "Gold"
                        ? { backgroundColor: "#ECC863", left: 0 }
                        : styles.mcRed,
                    ]}
                  />
                  <View
                    style={[
                      styles.mcCircle,
                      primaryCardType === "Gold"
                        ? { backgroundColor: "#ECC863", right: 0 }
                        : styles.mcOrange,
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={[styles.actionsTitle, { color: theme.colors.textPrimary }]}>
            Actions rapides
          </Text>
          <View style={styles.actionsRow}>
            {quickActions.map((action) => (
              <View key={action.id} style={styles.actionItemContainer}>
                <Pressable
                  onPress={() => router.push(action.route as any)}
                  style={[
                    styles.actionCircle,
                    {
                      backgroundColor: action.isActive
                        ? theme.colors.primary
                        : theme.mode === "dark"
                          ? "#091E3680"
                          : theme.colors.surfaceElevated,
                      borderColor: action.isActive
                        ? theme.colors.primary
                        : action.border ||
                          (theme.mode === "dark" ? "#1B5B9F40" : theme.colors.border),
                      borderWidth: action.isActive || action.border ? 1.5 : 1.5,
                    },
                    action.isActive && {
                      shadowColor: theme.colors.primary,
                      elevation: 6,
                    },
                  ]}
                >
                  {action.iconType === "ionicons" ? (
                    <Ionicons
                      name={action.icon as any}
                      size={20}
                      color={
                        action.isActive
                          ? theme.colors.primaryOn
                          : theme.mode === "dark"
                            ? "#B8D8FF"
                            : theme.colors.textSecondary
                      }
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={action.icon as any}
                      size={22}
                      color={
                        action.isActive
                          ? theme.colors.primaryOn
                          : theme.mode === "dark"
                            ? "#B8D8FF"
                            : theme.colors.textSecondary
                      }
                    />
                  )}
                </Pressable>
                <View
                  style={[
                    styles.actionPill,
                    {
                      backgroundColor: action.isActive
                        ? `${theme.colors.primary}20`
                        : theme.mode === "dark"
                          ? "#091E3680"
                          : theme.colors.surfaceElevated,
                      borderColor: action.isActive
                        ? `${theme.colors.primary}40`
                        : theme.mode === "dark"
                          ? "#1B5B9F40"
                          : theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.actionLabel,
                      {
                        color: action.isActive
                          ? theme.mode === "dark"
                            ? "#B8D8FF"
                            : theme.colors.primary
                          : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    {action.label}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <View
            style={[
              styles.transactionsSection,
              {
                backgroundColor: theme.mode === "dark" ? "#091E3660" : theme.colors.surface,
                borderColor: theme.mode === "dark" ? "#1B5B9F20" : theme.colors.border,
              },
            ]}
          >
            <View style={styles.transactionsHeader}>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
              >
                Transactions récentes
              </Text>
              <Pressable onPress={() => router.push("/wallet/transactions")}>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                  Voir tout
                </Text>
              </Pressable>
            </View>
            <View style={styles.transactionsList}>
              {transactions.map((tx) => (
                <Pressable
                  key={tx.id}
                  style={styles.transactionItem}
                  onPress={() => router.push("/wallet/transactions")}
                >
                  <View
                    style={[
                      styles.transactionIconContainer,
                      {
                        backgroundColor: `${tx.amount < 0 ? theme.colors.danger : theme.colors.success}20`,
                      },
                    ]}
                  >
                    <Ionicons
                      name={(tx.icon as any) || "swap-horizontal-outline"}
                      size={20}
                      color={tx.amount < 0 ? theme.colors.danger : theme.colors.success}
                    />
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text
                      style={[
                        styles.transactionTitle,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {tx.title}
                    </Text>
                    <Text
                      style={[
                        styles.transactionSubtitle,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {tx.category} •{" "}
                      {dayjs(tx.transaction_date).format("DD MMM")}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      { color: tx.amount < 0 ? theme.colors.danger : theme.colors.success },
                    ]}
                  >
                    {tx.amount < 0 ? "-" : "+"}{" "}
                    {Math.abs(tx.amount).toLocaleString("fr-FR", {
                      minimumFractionDigits: 3,
                    })}{" "}
                    {tx.currency}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topGlow: {
    position: "absolute",
    top: -100,
    left: "25%",
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.15,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 50,
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
    alignItems: "flex-start",
  },
  dateText: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: "800",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  profileAvatarText: {
    fontSize: 16,
    fontWeight: "700",
  },
  balanceContainer: {
    marginTop: 4,
  },
  soldeLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  balanceTextContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: "800",
  },
  balanceCurrency: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 8,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  trendTextGreen: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  trendTextMuted: {
    fontSize: 13,
    fontWeight: "400",
  },
  insightsBanner: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  insightsText: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  cardWrapper: {
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  cardContainer: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    height: 210,
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
  },
  gridLineH: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
  },
  gridLineV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
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
  cardLogoIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
  },
  cardLogoText: {
    fontSize: 15,
    fontWeight: "700",
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
    letterSpacing: 2,
  },
  cardNumberDots: {
    fontSize: 16,
    fontWeight: "800",
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
    letterSpacing: 1.2,
    marginBottom: 4,
    fontWeight: "600",
  },
  cardholderName: {
    fontSize: 14,
    fontWeight: "600",
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
  },
  mcCircles: {
    flexDirection: "row",
    width: 28,
    height: 18,
    position: "relative",
    alignItems: "center",
  },
  mcCircle: {
    width: 28,
    height: 18,
    position: "relative",
    alignItems: "center",
  },
  mcRed: {
    backgroundColor: "#EB001B",
    left: 0,
    opacity: 0.9,
  },
  mcOrange: {
    backgroundColor: "#F79E1B",
    right: 0,
    opacity: 0.8,
  },
  actionsSection: {
    marginTop: 4,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  actionItemContainer: {
    alignItems: "center",
    width: 64,
  },
  actionCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  actionPill: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  transactionsSection: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "600",
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  transactionSubtitle: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
});
