// app/(auth)/biometric-setup.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Animated,
  Alert,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import Logo from '../../components/Logo';
import BiometricSelectionCard from '../../components/BiometricSelectionCard';
import GradientButton from '../../components/GradientButtonCreateAcc';

export default function BiometricSetupScreen() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<'fingerprint' | 'faceid' | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleBiometricAuth = async () => {
    if (!selectedMethod) return;

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert(
          'Not Supported',
          'Your device does not support biometric authentication.'
        );
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert(
          'Not Enrolled',
          'Please enroll your biometrics in your device settings first.'
        );
        return;
      }
// test
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      const supportsFingerprint = supportedTypes.includes(
        LocalAuthentication.AuthenticationType.FINGERPRINT
      );
      const supportsFaceId = supportedTypes.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
      );

      if (selectedMethod === 'fingerprint' && !supportsFingerprint) {
        Alert.alert(
          'Unsupported Method',
          'Your device hardware supports biometrics but not Fingerprint identification.'
        );
        return;
      }

      if (selectedMethod === 'faceid' && !supportsFaceId) {
        Alert.alert(
          'Unsupported Method',
          'Your device hardware supports biometrics but not Face ID/facial recognition.'
        );
        return;
      }

      const methodLabel = selectedMethod === 'fingerprint' ? 'Fingerprint' : 'Face ID';
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Register your ${methodLabel} for SuperTounsi`,
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        Alert.alert(
          'Success',
          `${methodLabel} registration completed successfully!`,
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/(auth)/login');
              },
            },
          ]
        );
      } else {
        if (result.error !== 'user_cancel' && result.error !== 'system_cancel') {
          Alert.alert('Authentication Failed', `Error: ${result.error || 'Please try again'}`);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred during biometric setup.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
            <View style={styles.headerContainer}>
              <Logo />
              <Text style={styles.titleText}>Choose your biometric method</Text>
              <Text style={styles.subtitleText}>
                Secure your account with fast and safe biometric authentication
              </Text>
            </View>

            <View style={styles.cardsContainer}>
              <BiometricSelectionCard
                type="fingerprint"
                selected={selectedMethod === 'fingerprint'}
                onPress={() => setSelectedMethod('fingerprint')}
              />

              <BiometricSelectionCard
                type="faceid"
                selected={selectedMethod === 'faceid'}
                onPress={() => setSelectedMethod('faceid')}
              />
            </View>

            <View style={styles.buttonContainer}>
              <GradientButton
                title="Continue"
                onPress={handleBiometricAuth}
                disabled={selectedMethod === null}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 36,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  mainContent: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 36,
    width: '100%',
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 14,
    color: '#6d80a1',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  cardsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
  },
});