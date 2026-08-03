// components/ProfileAvatar.tsx
import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface ProfileAvatarProps {
  imageUri: string | null;
  onImagePicked: (uri: string | null) => void;
}

export default function ProfileAvatar({ imageUri, onImagePicked }: ProfileAvatarProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      onImagePicked(result.assets[0].uri);
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={pickImage}
        style={styles.avatarButton}
        accessibilityRole="button"
        accessibilityLabel="Upload Profile Photo"
      >
        <View style={styles.avatarOutline}>
          <View style={styles.avatarInner}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.avatarImage} />
            ) : (
              <Feather name="user" size={48} color="#6d80a1" />
            )}
          </View>
        </View>

        <View style={styles.cameraBadge}>
          <Ionicons name="camera-outline" size={16} color="#ffffff" />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
        <Text style={[Typography.forgotPassword, styles.uploadText]}>
          Upload Profile Photo
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarButton: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarOutline: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1.5,
    borderColor: '#2c87e8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#13213e',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#2c87e8',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#040b19',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c87e8',
    marginTop: 4,
  },
});