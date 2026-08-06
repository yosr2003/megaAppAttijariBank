import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/src/hooks/use-theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  error?: string;
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

/** Labeled input with typed native props and optional validation feedback. */
export function Input({ containerStyle, error, label, onFocus, onBlur, ...props }: InputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={[styles.label, { ...theme.typography.caption, color: theme.colors.textPrimary, marginBottom: theme.spacing.xs }]}>
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={theme.colors.textSecondary}
        onFocus={(e) => {
          setIsFocused(true);
          if (onFocus) onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          if (onBlur) onBlur(e);
        }}
        style={[
          styles.input, 
          { 
            ...theme.typography.body, 
            backgroundColor: theme.colors.surface, 
            borderColor: theme.colors.border, 
            borderRadius: theme.borderRadius.md, 
            borderWidth: 1, 
            color: theme.colors.textPrimary, 
            minHeight: 52, 
            paddingHorizontal: theme.spacing.md 
          }, 
          isFocused && { borderColor: theme.colors.primary, borderWidth: 1.5 },
          error && { borderColor: theme.colors.danger, borderWidth: 1.5 }
        ]} 
        {...props} 
      />
      {error ? (
        <Text style={[styles.error, { ...theme.typography.caption, color: theme.colors.danger, marginTop: theme.spacing.xs }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {},
  input: {},
  error: {},
});