import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/src/hooks/use-theme';

export interface PrimaryButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Main action button for high-priority fintech flows. */
export function PrimaryButton({ label, loading = false, disabled, style, ...props }: PrimaryButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={{ color: theme.colors.accent }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.colors.primary,
          borderRadius: theme.borderRadius.md,
          minHeight: 52,
          paddingHorizontal: theme.spacing.lg
        },
        isDisabled && styles.disabled,
        pressed && styles.pressed,
        style
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={theme.colors.primaryOn} />
      ) : (
        <Text style={[styles.label, { ...theme.typography.bodyMedium, color: theme.colors.primaryOn }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center' },
  label: { },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
});
