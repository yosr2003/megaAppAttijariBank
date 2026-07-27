import { View, StyleSheet, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '@/src/hooks/use-theme';

export interface CardProps extends ViewProps {
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Neutral adaptive surface used as the base for product cards. */
export function Card({ elevated = false, style, ...props }: CardProps) {
  const theme = useTheme();
  return (
    <View 
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md
        },
        elevated && theme.shadows.card,
        style
      ]} 
      {...props} 
    />
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, width: '100%' },
});
