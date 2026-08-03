import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Gradients } from "../constants/home/Colors";
import { Radius } from "../constants/home/Layout";
import { Typography } from "../constants/home/Typography";

export type ButtonState = "idle" | "loading" | "success";

interface PrimaryButtonProps {
  label: string;
  loadingLabel?: string;
  successLabel?: string;
  state?: ButtonState;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  gradientColors?: readonly [string, string, ...string[]];
  successIcon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
}

export default function PrimaryButton({
  label,
  loadingLabel = "Booking…",
  successLabel = "Booked! View Ticket",
  state = "idle",
  onPress,
  disabled,
  style,
  gradientColors = Gradients.primary,
  successIcon = "checkmark-circle",
  fullWidth = true,
}: PrimaryButtonProps) {
  const isSuccess = state === "success";
  const isLoading = state === "loading";

  const colors = isSuccess ? (Gradients.success as unknown as readonly [string, string]) : gradientColors;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || isLoading || isSuccess}
      onPress={onPress}
      style={[fullWidth && styles.fullWidth, style]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        {isLoading ? (
          <View style={styles.row}>
            <ActivityIndicator color={Colors.white} size="small" />
            <Text style={styles.label}>{loadingLabel}</Text>
          </View>
        ) : isSuccess ? (
          <View style={styles.row}>
            <Ionicons name={successIcon} size={18} color={Colors.white} />
            <Text style={styles.label}>{successLabel}</Text>
          </View>
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: "100%" },
  button: {
    height: 52,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { ...Typography.button, color: Colors.white },
});
