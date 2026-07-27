import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { Card } from '@/src/components/ui';
import { useTheme } from '@/src/hooks/use-theme';
import { AnimatedGoalProgress, type AnimatedGoalProgressProps } from './animated-goal-progress';

export interface SavingGoalCardProps extends Omit<PressableProps, 'children' | 'style'>, AnimatedGoalProgressProps { currentAmount: string; goalAmount: string; style?: StyleProp<ViewStyle>; }

export function SavingGoalCard({ currentAmount, goalAmount, icon, label, progress, style, ...props }: SavingGoalCardProps) {
  const theme = useTheme();
  
  return (
    <Pressable accessibilityRole="button" style={({ pressed }) => [pressed && styles.pressed, style]} {...props}>
      <Card elevated style={[styles.card, { backgroundColor: theme.colors.surface, gap: 24 }]}>
        <AnimatedGoalProgress icon={icon} label={label} progress={progress} />
        <View style={styles.amounts}>
          <Text style={[styles.current, { color: theme.colors.primary }]}>{currentAmount}</Text>
          <Text style={[styles.goal, { color: theme.colors.textSecondary, marginLeft: 8 }]}>of {goalAmount}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({ 
  card: { gap: 24 }, 
  amounts: { alignItems: 'baseline', flexDirection: 'row' }, 
  current: { fontSize: 24, fontWeight: '800' }, 
  goal: { fontSize: 14, fontWeight: '600' }, 
  pressed: { opacity: 0.82 } 
});
