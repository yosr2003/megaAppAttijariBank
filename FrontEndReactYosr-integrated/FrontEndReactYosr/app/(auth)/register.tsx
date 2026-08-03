import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import Logo from '../../components/Logo';
import StepIndicator from '../../components/StepIndicator';
import ProfileAvatar from '../../components/ProfileAvatar';
import Card from '../../components/Card';
import InputField from '../../components/InputFieldCreateAcc';
import DatePickerField from '../../components/DatePickerField';
import GenderPicker from '../../components/GenderPicker';
import GradientButton from '../../components/GradientButtonCreateAcc';

export default function RegisterScreen() {
  const router = useRouter();

  // Form states
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fade-in animation on screen mount
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Check if form is valid to enable Continue button
  const isFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    nationalId.trim().length > 0 &&
    dateOfBirth !== null &&
    gender !== '' &&
    phoneNumber.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    password === confirmPassword;

  const handleContinue = () => {
    if (isFormValid) {
      console.log("GO TO ROLE SELECTION");
      router.push({
 pathname:"/(auth)/role-selection",
 params:{
    firstName,
    lastName,
    cin:nationalId,
    dateOfBirth: dateOfBirth?.toISOString(),
    gender,
    phoneNumber,
    email,
    password,
    profileImage
 }
});
    }
  };

  const handleSignIn = () => {
    router.push('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
              
              {/* Logo & App Name Header */}
              <View style={styles.headerContainer}>
                <Logo />
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>SUPERTOUNSI</Text>
                </View>
                <View style={styles.titleWrapper}>
                  <View style={styles.titleCursor} />
                  <Text style={styles.titleText}>
                    Create your <Text style={styles.highlightText}>SuperTounsi</Text> Account
                  </Text>
                </View>
                <Text style={styles.subtitleText}>
                  Tunisia's next-generation digital banking experience.
                </Text>
              </View>

              {/* Step Progress Indicator */}
              <StepIndicator currentStep={1} />

              {/* Profile Avatar Uploader */}
              <ProfileAvatar
                imageUri={profileImage}
                onImagePicked={setProfileImage}
              />

              {/* Personal Info Card */}
              <Card title="Personal Information" iconName="user">
                <InputField
                  label="First Name"
                  placeholder="Yassine"
                  leftIconName="user"
                  value={firstName}
                  onChangeText={setFirstName}
                />
                
                <InputField
                  label="Last Name"
                  placeholder="Trabelsi"
                  leftIconName="user"
                  value={lastName}
                  onChangeText={setLastName}
                />
                
                <InputField
                  label="National ID (CIN)"
                  placeholder="12345678"
                  leftIconName="credit-card"
                  keyboardType="numeric"
                  value={nationalId}
                  onChangeText={setNationalId}
                />

                <DatePickerField
                  label="Date of Birth"
                  value={dateOfBirth}
                  onChange={setDateOfBirth}
                />

                <GenderPicker
                  label="Gender"
                  value={gender}
                  onChange={setGender}
                />
              </Card>

              {/* Contact Details Card */}
              <Card title="Contact Details" iconName="phone">
                <InputField
                  label="Phone Number"
                  placeholder="+216 50 123 456"
                  leftIconName="phone"
                  keyboardType="phone-pad"
                  rightText="Pending"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />

                <InputField
                  label="Email Address"
                  placeholder="yassine@email.com"
                  leftIconName="mail"
                  keyboardType="email-address"
                  rightText="Pending"
                  value={email}
                  onChangeText={setEmail}
                />
              </Card>

              {/* Security Card */}
              <Card title="Security" iconName="lock">
                <InputField
                  label="Password"
                  placeholder="Min. 8 characters"
                  leftIconName="lock"
                  isPassword={true}
                  value={password}
                  onChangeText={setPassword}
                />

                <InputField
                  label="Confirm Password"
                  placeholder="Repeat password"
                  leftIconName="lock"
                  isPassword={true}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </Card>

              {/* Continue Button */}
              <View style={styles.buttonContainer}>
                        <GradientButton
              title="Who are you ?"
              onPress={handleContinue}
              disabled={!isFormValid}
            />
              </View>

              {/* Footer Sign In Option */}
              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>
                  Already have an account?{' '}
                  <Text style={styles.signInLink} onPress={handleSignIn}>
                    Sign In
                  </Text>
                </Text>
              </View>

            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  mainContent: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeContainer: {
    borderWidth: 1,
    borderColor: '#1c2e56',
    borderRadius: 20,
    backgroundColor: 'rgba(28, 46, 86, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 16,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2c87e8',
    letterSpacing: 1.5,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingRight: 10,
  },
  titleCursor: {
    width: 3.5,
    height: 30,
    backgroundColor: '#ffffff',
    marginRight: 10,
    borderRadius: 2,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  highlightText: {
    color: '#2c87e8',
  },
  subtitleText: {
    fontSize: 13,
    color: '#6d80a1',
    textAlign: 'left',
    width: '100%',
    paddingLeft: 14,
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 20,
    width: '100%',
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#6d80a1',
  },
  signInLink: {
    color: '#2c87e8',
    fontWeight: '700',
  },
});
