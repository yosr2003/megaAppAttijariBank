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
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import Logo from '../../components/Logo';
import StepIndicator from '../../components/StepIndicator';
import Card from '../../components/Card';
import InputField from '../../components/InputFieldCreateAcc';
import DatePickerField from '../../components/DatePickerField';
import CustomDropdown from '../../components/CustomDropdown';
import UploadField from '../../components/UploadField';
import GradientButton from '../../components/GradientButtonCreateAcc';

export default function RoleInformationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const role = (params.role as string) || 'CLIENT';

  const [formData, setFormData] = useState<Record<string, any>>({});
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const getPageTitleAndSubtitle = () => {
    switch (role) {
      case 'CLIENT':
        return {
          title: 'Complete your Client Profile',
          subtitle: 'Please provide details to configure your banking and services account.',
        };
      case 'RESTAURANT_OWNER':
        return {
          title: 'Complete your Restaurant Profile',
          subtitle: 'Set up your restaurant registration details to start accepting orders.',
        };
      case 'SELLER':
        return {
          title: 'Complete your Seller Profile',
          subtitle: 'Provide your marketplace store information and business credentials.',
        };
      case 'DELIVERY_DRIVER':
        return {
          title: 'Complete your Delivery Profile',
          subtitle: 'Enter your delivery vehicle and license information to activate your profile.',
        };
      case 'TAXI_DRIVER':
        return {
          title: 'Complete your Taxi Profile',
          subtitle: 'Provide your driving permit and taxi license details to start driving.',
        };
      case 'HOTEL_OWNER':
        return {
          title: 'Complete your Hotel Profile',
          subtitle: 'Set up your accommodation business details and lodging license.',
        };
      case 'OTHER_PROFESSIONAL':
        return {
          title: 'Complete your Professional Profile',
          subtitle: 'Describe your business profile and upload supporting documentation.',
        };
      case 'ADMIN':
        return {
          title: 'Complete your Admin Profile',
          subtitle: 'Configure administrator access and platform management permissions.',
        };
      default:
        return {
          title: 'Complete your Profile',
          subtitle: 'Please fill in the required business or client information details.',
        };
    }
  };

  const { title: pageTitle, subtitle: pageSubtitle } = getPageTitleAndSubtitle();

  const isFormValid = () => {
    switch (role) {
      case 'CLIENT':
        return !!(
          formData.nationalId?.trim() &&
          formData.dateOfBirth &&
          formData.gender &&
          formData.preferredLanguage &&
          formData.address?.trim() &&
          formData.walletCurrency &&
          formData.paymentMethod &&
          formData.emergencyContact?.trim()
        );
      case 'RESTAURANT_OWNER':
        return !!(
          formData.restaurantName?.trim() &&
          formData.restaurantAddress?.trim() &&
          formData.businessRegNo?.trim() &&
          formData.taxNumber?.trim() &&
          formData.cuisineType?.trim() &&
          formData.openingTime?.trim() &&
          formData.closingTime?.trim() &&
          formData.phone?.trim() &&
          formData.email?.trim() &&
          formData.bankAccount?.trim() &&
          formData.logoUri &&
          formData.licenseUri
        );
      case 'SELLER':
        return !!(
          formData.storeName?.trim() &&
          formData.businessType?.trim() &&
          formData.taxNumber?.trim() &&
          formData.registrationNumber?.trim() &&
          formData.address?.trim() &&
          formData.phone?.trim() &&
          formData.email?.trim() &&
          formData.bankAccount?.trim() &&
          formData.storeLogoUri &&
          formData.licenseUri
        );
      case 'DELIVERY_DRIVER':
        return !!(
          formData.driverLicense?.trim() &&
          formData.vehicleType &&
          formData.plateNumber?.trim() &&
          formData.insuranceNumber?.trim() &&
          formData.deliveryZone?.trim() &&
          formData.emergencyContact?.trim() &&
          formData.vehiclePhotoUri &&
          formData.licenseUri
        );
      case 'TAXI_DRIVER':
        return !!(
          formData.taxiLicense?.trim() &&
          formData.driverLicense?.trim() &&
          formData.vehicleBrand?.trim() &&
          formData.vehicleModel?.trim() &&
          formData.vehicleColor?.trim() &&
          formData.plateNumber?.trim() &&
          formData.insurance?.trim() &&
          formData.currentCity?.trim() &&
          formData.vehiclePhotoUri
        );
      case 'HOTEL_OWNER':
        return !!(
          formData.hotelName?.trim() &&
          formData.address?.trim() &&
          formData.registrationNumber?.trim() &&
          formData.hotelPhone?.trim() &&
          formData.email?.trim() &&
          formData.numberOfRooms?.trim() &&
          formData.hotelCategory &&
          formData.bankAccount?.trim() &&
          formData.hotelPhotoUri
        );
      case 'OTHER_PROFESSIONAL':
        return !!(
          formData.profession?.trim() &&
          formData.businessName?.trim() &&
          formData.description?.trim() &&
          formData.address?.trim() &&
          formData.phone?.trim() &&
          formData.email?.trim() &&
          formData.website?.trim() &&
          formData.licenseUri
        );
      case 'ADMIN':
        return !!(
          formData.adminId?.trim() &&
          formData.department?.trim() &&
          formData.accessLevel &&
          formData.email?.trim() &&
          formData.phone?.trim()
        );
      default:
        return false;
    }
  };

  const handleContinue = () => {
    if (isFormValid()) {
      router.push('/(auth)/biometric-setup');
    } else {
      Alert.alert('Incomplete form', 'Please fill all required fields and upload documents');
    }
  };

  const renderRoleFormFields = () => {
    switch (role) {
      case 'CLIENT':
        return (
          <Card title="Client Details" iconName="user">
            <InputField
              label="National ID"
              placeholder="Enter national ID"
              leftIconName="credit-card"
              keyboardType="numeric"
              value={formData.nationalId || ''}
              onChangeText={(val) => updateField('nationalId', val)}
            />
            <DatePickerField
              label="Date of Birth"
              value={formData.dateOfBirth || null}
              onChange={(date) => updateField('dateOfBirth', date)}
            />
            <CustomDropdown
              label="Gender"
              value={formData.gender || ''}
              onChange={(val) => updateField('gender', val)}
              options={['Male', 'Female', 'Other']}
              placeholder="Select gender"
              leftIconName="user"
              modalTitle="Select Gender"
            />
            <CustomDropdown
              label="Preferred Language"
              value={formData.preferredLanguage || ''}
              onChange={(val) => updateField('preferredLanguage', val)}
              options={['Arabic', 'French', 'English']}
              placeholder="Select language"
              leftIconName="globe"
              modalTitle="Select Preferred Language"
            />
            <InputField
              label="Address"
              placeholder="Default home address"
              leftIconName="map-pin"
              value={formData.address || ''}
              onChangeText={(val) => updateField('address', val)}
            />
            <CustomDropdown
              label="Wallet Currency"
              value={formData.walletCurrency || ''}
              onChange={(val) => updateField('walletCurrency', val)}
              options={['TND (Tunisian Dinar)', 'USD (US Dollar)', 'EUR (Euro)']}
              placeholder="Select currency"
              leftIconName="dollar-sign"
              modalTitle="Select Currency"
            />
            <CustomDropdown
              label="Payment Method"
              value={formData.paymentMethod || ''}
              onChange={(val) => updateField('paymentMethod', val)}
              options={['Sobflous', 'D17', 'Credit Card', 'Bank Transfer', 'Cash on Delivery']}
              placeholder="Select payment method"
              leftIconName="credit-card"
              modalTitle="Select Payment Method"
            />
            <InputField
              label="Emergency Contact"
              placeholder="+216 50 123 456"
              leftIconName="phone"
              keyboardType="phone-pad"
              value={formData.emergencyContact || ''}
              onChangeText={(val) => updateField('emergencyContact', val)}
            />
          </Card>
        );
     case 'ADMIN':
  return (
    <Card title="Administrator Profile" iconName="shield">

      <InputField
        label="Administrator ID"
        placeholder="ADM-001"
        leftIconName="hash"
        value={formData.adminId || ''}
        onChangeText={(val) => updateField('adminId', val)}
      />

      <InputField
        label="Department"
        placeholder="IT, Management, Support..."
        leftIconName="briefcase"
        value={formData.department || ''}
        onChangeText={(val) => updateField('department', val)}
      />

      <CustomDropdown
        label="Access Level"
        value={formData.accessLevel || ''}
        onChange={(val) => updateField('accessLevel', val)}
        options={[
          'Super Admin',
          'Manager Admin',
          'Support Admin'
        ]}
        placeholder="Select access level"
        leftIconName="shield"
        modalTitle="Select Admin Permission"
      />

      <InputField
        label="Email Address"
        placeholder="admin@super-tounsi.com"
        leftIconName="mail"
        keyboardType="email-address"
        value={formData.email || ''}
        onChangeText={(val) => updateField('email', val)}
      />

      <InputField
        label="Phone Number"
        placeholder="+216 50 000 000"
        leftIconName="phone"
        keyboardType="phone-pad"
        value={formData.phone || ''}
        onChangeText={(val) => updateField('phone', val)}
      />

      <UploadField
        label="Authorization Document"
        value={formData.authorizationUri || null}
        onChange={(uri) => updateField('authorizationUri', uri)}
        placeholder="Upload admin authorization document"
        iconName="file"
      />

    </Card>
  );
      default:
        return null;
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
                  <Text style={styles.titleText}>{pageTitle}</Text>
                </View>
                <Text style={styles.subtitleText}>{pageSubtitle}</Text>
              </View>

              <StepIndicator currentStep={3} />

              <View style={styles.formContainer}>
                {renderRoleFormFields()}
              </View>

              <View style={styles.buttonContainer}>
                <GradientButton
                  title="Continue"
                  onPress={handleContinue}
                  disabled={!isFormValid()}
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
  subtitleText: {
    fontSize: 13,
    color: '#6d80a1',
    textAlign: 'left',
    width: '100%',
    paddingLeft: 14,
    marginTop: 4,
  },
  formContainer: {
    width: '100%',
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 20,
    width: '100%',
  },
});
