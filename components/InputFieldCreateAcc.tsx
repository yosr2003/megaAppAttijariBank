// components/InputFieldSignIn.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
   TextStyle,
  StyleProp,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface InputFieldProps extends Omit<TextInputProps, "style"> {
  label: string;
  leftIconName?: keyof typeof Feather.glyphMap;
  rightIconName?: keyof typeof Feather.glyphMap;
  rightText?: string;
  rightTextColor?: string;
  isPassword?: boolean;
  onRightIconPress?: () => void;

  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export default function InputField({
  label,
  leftIconName,
  rightIconName,
  rightText,
  rightTextColor = '#eab308',
  isPassword = false,
  onRightIconPress,
  containerStyle,
 inputStyle,
  ...props
}: InputFieldProps) {
const isFocused = useRef(false);
const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.labelRow}>
        <Text style={[Typography.inputLabel, styles.label]}>{label}</Text>
        {rightText && (
          <View style={styles.rightIndicator}>
            <Feather name="alert-circle" size={12} color={rightTextColor} style={styles.indicatorIcon} />
            <Text style={[styles.rightText, { color: rightTextColor }]}>{rightText}</Text>
          </View>
        )}
      </View>

        <View
            style={[
        styles.inputContainer,
        isFocused.current && styles.inputFocused,
        containerStyle,
      ]}
    >
        {leftIconName && (
          <Feather
            name={leftIconName}
            size={18}
           color={isFocused.current ? '#2c87e8' : '#6d80a1'}
            style={styles.leftIcon}
          />
        )}
        
           <TextInput
          {...props}
          style={[
            Typography.inputText,
            styles.input,
            inputStyle,
          ]}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={isPassword ? !showPassword : false}
          autoCapitalize="none"
          onFocus={() => {
            console.log("FOCUS");
            isFocused.current = true;
          }}
          onBlur={() => {
            console.log("BLUR");
            isFocused.current = false;
          }}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
            style={styles.rightIconButton}
          >
            <Feather
              name={showPassword ? 'eye-off' : 'eye'}
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        ) : (
          rightIconName && (
            <TouchableOpacity
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
              activeOpacity={0.7}
              style={styles.rightIconButton}
            >
              <Feather
                name={rightIconName}
                size={18}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: '600',
    color: '#6d80a1',
    letterSpacing: 0.5,
  },
  rightIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorIcon: {
    marginRight: 4,
  },
  rightText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
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
  leftIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#ffffff',
  },
  rightIconButton: {
    padding: 4,
    marginLeft: 8,
  },
});