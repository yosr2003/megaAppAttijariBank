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
  TextInput,
  Alert,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import Logo from '../../components/Logo';
import GradientButton from '../../components/GradientButton';
import { generateOtp, verifyOtp } from '../../services/twoFactor';
import { saveToken, saveUser } from '../../utils/storage';
import { redirectAfterAuth } from '../../utils/postAuthNavigation';

type TwoFactorMethod = 'EMAIL' | 'SMS' | 'AUTHENTICATOR';

const OTP_LENGTH = 6;

export default function OtpVerificationScreen() {
  const params = useLocalSearchParams<{ userId: string; method: string }>();
  const userId = Number(params.userId);
  const method = (params.method?.toUpperCase() || 'EMAIL') as TwoFactorMethod;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

 useEffect(() => {
  const sendInitialOtp = async () => {

    if (!userId || Number.isNaN(userId)) {
      Alert.alert("Error", "Invalid user session.");
      router.replace("/(auth)/login");
      return;
    }

    if (method === "AUTHENTICATOR") {
      return;
    }

    try {
      await generateOtp(userId);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Unable to send verification code."
      );
    }
  };

  sendInitialOtp();

}, [userId, method]);

  const getSubtitle = () => {
    switch (method) {
      case 'SMS':
        return 'A verification code was sent to your phone.';
      case 'AUTHENTICATOR':
        return 'Enter the code from your authenticator application';
      case 'EMAIL':
      default:
        return 'A verification code was sent to your email.';
    }
  };

  const getMethodMessage = () => {
    switch (method) {
      case 'SMS':
        return 'Code sent by SMS';
      case 'AUTHENTICATOR':
        return 'Enter the code from your authenticator application';
      case 'EMAIL':
      default:
        return 'Code sent to your email address';
    }
  };

 const handleOtpChange = (value: string, index: number) => {

  const digit = value.replace(/[^0-9]/g, "").slice(-1);

  const nextOtp = [...otp];
  nextOtp[index] = digit;
  setOtp(nextOtp);

  if (digit) {

    if (index < OTP_LENGTH - 1) {

      inputRefs.current[index + 1]?.focus();

    } else {

      Keyboard.dismiss();

    }

  }

};

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');

    if (code.length !== OTP_LENGTH) {
      Alert.alert('Error', 'Please enter the 6-digit verification code.');
      return;
    }

    if (!userId || Number.isNaN(userId)) {
      Alert.alert('Error', 'Invalid user session. Please login again.');
      router.replace('/(auth)/login');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await verifyOtp(userId, code);

     if(!response.token){

 Alert.alert(
   "Error",
   "Token missing after verification"
 );

 return;

}


await saveToken(response.token);
      await saveUser(response);

      Alert.alert(
        'Success',
        `Welcome ${response.firstName} ${response.lastName}`
      );

      await redirectAfterAuth(response);
    } catch (error: any) {
      Alert.alert(
        'Verification failed',
        error.response?.data?.message || 'Invalid or expired verification code'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (method === 'AUTHENTICATOR') {
      return;
    }

    if (!userId || Number.isNaN(userId)) {
      Alert.alert('Error', 'Invalid user session. Please login again.');
      router.replace('/(auth)/login');
      return;
    }

    setIsResending(true);

    try {
      await generateOtp(userId);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      Alert.alert('Verification code sent');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Unable to resend verification code.'
      );
    } finally {
      setIsResending(false);
    }
  };

  const isCodeComplete = otp.every((digit) => digit.length === 1);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
          >
            <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
              <View style={styles.logoContainer}>
                <Logo />
                <Text style={[Typography.appName, styles.appName]}>SuperTounsi</Text>
                <Text style={[Typography.subtitle, styles.subtitle]}>Banking Super App</Text>
              </View>

              <View style={styles.titleContainer}>
                <Text style={Typography.welcomeTitle}>Verify your identity</Text>
                <Text style={[Typography.welcomeSubtitle, styles.welcomeSubtitle]}>
                  {getSubtitle()}
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Feather
                  name="shield"
                  size={20}
                  color={Colors.primary}
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>{getMethodMessage()}</Text>
              </View>

              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      digit.length > 0 && styles.otpInputFilled,
                    ]}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={(event) => handleKeyPress(event, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    textContentType="oneTimeCode"
                    autoComplete="sms-otp"
                    accessibilityLabel={`Verification code digit ${index + 1}`}
                  />
                ))}
              </View>

              <View style={styles.buttonContainer}>
                <View style={{ opacity: isCodeComplete && !isVerifying ? 1 : 0.5 }}>
                  <GradientButton
                    title={isVerifying ? 'Verifying...' : 'Verify Code'}
                    onPress={handleVerify}
                  />
                </View>

                {method !== 'AUTHENTICATOR' && (
                  <TouchableOpacity
                    onPress={handleResendCode}
                    activeOpacity={0.7}
                    disabled={isResending}
                    style={styles.resendContainer}
                    accessibilityRole="button"
                    accessibilityLabel="Resend Code"
                  >
                    <Text style={styles.resendText}>
                      {isResending ? 'Sending...' : 'Resend Code'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.footerContainer}>
                <View style={styles.securityContainer}>
                  <Feather
                    name="shield"
                    size={14}
                    color={Colors.textSecondary}
                    style={styles.footerIcon}
                  />
                  <Text style={styles.footerText}>Secure verification</Text>
                </View>
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
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
    padding: 14,
    marginBottom: 28,
    width: '100%',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 28,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    maxWidth: 52,
    height: 56,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    backgroundColor: Colors.background,
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: Colors.primary,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 12,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  resendText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  securityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    marginRight: 6,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});