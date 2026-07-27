import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Card } from './card';
import { useTheme } from '@/src/hooks/use-theme';

export interface SavingCardProps { currentAmount: string; goalAmount: string; progress: number; title: string; style?: StyleProp<ViewStyle>; }

/** Savings-goal card with a clamped progress indicator. */
export function SavingCard({ currentAmount, goalAmount, progress, title, style }: SavingCardProps) {
  const theme = useTheme();
  const percentage = Math.max(0, Math.min(progress, 1));
  const progressPercent = Math.round(percentage * 100);
  return (
    <Card style={style}>
      <Text style={[styles.title, { ...theme.typography.title, color: theme.colors.textPrimary }]}>
        {title}
      </Text>
      <View style={[styles.amounts, { alignItems: 'baseline', flexDirection: 'row', marginTop: theme.spacing.sm }]}>
        <Text style={[styles.current, { ...theme.typography.bodyMedium, color: theme.colors.action }]}>
          {currentAmount}
        </Text>
        <Text style={[styles.goal, { ...theme.typography.caption, color: theme.colors.textSecondary, marginLeft: theme.spacing.xs }]}>
          of {goalAmount}
        </Text>
      </View>
      <View accessibilityRole="progressbar" accessibilityValue={{ max: 100, min: 0, now: progressPercent }} style={[styles.track, { backgroundColor: theme.colors.surfaceSubtle, borderRadius: theme.borderRadius.pill, height: theme.spacing.xs, marginTop: theme.spacing.md, overflow: 'hidden' }]}>
        <View style={[styles.fill, { width: `${percentage * 100}%`, backgroundColor: theme.colors.action, borderRadius: theme.borderRadius.pill, height: '100%' }]} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({ 
  title: {}, 
  amounts: {}, 
  current: {}, 
  goal: {}, 
  track: {}, 
  fill: {} 
});