import React, { useEffect, useRef, useState } from 'react';
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
import { enableTwoFactor } from '@/services/twoFactor';

type Method = 'email' | 'sms' | 'authenticator';

interface MethodOption {
  id: Method;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
}

const METHODS: MethodOption[] = [
  {
    id: 'email',
    icon: 'mail',
    title: 'Email',
    description: 'Receive a verification code by email.',
  },
  {
    id: 'sms',
    icon: 'smartphone',
    title: 'SMS',
    description: 'Receive a verification code by text message.',
  },
  {
    id: 'authenticator',
    icon: 'shield',
    title: 'Authenticator App',
    description: 'Google Authenticator, Microsoft Authenticator or compatible applications.',
  },
];

export default function Choose2FAMethodScreen() {
  const [selectedMethod, setSelectedMethod] = useState<Method | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { userId } = useLocalSearchParams();
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

const handleContinue = async () => {

    if (!selectedMethod) return;

    try {

        let backendMethod = "";

        switch (selectedMethod) {

            case "email":
                backendMethod = "EMAIL";
                break;

            case "sms":
                backendMethod = "SMS";
                break;

            case "authenticator":
                backendMethod = "AUTHENTICATOR";
                break;

        }

        await enableTwoFactor(
            Number(userId),
            backendMethod
        );

        router.replace({
            pathname:"/(auth)/two-factor-success",
            params:{
                method: backendMethod,
            }
        });

    } catch (e) {

        console.log(e);

    }

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
                <Text style={Typography.welcomeTitle}>Choose verification method</Text>
                <Text style={[Typography.welcomeSubtitle, styles.welcomeSubtitle]}>
                  Select how you would like to receive your verification code.
                </Text>
              </View>

              <View style={styles.methodsContainer}>
                {METHODS.map((method) => {
                  const isSelected = selectedMethod === method.id;

                  return (
                    <TouchableOpacity
                      key={method.id}
                      activeOpacity={0.7}
                      onPress={() => setSelectedMethod(method.id)}
                      style={[
                        styles.methodCard,
                        isSelected && styles.methodCardSelected,
                      ]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={method.title}
                    >
                      {isSelected && (
                        <View style={styles.checkIconContainer}>
                          <Feather name="check" size={14} color={Colors.primary} />
                        </View>
                      )}

                      <View style={styles.methodIconContainer}>
                        <Feather
                          name={method.icon}
                          size={22}
                          color={isSelected ? Colors.primary : Colors.textSecondary}
                        />
                      </View>

                      <View style={styles.methodTextContainer}>
                        <Text
                          style={[
                            styles.methodTitle,
                            isSelected && styles.methodTitleSelected,
                          ]}
                        >
                          {method.title}
                        </Text>
                        <Text style={styles.methodDescription}>{method.description}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ opacity: selectedMethod ? 1 : 0.5 }}>
                <GradientButton title="Continue" onPress={handleContinue} />
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
  methodsContainer: {
    width: '100%',
    marginBottom: 28,
    gap: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },
  methodCardSelected: {
    borderColor: Colors.primary,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  checkIconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIconContainer: {
    marginRight: 14,
    marginTop: 2,
  },
  methodTextContainer: {
    flex: 1,
    paddingRight: 24,
  },
  methodTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  methodTitleSelected: {
    color: Colors.primary,
  },
  methodDescription: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});