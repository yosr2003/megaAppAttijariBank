import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Colors as AuthColors } from "../constants/Colors";
import { Colors as HomeColors, Gradients } from "../constants/home/Colors";
import { LinearGradient } from "expo-linear-gradient";

interface PreferenceProgressProps {
  currentStep: number; // 1-based
  totalSteps: number;
  stepLabel?: string;
}

export default function PreferenceProgress({
  currentStep,
  totalSteps,
  stepLabel,
}: PreferenceProgressProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const progressRatio = totalSteps > 1 ? (currentStep - 1) / (totalSteps - 1) : 0;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progressRatio,
      duration: 450,
      useNativeDriver: false,
    }).start();
  }, [progressRatio, widthAnim]);

  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["6%", "100%"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.stepText}>
          Étape {currentStep} sur {totalSteps}
          {stepLabel ? ` · ${stepLabel}` : ""}
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fillWrapper, { width: widthInterpolated }]}>
          <LinearGradient
            colors={Gradients.ai as unknown as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fill}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 18,
    marginBottom: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 8,
  },
  stepText: {
    fontSize: 12,
    fontWeight: "600",
    color: AuthColors.textSecondary,
    letterSpacing: 0.4,
  },
  track: {
    width: "100%",
    height: 6,
    borderRadius: 999,
    backgroundColor: AuthColors.inputBg,
    overflow: "hidden",
  },
  fillWrapper: {
    height: "100%",
  },
  fill: {
    flex: 1,
    borderRadius: 999,
  },
});