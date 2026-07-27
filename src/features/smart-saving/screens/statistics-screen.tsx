import { StyleSheet, Text, View } from 'react-native';

import { Card, Screen, SectionTitle } from '@/src/components/ui';
import { useTheme } from '@/src/hooks/use-theme';
import { StatCard } from '../components';

const chartBars = [0.35, 0.55, 0.42, 0.72, 0.6, 0.88];

/** Local analytics view using theme-driven bars rather than a chart dependency. */
export function StatisticsScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <Screen>
      <View>
        <Text style={styles.title}>Statistics</Text>
        <Text style={styles.subtitle}>Your saving momentum, made visible.</Text>
      </View>
      <View style={styles.metrics}>
        <StatCard label="Saved this month" value="420 TND" />
        <StatCard label="Goals on track" value="2 / 2" />
      </View>
      <View>
        <SectionTitle title="Weekly momentum" />
        <Card elevated style={styles.chart}>
          {chartBars.map((bar, index) => (
            <View key={index} style={styles.barColumn}>
              <View style={[styles.bar, { height: `${bar * 100}%` }]} />
            </View>
          ))}
        </Card>
      </View>
    </Screen>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    title: { ...theme.typography.heading, color: theme.colors.textPrimary },
    subtitle: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: theme.spacing.xxs },
    metrics: { flexDirection: 'row', gap: theme.spacing.sm },
    chart: { alignItems: 'flex-end', flexDirection: 'row', gap: theme.spacing.sm, height: 180 },
    barColumn: {
      backgroundColor: theme.colors.surfaceSubtle,
      borderRadius: theme.borderRadius.sm,
      flex: 1,
      height: '100%',
      justifyContent: 'flex-end',
      overflow: 'hidden',
    },
    bar: { backgroundColor: theme.colors.action, borderRadius: theme.borderRadius.sm, width: '100%' },
  });
