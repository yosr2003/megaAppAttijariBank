import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/src/hooks/use-theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export interface IconButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  icon: IconName;
  label: string;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** Accessible icon-only control. A text label is required for screen readers. */
export function IconButton({ icon, label, color, size = 22, disabled, style, ...props }: IconButtonProps) {
  const theme = useTheme();
  const buttonColor = color || theme.colors.primary;
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" disabled={disabled} hitSlop={theme.spacing.xs} style={({ pressed }) => [
      styles.button, 
      { borderRadius: theme.borderRadius.pill },
      disabled && styles.disabled, 
      pressed && { backgroundColor: theme.colors.surfaceSubtle }, 
      style
    ]} {...props}>
      <Ionicons color={buttonColor} name={icon} size={size} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center', minHeight: 44, minWidth: 44 },
  disabled: { opacity: 0.45 },
});