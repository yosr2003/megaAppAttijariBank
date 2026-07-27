import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Card } from './card';
import { useTheme } from '@/src/hooks/use-theme';

export interface BalanceCardProps {
  amount: string;
  label: string;
  trend?: string;
  style?: StyleProp<ViewStyle>;
}

/** Summary card optimized for aligned, easy-to-scan currency values. */
export function BalanceCard({ amount, label, trend, style }: BalanceCardProps) {
  const theme = useTheme();
  return (
    <Card elevated style={style}>
      <Text style={[styles.label, { ...theme.typography.caption, color: theme.colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.amount, { ...theme.typography.numeric, color: theme.colors.textPrimary, marginTop: theme.spacing.xs }]}>
        {amount}
      </Text>
      {trend ? (
        <View style={[
          styles.trend, 
          { 
            alignSelf: 'flex-start', 
            backgroundColor: theme.colors.surfaceSubtle, 
            borderRadius: theme.borderRadius.pill, 
            marginTop: theme.spacing.sm, 
            paddingHorizontal: theme.spacing.sm, 
            paddingVertical: theme.spacing.xxs 
          }
        ]}>
          <Text style={[styles.trendText, { ...theme.typography.caption, color: theme.colors.action }]}>
            {trend}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  label: {},
  amount: {},
  trend: {},
  trendText: {},
});