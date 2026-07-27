import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/src/hooks/use-theme';

export interface SectionTitleProps {
  title: string;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Consistent section heading with an optional trailing action. */
export function SectionTitle({ title, action, style }: SectionTitleProps) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm }, style]}>
      <Text style={[styles.title, { ...theme.typography.title, color: theme.colors.textPrimary }]}>
        {title}
      </Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  title: {},
});