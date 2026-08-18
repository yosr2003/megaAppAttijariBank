import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { Colors as HomeColors } from "../constants/home/Colors";
import { DISTANCE_STEPS_KM } from "../types/eventPreferences";

interface DistanceSliderProps {
  valueKm: number;
  onChangeKm: (km: number) => void;
}

export default function DistanceSlider({ valueKm, onChangeKm }: DistanceSliderProps) {
  const steps = DISTANCE_STEPS_KM;
  const currentIndex = Math.max(
    0,
    steps.findIndex((km) => km === valueKm)
  );

  const handleSlide = (index: number) => {
    const rounded = Math.round(index);
    onChangeKm(steps[rounded] ?? steps[steps.length - 1]);
  };

  return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={steps.length - 1}
        step={1}
        value={currentIndex}
        onValueChange={handleSlide}
        minimumTrackTintColor={HomeColors.brandBlue}
        maximumTrackTintColor={HomeColors.cardBorder}
        thumbTintColor={HomeColors.brandPurple}
      />
      <View style={styles.labelsRow}>
        {steps.map((km, index) => (
          <Text
            key={km}
            style={[
              styles.stepLabel,
              index === currentIndex && styles.stepLabelActive,
            ]}
          >
            {km >= 100 ? "100+" : km} km
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 4,
  },
  slider: {
    width: "100%",
    height: 36,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
    paddingHorizontal: 2,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: HomeColors.textMuted,
  },
  stepLabelActive: {
    color: HomeColors.brandPurple,
    fontWeight: "800",
  },
});