// components/BiometricCard.tsx
import React, { useRef } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface BiometricCardProps {
  type: 'fingerprint' | 'faceid';
  onPress: () => void;
}

export default function BiometricCard({ type, onPress }: BiometricCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const isFingerprint = type === 'fingerprint';
  const label = isFingerprint ? 'Fingerprint' : 'Face ID';

  return (
    <Animated.View style={[styles.animatedContainer, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.card}
        accessibilityRole="button"
        accessibilityLabel={`Sign in with ${label}`}
      >
        <View style={styles.iconContainer}>
          {isFingerprint ? (
            <Ionicons
              name="finger-print-outline"
              size={36}
              color={Colors.textSecondary}
            />
          ) : (
            <MaterialCommunityIcons
              name="face-recognition"
              size={36}
              color={Colors.textSecondary}
            />
          )}
        </View>
        <Text style={[Typography.biometricText, styles.label]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  card: {
    backgroundColor: Colors.biometricBg,
    borderWidth: 1,
    borderColor: Colors.biometricBorder,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginBottom: 8,
  },
  label: {
    color: Colors.textSecondary,
  },
});