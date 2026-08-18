import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors as HomeColors, Gradients } from "../constants/home/Colors";

interface PreferenceOptionCardProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
  /** "grid" = grande carte carrée (ex: centres d'intérêt), "chip" = pilule compacte (ex: périodes, villes) */
  variant?: "grid" | "chip";
}

export default function PreferenceOptionCard({
  label,
  icon,
  selected,
  onPress,
  variant = "grid",
}: PreferenceOptionCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const popAnim = useRef(new Animated.Value(selected ? 1 : 0.85)).current;

  useEffect(() => {
    Animated.spring(popAnim, {
      toValue: selected ? 1 : 0.85,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [selected, popAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }).start();
  };

  const isChip = variant === "chip";

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        {selected ? (
          <LinearGradient
            colors={Gradients.primary as unknown as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              isChip ? styles.chipBase : styles.gridBase,
              styles.selectedGlow,
            ]}
          >
            <Content icon={icon} label={label} selected isChip={isChip} popAnim={popAnim} />
          </LinearGradient>
        ) : (
          <View style={[isChip ? styles.chipBase : styles.gridBase, styles.unselected]}>
            <Content icon={icon} label={label} selected={false} isChip={isChip} popAnim={popAnim} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

function Content({
  icon,
  label,
  selected,
  isChip,
  popAnim,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  selected: boolean;
  isChip: boolean;
  popAnim: Animated.Value;
}) {
  if (isChip) {
    return (
      <View style={styles.chipContent}>
        <Ionicons
          name={icon}
          size={16}
          color={selected ? HomeColors.textOnGradient : HomeColors.textSecondary}
        />
        <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
        {selected && (
          <Animated.View style={{ transform: [{ scale: popAnim }] }}>
            <Ionicons name="checkmark-circle" size={15} color={HomeColors.textOnGradient} style={styles.checkIcon} />
          </Animated.View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.gridContent}>
      <View style={[styles.iconCircle, selected && styles.iconCircleSelected]}>
        <Ionicons name={icon} size={24} color={selected ? HomeColors.textOnGradient : HomeColors.textSecondary} />
      </View>
      <Text style={[styles.gridLabel, selected && styles.gridLabelSelected]} numberOfLines={2}>
        {label}
      </Text>
      {selected && (
        <Animated.View style={[styles.checkBadge, { transform: [{ scale: popAnim }] }]}>
          <Ionicons name="checkmark" size={12} color={HomeColors.brandBlue} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gridBase: {
    width: 104,
    height: 104,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1.5,
  },
  chipBase: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  unselected: {
    backgroundColor: HomeColors.card,
    borderColor: HomeColors.cardBorder,
  },
  selectedGlow: {
    borderColor: "transparent",
    shadowColor: HomeColors.brandPurple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  gridContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gridLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: HomeColors.textSecondary,
    textAlign: "center",
  },
  gridLabelSelected: {
    color: HomeColors.textOnGradient,
    fontWeight: "700",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleSelected: {
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  checkBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: HomeColors.textOnGradient,
    alignItems: "center",
    justifyContent: "center",
  },
  chipContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: HomeColors.textSecondary,
  },
  chipLabelSelected: {
    color: HomeColors.textOnGradient,
  },
  checkIcon: {
    marginLeft: 2,
  },
});