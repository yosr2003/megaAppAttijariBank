import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/home/Colors";
import { Typography } from "../constants/home/Typography";
import { Radius } from "../constants/home/Layout";

type TabKey = "home" | "events" | "wallet" | "profile";

interface BottomNavigationProps {
  active?: TabKey;
  onChange?: (tab: TabKey) => void;
}

const TABS: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "home", label: "Home", icon: "home" },
  { key: "events", label: "Events", icon: "calendar" },
  { key: "wallet", label: "Wallet", icon: "wallet" },
  { key: "profile", label: "Profile", icon: "person" },
];

export default function BottomNavigation({ active = "home", onChange }: BottomNavigationProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.indicatorTrack}>
        <View
          style={[
            styles.indicator,
            { left: `${TABS.findIndex((t) => t.key === active) * 25}%` },
          ]}
        />
      </View>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            activeOpacity={0.8}
            onPress={() => onChange?.(tab.key)}
          >
            <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
              <Ionicons name={tab.icon} size={20} color={isActive ? Colors.white : Colors.textMuted} />
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundAlt,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 10,
  },
  indicatorTrack: { position: "absolute", top: 0, left: 0, right: 0, height: 3 },
  indicator: {
    position: "absolute",
    width: "25%",
    height: 3,
    backgroundColor: Colors.brandPurple,
    borderRadius: Radius.pill,
  },
  tab: { flex: 1, alignItems: "center", gap: 4 },
  iconBox: {
    width: 40,
    height: 30,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxActive: { backgroundColor: Colors.brandPurple },
  label: { ...Typography.caption, color: Colors.textMuted, fontSize: 11 },
  labelActive: { color: Colors.textPrimary, fontWeight: "600" },
});
