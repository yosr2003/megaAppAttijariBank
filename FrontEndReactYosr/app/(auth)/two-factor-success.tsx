import React, { useEffect, useRef } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  StyleSheet,
  View,
  Text,
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

export default function TwoFactorSuccessScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { method } = useLocalSearchParams();
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  

  const handleContinueToLogin = () => {
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

              <View style={styles.successIconContainer}>
                <Feather name="check-circle" size={64} color={Colors.primary} />
              </View>

              <View style={styles.titleContainer}>
                <Text style={[Typography.welcomeTitle, styles.centeredTitle]}>
                  Two-Factor Authentication Enabled
                </Text>
                <Text style={[Typography.welcomeSubtitle, styles.welcomeSubtitle, styles.centeredSubtitle]}>
                  Your account is now protected with an additional security layer.
                </Text>
              </View>

              <View style={styles.infoBox}>
                <View style={styles.infoIconContainer}>
                  <Feather name="lock" size={22} color={Colors.primary} />
                </View>
                <Text style={styles.infoText}>
                  You will be asked for a verification code every time you sign in from a new
                  device.
                </Text>
              </View>
              <View style={styles.methodContainer}>
                <Text style={styles.methodLabel}>
                  Verification Method
                </Text>

                <Text style={styles.methodValue}>
                  {method === "EMAIL"
                    ? "Email"
                    : method === "SMS"
                    ? "SMS"
                    : "Authenticator App"}
                </Text>
              </View>
              <GradientButton title="Continue to Login" onPress={handleContinueToLogin} />
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
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  titleContainer: {
    marginBottom: 24,
    alignItems: 'center',
    width: '100%',
  },
  centeredTitle: {
    textAlign: 'center',
  },
  welcomeSubtitle: {
    marginTop: 4,
  },
  centeredSubtitle: {
    textAlign: 'center',
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
  methodContainer: {
  marginBottom: 28,
  alignItems: "center",
},

methodLabel: {
  color: Colors.textSecondary,
  fontSize: 14,
},

methodValue: {
  marginTop: 6,
  color: Colors.primary,
  fontSize: 18,
  fontWeight: "700",
}
});