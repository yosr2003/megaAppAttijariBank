import React, { useEffect, useRef } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import Logo from '../../components/Logo';
import GradientButton from '../../components/GradientButton';

export default function Enable2FAScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { userId } = useLocalSearchParams();
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

const handleEnable2FA = () => {

    router.push({
        pathname:"/(auth)/choose-2fa-method",
        params:{
            userId,
        }
    });

};

  const handleMaybeLater = () => {
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
              <View style={styles.logoContainer}>
                <Logo />
                <Text style={[Typography.appName, styles.appName]}>SuperTounsi</Text>
                <Text style={[Typography.subtitle, styles.subtitle]}>Banking Super App</Text>
              </View>

              <View style={styles.titleContainer}>
                <Text style={Typography.welcomeTitle}>Protect your account</Text>
                <Text style={[Typography.welcomeSubtitle, styles.welcomeSubtitle]}>
                  Increase your account security by enabling Two-Factor Authentication.
                </Text>
              </View>

              <View style={styles.infoBox}>
                <View style={styles.infoIconContainer}>
                  <Feather name="shield" size={24} color={Colors.primary} />
                </View>
                <Text style={styles.infoText}>
                  When 2FA is enabled, every new login will require an additional verification
                  code.
                </Text>
              </View>

              <View style={styles.buttonContainer}>
                <GradientButton title="Enable 2FA" onPress={handleEnable2FA} />

                <TouchableOpacity
                  onPress={handleMaybeLater}
                  activeOpacity={0.7}
                  style={styles.secondaryButton}
                  accessibilityRole="button"
                  accessibilityLabel="Maybe Later"
                >
                  <Text style={styles.secondaryButtonText}>Maybe Later</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </View>
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
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    borderRadius: 40,
    paddingVertical: 36,
    paddingHorizontal: 24,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appName: {
    marginTop: 16,
    marginBottom: 4,
  },
  subtitle: {
    color: Colors.textSecondary,
  },
  titleContainer: {
    marginBottom: 24,
    alignItems: 'flex-start',
    width: '100%',
  },
  welcomeSubtitle: {
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
    width: '100%',
  },
  infoIconContainer: {
    marginRight: 14,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
  },
  secondaryButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});