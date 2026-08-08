import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HomeModule } from "../data/homeModules";
import { Colors } from "../constants/home/Colors";
import { Radius, Spacing } from "../constants/home/Layout";
import { Typography } from "../constants/home/Typography";

interface HomeModuleCardProps {
  module: HomeModule;
  onPress?: () => void;
}

export default function HomeModuleCard({ module, onPress }: HomeModuleCardProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      {module.comingSoon && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Bientôt</Text>
        </View>
      )}
      <View style={[styles.iconCircle, { backgroundColor: `${module.color}33` }]}>
        <Ionicons name={module.icon} size={22} color={module.color} />
      </View>
      <Text style={styles.title}>{module.title}</Text>
      <Text style={styles.subtitle} numberOfLines={2}>
        {module.subtitle}
      </Text>
      <View style={styles.footer}>
        <Ionicons name="arrow-forward-circle" size={20} color={Colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    minHeight: 150,
    marginBottom: Spacing.md,
  },
  badge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.warningBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  badgeText: { color: Colors.warning, fontSize: 10, fontWeight: "700" },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: { ...Typography.title, color: Colors.textPrimary, marginBottom: 4 },
  subtitle: { ...Typography.caption, color: Colors.textSecondary, lineHeight: 16 },
  footer: { marginTop: Spacing.sm, alignItems: "flex-end" },
});