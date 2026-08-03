import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { categories } from "../data/categories";
import { CategoryKey } from "../types";
import CategoryItem from "./CategoryItem";
import { Colors } from "../constants/home/Colors";
import { Typography } from "../constants/home/Typography";
import { Spacing } from "../constants/home/Layout";

interface CategoryListProps {
  active: CategoryKey;
  onChange: (key: CategoryKey) => void;
}

export default function CategoryList({ active, onChange }: CategoryListProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {categories.map((c) => (
          <CategoryItem
            key={c.key}
            category={c}
            active={active === c.key}
            onPress={() => onChange(c.key)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary },
  row: { gap: Spacing.md, paddingRight: Spacing.lg },
});
