// components/BiometricSelectionCard.tsx
import React, { useRef } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface BiometricSelectionCardProps {
  type: 'fingerprint' | 'faceid';
  selected: boolean;
  onPress: () => void;
}

export default function BiometricSelectionCard({
  type,
  selected,
  onPress,
}: BiometricSelectionCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
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
  const title = isFingerprint ? 'Fingerprint' : 'Face ID';
  const description = isFingerprint
    ? 'Use your fingerprint to securely access your account'
    : 'Use facial recognition to securely access your account';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%', marginBottom: 16 }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.card,
          selected && styles.cardSelected,
        ]}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={title}
      >
        <View style={styles.contentRow}>
          <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
                    {isFingerprint ? (
            <MaterialCommunityIcons
                name="fingerprint"
                size={28}
                color={selected ? '#ffffff' : '#6d80a1'}
            />
            ) : (
            <MaterialCommunityIcons
                name="face-recognition"
                size={28}
                color={selected ? '#ffffff' : '#6d80a1'}
            />
            )}
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.title, selected && styles.textSelected]}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
            {selected && <View style={styles.radioInnerCircle} />}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardSelected: {
    borderColor: '#2c87e8',
    backgroundColor: 'rgba(44, 135, 232, 0.04)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#13213e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainerSelected: {
    backgroundColor: '#2c87e8',
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  textSelected: {
    color: '#ffffff',
  },
  description: {
    fontSize: 13,
    color: '#6d80a1',
    lineHeight: 18,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#1e3056',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#2c87e8',
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2c87e8',
  },
});