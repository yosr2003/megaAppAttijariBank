// components/GradientButtonCreateAcc.tsx
import React, { useRef } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  GestureResponderEvent,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface GradientButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
}

export default function GradientButton({
  title,
  onPress,
  disabled = false,
}: GradientButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  if (disabled) {
    return (
      <View style={[styles.button, styles.disabledButton]}>
        <View style={styles.content}>
          <Text style={[Typography.buttonText, styles.disabledText]}>{title}</Text>
          <Feather
            name="arrow-right"
            size={16}
            color="#4f5e7b"
            style={styles.icon}
          />
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={[Colors.btnGradientStart, Colors.btnGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <View style={styles.content}>
            <Text style={Typography.buttonText}>{title}</Text>
            <Feather
              name="arrow-right"
              size={16}
              color="#ffffff"
              style={styles.icon}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: Colors.btnGradientStart,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: 'rgba(28, 46, 86, 0.2)',
    borderWidth: 1.5,
    borderColor: '#1e3056',
    shadowOpacity: 0,
    elevation: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledText: {
    color: '#4f5e7b',
  },
  icon: {
    marginLeft: 8,
  },
});