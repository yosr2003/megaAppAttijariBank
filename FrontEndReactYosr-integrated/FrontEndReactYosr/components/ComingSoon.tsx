import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import PrimaryButton from "./PrimaryButton";
import { Colors } from "../constants/home/Colors";
import { Layout, Radius, Spacing } from "../constants/home/Layout";
import { Typography } from "../constants/home/Typography";

interface ComingSoonProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
}

export default function ComingSoon({ title, description, icon, accentColor }: ComingSoonProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.body}>
        <View style={[styles.iconCircle, { backgroundColor: `${accentColor}33` }]}>
          <Ionicons name={icon} size={40} color={accentColor} />
        </View>
        <Text style={styles.title}>{title} arrive bientôt 🚀</Text>
        <Text style={styles.description}>{description}</Text>

        <PrimaryButton
          label="Retour à l'accueil"
          fullWidth={false}
          style={styles.button}
          onPress={() => router.replace("/home")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
  },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { ...Typography.h3, color: Colors.textPrimary },
  body: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: Layout.screenPadding * 1.5 },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: Radius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  title: { ...Typography.h2, color: Colors.textPrimary, textAlign: "center", marginBottom: Spacing.sm },
  description: { ...Typography.body, color: Colors.textSecondary, textAlign: "center", marginBottom: Spacing.xxl },
  button: { paddingHorizontal: Spacing.xxl },
});