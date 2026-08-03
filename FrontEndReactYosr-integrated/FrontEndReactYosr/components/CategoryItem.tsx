import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Category } from "../types";
import { Colors } from "../constants/home/Colors";
import { Radius, Spacing } from "../constants/home/Layout";
import { Typography } from "../constants/home/Typography";

interface CategoryItemProps {
  category: Category;
  active: boolean;
  onPress: () => void;
}

export default function CategoryItem({ category, active, onPress }: CategoryItemProps) {
  return (
    <TouchableOpacity style={styles.wrapper} activeOpacity={0.8} onPress={onPress}>
      <View style={[styles.iconBox, active && styles.iconBoxActive]}>
        <Ionicons
          name={category.icon}
          size={20}
          color={active ? Colors.white : Colors.textSecondary}
        />
      </View>
      <Text style={[styles.label, active && styles.labelActive]}>{category.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", width: 64, gap: 6 },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxActive: { backgroundColor: Colors.brandPurple },
  label: { ...Typography.caption, color: Colors.textSecondary },
  labelActive: { color: Colors.textPrimary, fontWeight: "600" },
});
