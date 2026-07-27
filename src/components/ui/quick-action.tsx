import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/src/hooks/use-theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export interface QuickActionProps extends Omit<PressableProps, 'children' | 'style'> { icon: IconName; label: string; style?: StyleProp<ViewStyle>; }

/** Compact action shortcut for common money-management tasks. */
export function QuickAction({ icon, label, style, ...props }: QuickActionProps) {
  const theme = useTheme();
  return (
    <Pressable accessibilityRole="button" style={({ pressed }) => [
      styles.container, 
      { 
        backgroundColor: theme.colors.surface, 
        borderColor: theme.colors.border, 
        borderRadius: theme.borderRadius.md, 
        borderWidth: 1, 
        gap: theme.spacing.xs, 
        paddingHorizontal: theme.spacing.xs 
      }, 
      pressed && { backgroundColor: theme.colors.surfaceSubtle }, 
      style
    ]} {...props}>
      <Ionicons color={theme.colors.action} name={icon} size={22} />
      <Text style={[styles.label, { ...theme.typography.caption, color: theme.colors.textPrimary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({ 
  container: { alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 84 }, 
  label: {} 
});