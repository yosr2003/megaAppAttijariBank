import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface UploadFieldProps {
  label: string;
  value: string | null;
  onChange: (uri: string | null) => void;
  placeholder?: string;
  iconName?: keyof typeof Feather.glyphMap;
}

export default function UploadField({
  label,
  value,
  onChange,
  placeholder = 'Select file or photo',
  iconName = 'upload-cloud',
}: UploadFieldProps) {
  const handleSelectImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need gallery access permissions to upload your document/image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onChange(result.assets[0].uri);
      }
    } catch (error) {
      console.error('ImagePicker Error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRemoveImage = () => {
    onChange(null);
  };

  // Get a readable short name from URI
  const getFileName = (uri: string) => {
    const parts = uri.split('/');
    return parts[parts.length - 1] || 'document.jpg';
  };

  return (
    <View style={styles.container}>
      <Text style={[Typography.inputLabel, styles.label]}>{label}</Text>
      
      {value ? (
        <View style={styles.fileContainer}>
          <Image source={{ uri: value }} style={styles.thumbnail} />
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {getFileName(value)}
            </Text>
            <Text style={styles.fileStatus}>Ready to upload</Text>
          </View>
          <TouchableOpacity
            onPress={handleRemoveImage}
            style={styles.removeButton}
            activeOpacity={0.7}
          >
            <Feather name="trash-2" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handleSelectImage}
          activeOpacity={0.8}
          style={styles.uploadArea}
        >
          <Feather name={iconName} size={22} color="#2c87e8" style={styles.uploadIcon} />
          <Text style={styles.uploadText}>{placeholder}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: '600',
    color: '#6d80a1',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  uploadArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#1e3056',
    backgroundColor: 'rgba(19, 33, 62, 0.4)',
    paddingHorizontal: 16,
  },
  uploadIcon: {
    marginRight: 10,
  },
  uploadText: {
    fontSize: 14,
    color: '#6d80a1',
    fontWeight: '500',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1c2e56',
    backgroundColor: Colors.inputBg,
    paddingHorizontal: 12,
  },
  thumbnail: {
    width: 42,
    height: 42,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#040b19',
  },
  fileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  fileStatus: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
  },
});
