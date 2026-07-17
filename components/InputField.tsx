// components/InputField.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface InputFieldProps extends TextInputProps {
  label: string;
  isPassword?: boolean;
}

export default function InputField({
  label,
  isPassword = false,
  style,
  ...props
}: InputFieldProps) {
const isFocused = useRef(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <Text style={[Typography.inputLabel, styles.label]}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          isFocused.current && styles.inputFocused,
        ]}
      >
        <TextInput
      {...props}
      style={[
        Typography.inputText,
        styles.input,
        style,
      ]}
      placeholderTextColor={Colors.textMuted}
      secureTextEntry={isPassword && !showPassword}
      onFocus={() => {
      console.log("FOCUS");
      isFocused.current = true;
    }}

    onBlur={() => {
      console.log("BLUR");
      isFocused.current = false;
    }}
      autoCapitalize="none"
    />
        {isPassword && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
            style={styles.eyeButton}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
          >
            <Feather
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    backgroundColor: Colors.inputBg,
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: Colors.inputFocusedBorder,
    shadowColor: Colors.inputFocusedBorder,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#ffffff',
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
});