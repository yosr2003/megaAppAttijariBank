// components/StepIndicator.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, label: 'Personal' },
    { number: 2, label: 'Identity' },
    { number: 3, label: 'Security' },
  ];

  const scale1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const scale3 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animateActiveStep = (scaleValue: Animated.Value) => {
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.15,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1.0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    };

    if (currentStep === 1) animateActiveStep(scale1);
    if (currentStep === 2) animateActiveStep(scale2);
    if (currentStep === 3) animateActiveStep(scale3);
  }, [currentStep, scale1, scale2, scale3]);

  const getScale = (stepNum: number) => {
    if (stepNum === 1) return scale1;
    if (stepNum === 2) return scale2;
    return scale3;
  };

  return (
    <View style={styles.container}>
      <View style={styles.lineBackground}>
        <View
          style={[
            styles.lineProgress,
            { width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' },
          ]}
        />
      </View>

      <View style={styles.stepsRow}>
        {steps.map((step) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;

          return (
            <View key={step.number} style={styles.stepItem}>
              <Animated.View
                style={[
                  styles.circle,
                  isActive && styles.activeCircle,
                  isCompleted && styles.completedCircle,
                  { transform: [{ scale: getScale(step.number) }] },
                ]}
              >
                <Text
                  style={[
                    styles.circleText,
                    isActive && styles.activeCircleText,
                    isCompleted && styles.completedCircleText,
                  ]}
                >
                  {step.number}
                </Text>
              </Animated.View>
              <Text
                style={[
                  styles.label,
                  isActive && styles.activeLabel,
                  isCompleted && styles.completedLabel,
                ]}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '80%',
    alignSelf: 'center',
    marginVertical: 24,
    position: 'relative',
  },
  lineBackground: {
    position: 'absolute',
    top: 18,
    left: '10%',
    right: '10%',
    height: 2,
    backgroundColor: '#1c2e56',
    zIndex: 1,
  },
  lineProgress: {
    height: '100%',
    backgroundColor: '#2c87e8',
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  stepItem: {
    alignItems: 'center',
    width: 70,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#1c2e56',
    backgroundColor: '#040b19',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeCircle: {
    borderColor: '#2c87e8',
    backgroundColor: '#2c87e8',
  },
  completedCircle: {
    borderColor: '#2c87e8',
    backgroundColor: '#13213e',
  },
  circleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6d80a1',
  },
  activeCircleText: {
    color: '#ffffff',
  },
  completedCircleText: {
    color: '#2c87e8',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6d80a1',
  },
  activeLabel: {
    color: '#2c87e8',
  },
  completedLabel: {
    color: '#2c87e8',
  },
});