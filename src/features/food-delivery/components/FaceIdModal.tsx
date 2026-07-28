import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';

interface FaceIdModalProps {
  visible: boolean;
  amountText: string;
  restaurantName: string;
  paymentMethodText: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FaceIdModal({
  visible,
  amountText,
  restaurantName,
  paymentMethodText,
  onSuccess,
  onCancel,
}: FaceIdModalProps) {
  const [status, setStatus] = useState<'scanning' | 'success'>('scanning');
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (visible) {
      setStatus('scanning');

      // Pulse animation loop
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();

      // Trigger success after 1.8 seconds
      const timer = setTimeout(async () => {
        setStatus('success');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Wait 1 second on success checkmark before callback
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }, 1800);

      return () => {
        animation.stop();
        clearTimeout(timer);
      };
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <Text style={styles.appTitle}>SuperTounsi Pay</Text>
          <Text style={styles.amount}>{amountText}</Text>
          
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Restaurant</Text>
              <Text style={styles.infoValue}>{restaurantName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Paiement</Text>
              <Text style={styles.infoValue}>{paymentMethodText}</Text>
            </View>
          </View>

          {/* Biometric Scan Circle */}
          <View style={styles.biometricContainer}>
            {status === 'scanning' ? (
              <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]}>
                <Ionicons name="scan-outline" size={60} color="#FFC244" />
              </Animated.View>
            ) : (
              <View style={styles.successRing}>
                <Ionicons name="checkmark-circle" size={80} color="#00A082" />
              </View>
            )}
          </View>

          <Text style={styles.statusText}>
            {status === 'scanning' ? 'Confirmation Face ID...' : '✓ Paiement Confirmé'}
          </Text>

          {status === 'scanning' && (
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Annuler</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#1C1C1E',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  appTitle: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 20,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  biometricContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  pulseRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 194, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelText: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: '600',
  },
});
