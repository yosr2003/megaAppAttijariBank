import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { Colors as HomeColors, Gradients } from "../constants/home/Colors";

interface BudgetRangeSelectorProps {
  min: number;
  max: number;
  minBound: number;
  maxBound: number;
  step?: number;
  disabled?: boolean;
  onChange: (min: number, max: number) => void;
}

const GAP = 10; // écart minimum garanti entre min et max, en DT

export default function BudgetRangeSelector({
  min,
  max,
  minBound,
  maxBound,
  step = 10,
  disabled = false,
  onChange,
}: BudgetRangeSelectorProps) {
  const range = maxBound - minBound || 1;
  const leftPercent = ((min - minBound) / range) * 100;
  const widthPercent = ((max - min) / range) * 100;

  const handleMinChange = (value: number) => {
    const clamped = Math.min(value, max - GAP);
    onChange(Math.max(minBound, clamped), max);
  };

  const handleMaxChange = (value: number) => {
    const clamped = Math.max(value, min + GAP);
    onChange(min, Math.min(maxBound, clamped));
  };

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <View style={styles.valuesRow}>
        <View style={styles.valuePill}>
          <Text style={styles.valueText}>{min} DT</Text>
        </View>
        <Text style={styles.dash}>—</Text>
        <View style={styles.valuePill}>
          <Text style={styles.valueText}>{max} DT</Text>
        </View>
      </View>

      <View style={styles.trackWrapper}>
        <View style={styles.trackBackground} />
        <View
          style={[
            styles.trackFillWrapper,
            { left: `${leftPercent}%`, width: `${widthPercent}%` },
          ]}
        >
          <LinearGradient
            colors={Gradients.primary as unknown as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.trackFill}
          />
        </View>

        <Slider
          style={styles.slider}
          minimumValue={minBound}
          maximumValue={maxBound}
          step={step}
          value={min}
          disabled={disabled}
          onValueChange={handleMinChange}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor={HomeColors.textOnGradient}
        />
        <Slider
          style={styles.slider}
          minimumValue={minBound}
          maximumValue={maxBound}
          step={step}
          value={max}
          disabled={disabled}
          onValueChange={handleMaxChange}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor={HomeColors.textOnGradient}
        />
      </View>

      <View style={styles.boundsRow}>
        <Text style={styles.boundLabel}>{minBound} DT</Text>
        <Text style={styles.boundLabel}>{maxBound}+ DT</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  disabled: {
    opacity: 0.4,
  },
  valuesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    gap: 10,
  },
  valuePill: {
    backgroundColor: HomeColors.cardAlt,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: HomeColors.cardBorder,
  },
  valueText: {
    color: HomeColors.textPrimary,
    fontWeight: "700",
    fontSize: 14,
  },
  dash: {
    color: HomeColors.textMuted,
  },
  trackWrapper: {
    height: 40,
    justifyContent: "center",
  },
  trackBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 999,
    backgroundColor: HomeColors.cardBorder,
  },
  trackFillWrapper: {
    position: "absolute",
    height: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
  trackFill: {
    flex: 1,
  },
  slider: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 40,
  },
  boundsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  boundLabel: {
    fontSize: 11,
    color: HomeColors.textMuted,
    fontWeight: "600",
  },
});