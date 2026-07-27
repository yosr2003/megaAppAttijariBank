import { Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/src/hooks/use-theme';

export interface SecondaryButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  style?: StyleProp<ViewStyle>;
}

/** Secondary action with a quiet, bordered treatment. */
export function SecondaryButton({ label, disabled, style, ...props }: SecondaryButtonProps) {
  const theme = useTheme();
  
  return (
    <Pressable 
      accessibilityRole="button" 
      android_ripple={{ color: theme.colors.accent }} 
      disabled={disabled} 
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: theme.colors.border, 
          borderRadius: theme.borderRadius.md, 
          borderWidth: 1, 
          minHeight: 52, 
          paddingHorizontal: theme.spacing.lg
        },
        disabled && styles.disabled, 
        pressed && { backgroundColor: theme.colors.surfaceSubtle }, 
        style
      ]} 
      {...props}
    >
      <Text style={[styles.label, { ...theme.typography.bodyMedium, color: theme.colors.primary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center' },
  label: { },
  disabled: { opacity: 0.5 },
});
