// app/(auth)/login.tsx
import React, { useEffect, useRef, useState } from 'react';
import { router } from "expo-router";
import { login } from "../../services/authService";
import { loginFace } from "../../services/face";
import { saveToken, saveUser } from "../../utils/storage";
import * as ImagePicker from 'expo-image-picker';
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
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import Logo from '../../components/Logo';
import InputField from '../../components/InputField';
import GradientButton from '../../components/GradientButton';
import Divider from '../../components/Divider';
import BiometricCard from '../../components/BiometricCard';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

const handleContinue = async () => {
  if (!email || !password) {
    Alert.alert("Error", "Please fill in all fields.");
    return;
  }

  try {
    const response = await login({
      email,
      password,
    });

if (response.status === "OTP_REQUIRED") {

  if (!response.userId) {
    Alert.alert(
      "Error",
      "User identifier missing"
    );
    return;
  }


  router.push({
    pathname: "/(auth)/otp-verification",
    params: {
      userId: String(response.userId),
      method: response.method ?? "EMAIL",
    },
  });


  return;
}

   if (!response.token) {
  Alert.alert(
    "Error",
    "Authentication token missing"
  );
  return;
}

await saveToken(response.token);
await saveUser(response);

    Alert.alert(
      "Success",
      `Welcome ${response.firstName} ${response.lastName}`
    );

    console.log(response);

    router.replace("/(tabs)/explore");
  } catch (error: any) {
    if (error.response) {
      Alert.alert(
        "Login failed",
        error.response.data.message || "Invalid credentials"
      );
    } else {
      Alert.alert(
        "Network Error",
        "Unable to connect to the server."
      );
    }
  }
};

const handleFaceLogin = async () => {

  try {


    const permission =
      await ImagePicker.requestCameraPermissionsAsync();


    if (!permission.granted) {

      Alert.alert(
        "Permission refusée",
        "La caméra est nécessaire pour la reconnaissance faciale."
      );

      return;
    }



    const result =
      await ImagePicker.launchCameraAsync({

        allowsEditing: true,

        quality: 0.8,

      });



    if(result.canceled){
      return;
    }



    const photoUri =
      result.assets[0].uri;



    const response =
      await loginFace(photoUri);



    await saveToken(response.token);

    await saveUser(response);



    Alert.alert(
      "Success",
      `Welcome ${response.firstName} ${response.lastName}`
    );



    router.replace("/(tabs)/explore");



  } catch(error:any){


    console.log(error);



    if(error.response){

      Alert.alert(
        "Face authentication failed",
        error.response.data || 
        "Face not recognized"
      );


    }else{


      Alert.alert(
        "Error",
        "Unable to connect to server"
      );


    }

  }

};


  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset flow initiated.');
  };

  const handleBiometricPress = (type: 'fingerprint' | 'faceid') => {
    const label = type === 'fingerprint' ? 'Fingerprint' : 'Face ID';
    Alert.alert('Biometrics', `Authenticating with ${label}...`);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
       <View style={{flex:1}}>
  <ScrollView
    contentContainerStyle={styles.scrollContent}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="always"
    keyboardDismissMode="none"
  >
           <View style={styles.card}>
              <View style={styles.logoContainer}>
                <Logo />
                <Text style={[Typography.appName, styles.appName]}>SuperTounsi</Text>
                <Text style={[Typography.subtitle, styles.subtitle]}>Banking Super App</Text>
              </View>

              <View style={styles.titleContainer}>
                <Text style={Typography.welcomeTitle}>Welcome back</Text>
                <Text style={[Typography.welcomeSubtitle, styles.welcomeSubtitle]}>
                  Sign in to your account
                </Text>
              </View>

              <View style={styles.formContainer}>
                <InputField
                  label="Email address"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
                
                <InputField
                  label="Password"
                  placeholder="••••••••"
                  isPassword={true}
                  value={password}
                  onChangeText={setPassword}
                />

                <TouchableOpacity
                  onPress={handleForgotPassword}
                  activeOpacity={0.7}
                  style={styles.forgotPasswordContainer}
                  accessibilityRole="button"
                  accessibilityLabel="Forgot password?"
                >
                  <Text style={Typography.forgotPassword}>Forgot password?</Text>
                </TouchableOpacity>

                <GradientButton title="Continue" onPress={handleContinue} />
              </View>

              <Divider text="or use biometrics" />

              <View style={styles.biometricsRow}>
                <BiometricCard
                  type="fingerprint"
                  onPress={() => handleBiometricPress('fingerprint')}
                />
               <BiometricCard
                  type="faceid"
                  onPress={handleFaceLogin}
                />

              </View>

            <View style={styles.footerContainer}>

  <View style={styles.accountContainer}>
    <Text style={styles.noAccountText}>
      Don't have an account? 
    </Text>

    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push("/(auth)/register")}
    >
      <Text style={styles.createAccountText}>
        Create an account
      </Text>
    </TouchableOpacity>
  </View>

  <View style={styles.securityContainer}>
    <Feather
      name="shield"
      size={14}
      color={Colors.textSecondary}
      style={styles.footerIcon}
    />
  </View>

</View>
            </View>
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
  keyboardAvoid: {
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
  formContainer: {
    width: '100%',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 24,
    paddingVertical: 4,
  },
  biometricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 28,
  },
footerContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 12,
},

securityContainer: {
  flexDirection: 'row',
  alignItems: 'center',
},

createAccountText: {
  color: Colors.primary,
  fontSize: 14,
  fontWeight: '600',
},

footerIcon: {
  marginRight: 6,
},
accountContainer: {
  flexDirection: 'row',
  alignItems: 'center',
},

noAccountText: {
  color: Colors.textSecondary,
  fontSize: 14,
  marginRight: 4,
},


});