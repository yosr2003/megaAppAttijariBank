import React from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Gradients } from "../constants/home/Colors";
import { Radius, Spacing } from "../constants/home/Layout";
import { Typography } from "../constants/home/Typography";

const LOGO = require("../assets/images/logoSuperTounsi.jpg");

interface SearchBarProps {
  value?: string;
  onChangeText?: (v: string) => void;
  onPressAI?: () => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  onPressAI,
  placeholder = "Find concerts in Tunis under 50 DT…",
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={Colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        style={styles.input}
      />
      <TouchableOpacity activeOpacity={0.85} onPress={onPressAI}>
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.aiButton}
        >
          <Image source={LOGO} style={styles.aiAvatar} />
          <Text style={styles.aiLabel}>AI</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: Radius.pill,
    paddingLeft: Spacing.lg,
    paddingRight: 6,
    height: 50,
    gap: Spacing.sm,
    marginBottom: 20,
  },
  input: { flex: 1, ...Typography.body, color: Colors.textPrimary },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: Radius.pill,
  },
  aiAvatar: { width: 18, height: 18, borderRadius: 9 },
  aiLabel: { ...Typography.captionMedium, color: Colors.white },
});
