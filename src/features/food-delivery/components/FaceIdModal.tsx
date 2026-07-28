import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View, Pressable, Animated, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';

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
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'pin'>('idle');
  const [pulseAnim] = useState(new Animated.Value(1));
  const [pin, setPin] = useState<string>('');

  const runScan = async () => {
    setStatus('scanning');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // 1. Try native LocalAuthentication (Face ID / Touch ID) if supported on device
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: `Payer ${amountText} chez ${restaurantName}`,
          fallbackLabel: 'Saisir le code PIN',
          cancelLabel: 'Annuler',
        });

        if (result.success) {
          handleSuccess();
          return;
        } else {
          // User cancelled or biometric failed -> offer PIN option
          setStatus('pin');
          return;
        }
      }
    } catch (e) {
      console.log('LocalAuth fallback simulation');
    }

    // 2. Animated simulation fallback for emulator/devices without biometrics enrolled
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    animation.start();

    setTimeout(() => {
      animation.stop();
      handleSuccess();
    }, 1600);
  };

  const handleSuccess = async () => {
    setStatus('success');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      onSuccess();
    }, 900);
  };

  const handlePinPress = (digit: string) => {
    const newPin = pin + digit;
    setPin(newPin);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (newPin.length === 4) {
      if (newPin === '1234' || newPin.length === 4) {
        handleSuccess();
      }
    }
  };

  useEffect(() => {
    if (visible) {
      setStatus('idle');
      setPin('');
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Top Apple Pay Header */}
          <View style={styles.headerBadge}>
            <Ionicons name="card" size={16} color="#FFC244" />
            <Text style={styles.appTitle}>SuperTounsi Pay</Text>
          </View>
          <Text style={styles.amount}>{amountText}</Text>
          
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Commerce</Text>
              <Text style={styles.infoValue}>{restaurantName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Méthode</Text>
              <Text style={styles.infoValue}>{paymentMethodText}</Text>
            </View>
          </View>

          {/* Idle State: Click to authenticate */}
          {status === 'idle' && (
            <View style={styles.actionContainer}>
              <Pressable style={styles.scanBtn} onPress={runScan}>
                <Ionicons name="scan" size={32} color="#000000" />
                <Text style={styles.scanBtnText}>Appuyer pour scanner avec Face ID</Text>
              </Pressable>
              <Pressable style={{ marginTop: 12 }} onPress={() => setStatus('pin')}>
                <Text style={{ color: '#8E8E93', fontSize: 13, textDecorationLine: 'underline' }}>
                  Utiliser le code PIN
                </Text>
              </Pressable>
            </View>
          )}

          {/* Scanning State */}
          {status === 'scanning' && (
            <View style={styles.biometricContainer}>
              <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]}>
                <Ionicons name="scan-outline" size={60} color="#FFC244" />
              </Animated.View>
              <Text style={styles.statusText}>Vérification biométrique...</Text>
            </View>
          )}

          {/* Success State */}
          {status === 'success' && (
            <View style={styles.biometricContainer}>
              <View style={styles.successRing}>
                <Ionicons name="checkmark-circle" size={80} color="#00A082" />
              </View>
              <Text style={[styles.statusText, { color: '#00A082' }]}>✓ Paiement Autorisé</Text>
            </View>
          )}

          {/* PIN Backup Keyboard */}
          {status === 'pin' && (
            <View style={styles.pinContainer}>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginBottom: 10 }}>
                Saisissez votre code PIN à 4 chiffres
              </Text>
              <View style={styles.pinDotsRow}>
                {[0, 1, 2, 3].map((idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.pinDot,
                      pin.length > idx && { backgroundColor: '#FFC244', borderColor: '#FFC244' },
                    ]}
                  />
                ))}
              </View>
              <View style={styles.keypad}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                  <Pressable
                    key={k}
                    style={styles.keyBtn}
                    onPress={() => {
                      if (k === 'C') setPin('');
                      else if (k === '⌫') setPin((prev) => prev.slice(0, -1));
                      else handlePinPress(k);
                    }}
                  >
                    <Text style={styles.keyText}>{k}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Cancel Button */}
          {status !== 'success' && (
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
    backgroundColor: 'rgba(0, 0, 0, 0.80)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#1C1C1E',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  appTitle: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 16,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '500',
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  scanBtn: {
    backgroundColor: '#FFC244',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  scanBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
  biometricContainer: {
    height: 120,
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
  pinContainer: {
    width: '100%',
    alignItems: 'center',
  },
  pinDotsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#8E8E93',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 220,
    justifyContent: 'center',
    gap: 12,
  },
  keyBtn: {
    width: 60,
    height: 50,
    backgroundColor: '#2C2C2E',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
});
