import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Card } from '@/src/components/ui';
import { useTheme } from '@/src/hooks/use-theme';

export interface StatCardProps { label: string; value: string; style?: StyleProp<ViewStyle>; }

export function StatCard({ label, value, style }: StatCardProps) {
  const theme = useTheme();
  
  return (
    <Card style={[styles.card, style]}>
      <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 4 }]}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({ 
  card: { flex: 1, minWidth: 140, gap: 8 }, 
  value: { fontSize: 24, fontWeight: '800' }, 
  label: { fontSize: 12, fontWeight: '600' } 
});
