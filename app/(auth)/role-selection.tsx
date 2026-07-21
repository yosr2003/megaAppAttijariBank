import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import Logo from '../../components/Logo';
import StepIndicator from '../../components/StepIndicator';
import RoleCard from '../../components/RoleCard';
import GradientButton from '../../components/GradientButtonCreateAcc';

interface RoleOption {
  id: string;
  title: string;
  description: string;
  iconName: string;
  iconType: 'feather' | 'material';
  paramValue: string;
}

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const roles: RoleOption[] = [
    {
      id: '1',
      title: 'Client',
      description: 'Use all SuperTounsi services.',
      iconName: 'user',
      iconType: 'feather',
      paramValue: 'CLIENT',
    },
    
    {
      id: '2',
      title: 'Restaurant Owner',
      description: 'Manage your restaurant, menu and customer orders.',
      iconName: 'silverware-fork-knife',
      iconType: 'material',
      paramValue: 'RESTAURANT_OWNER',
    },
    {
      id: '3',
      title: 'Seller',
      description: 'Sell products through the marketplace.',
      iconName: 'tag',
      iconType: 'feather',
      paramValue: 'SELLER',
    },
    {
      id: '4',
      title: 'Taxi Driver',
      description: 'Receive ride requests and earn money.',
      iconName: 'taxi',
      iconType: 'material',
      paramValue: 'TAXI_DRIVER',
    },
    {
      id: '5',
      title: 'Delivery Driver',
      description: 'Deliver orders from restaurants and stores.',
      iconName: 'motorbike',
      iconType: 'material',
      paramValue: 'DELIVERY_DRIVER',
    },
    {
      id: '6',
      title: 'Hotel Owner',
      description: 'Manage rooms and reservations.',
      iconName: 'office-building',
      iconType: 'material',
      paramValue: 'HOTEL_OWNER',
    },
   
    {
      id: '7',
      title: 'Other Professional',
      description: 'Choose another business profile.',
      iconName: 'briefcase',
      iconType: 'feather',
      paramValue: 'OTHER_PROFESSIONAL',
    },
    {
  id: '8',
  title: 'Administrator',
  description: 'Manage users, services, approvals and platform settings.',
  iconName: 'shield',
  iconType: 'feather',
  paramValue: 'ADMIN',
},
  ];

  const handleContinue = () => {
    if (selectedRole) {
      router.push({
        pathname: '/(auth)/role-information',
        params: { role: selectedRole },
      });
    }
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
              
              <View style={styles.headerContainer}>
                <Logo />
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>SUPERTOUNSI</Text>
                </View>
                <View style={styles.titleWrapper}>
                  <View style={styles.titleCursor} />
                  <Text style={styles.titleText}>
                    Who are <Text style={styles.highlightText}>you</Text>?
                  </Text>
                </View>
                <Text style={styles.subtitleText}>
                  Select the profile that best describes you. You can always request another role later.
                </Text>
              </View>

              <StepIndicator currentStep={2} />

              <View style={styles.listContainer}>
                {roles.map((role) => (
                  <RoleCard
                    key={role.id}
                    title={role.title}
                    description={role.description}
                    iconName={role.iconName}
                    iconType={role.iconType}
                    selected={selectedRole === role.paramValue}
                    onPress={() => setSelectedRole(role.paramValue)}
                  />
                ))}
              </View>

              <View style={styles.buttonContainer}>
                <GradientButton
                  title="Continue"
                  onPress={handleContinue}
                  disabled={selectedRole === null}
                />
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
  listContainer: {
    width: '100%',
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 20,
    width: '100%',
  },
});
