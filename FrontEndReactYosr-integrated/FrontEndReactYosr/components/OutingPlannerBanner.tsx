import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Colors, Gradients } from "../constants/home/Colors";
import { Radius, Spacing } from "../constants/home/Layout";
import { Typography } from "../constants/home/Typography";

const LOGO = require("../assets/images/logoSuperTounsi.jpg");

interface OutingPlannerBannerProps {
  eventId: string;
}

export default function OutingPlannerBanner({ eventId }: OutingPlannerBannerProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => router.push(`/planner/${eventId}`)}
    >
      <LinearGradient
        colors={Gradients.ai}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.iconCircle}>
          <Image source={LOGO} style={styles.logo} />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title}>Plan My Entire Outing</Text>
          <Text style={styles.subtitle}>Transport · Dining · Weather · Budget</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.white} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logo: { width: 40, height: 40 },
  textBlock: { flex: 1 },
  title: { ...Typography.title, color: Colors.white, fontWeight: "700" },
  subtitle: { ...Typography.caption, color: "rgba(255,255,255,0.85)", marginTop: 2 },
});
