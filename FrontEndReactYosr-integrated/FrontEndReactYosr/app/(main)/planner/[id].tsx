import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";

import { getEventById } from "../../../data/events";
import { getOutingPlan } from "../../../data/outingPlans";
import { Colors, Gradients } from "../../../constants/home/Colors";
import { Radius, Spacing } from "../../../constants/home/Layout";
import { Typography } from "../../../constants/home/Typography";
import PrimaryButton, { ButtonState } from "../../../components/PrimaryButton";
import WeatherCard from "../../../components/WeatherCard";
import TransportCard from "../../../components/TransportCard";
import DinnerCard from "../../../components/DinnerCard";
import HotelCard from "../../../components/HotelCard";
import BudgetCard from "../../../components/BudgetCard";
import LocalTipsCard from "../../../components/LocalTipsCard";

const LOGO = require("../../../assets/images/logoSuperTounsi.jpg");

export default function OutingPlannerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = getEventById(id ?? "");
  const plan = getOutingPlan(id ?? "");

  const [analysing, setAnalysing] = useState(true);
  const [bookState, setBookState] = useState<ButtonState>("idle");

  useEffect(() => {
    const t = setTimeout(() => setAnalysing(false), 900);
    return () => clearTimeout(t);
  }, []);

  const handleBookAll = () => {
    if (bookState !== "idle") return;
    setBookState("loading");
    setTimeout(() => setBookState("success"), 1600);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient colors={Gradients.ai} style={styles.iconCircle}>
            <Image source={LOGO} style={styles.logo} />
          </LinearGradient>
          <View>
            <Text style={styles.eyebrow}>SUPERTOUNSI AI</Text>
            <Text style={styles.title}>Outing Planner</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator contentContainerStyle={styles.content}>
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            Planning your perfect night at{" "}
            <Text style={styles.introHighlight}>{event?.title ?? "your event"}</Text>. Here's
            everything you need for an unforgettable outing.
          </Text>
        </View>

        {analysing ? (
          <View style={styles.analysingRow}>
            <ActivityIndicator color={Colors.brandBlue} size="small" />
            <Text style={styles.analysingText}>Analysing your preferences…</Text>
          </View>
        ) : (
          <>
            <WeatherCard value={plan.weather} />
            <TransportCard value={plan.transport} />
            <DinnerCard value={plan.dinner} />
            <HotelCard value={plan.hotel} />
            <BudgetCard value={plan.budget} />
            <LocalTipsCard value={plan.tips} />

            <View style={styles.buttonBlock}>
              <PrimaryButton
                label="Book Everything with 1 Tap"
                state={bookState}
                onPress={handleBookAll}
                successLabel="All Booked! View Summary"
              />
              <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85}>
                <Text style={styles.secondaryButtonText}>Share Plan with Friends</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logo: { width: 38, height: 38 },
  eyebrow: { ...Typography.label, color: Colors.textMuted },
  title: { ...Typography.h2, color: Colors.textPrimary, marginTop: 2 },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  introCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  introText: { ...Typography.body, color: Colors.textSecondary, lineHeight: 20 },
  introHighlight: { color: Colors.brandBlue, fontWeight: "700" },
  analysingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: Spacing.xxl,
    justifyContent: "center",
  },
  analysingText: { ...Typography.body, color: Colors.textMuted },
  buttonBlock: { marginTop: Spacing.md, gap: Spacing.sm },
  secondaryButton: {
    height: 50,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: { ...Typography.button, color: Colors.textSecondary },
});
