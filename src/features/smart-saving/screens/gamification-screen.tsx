import { StyleSheet, Text, View } from 'react-native';

import { BalanceCard, Screen, SectionTitle } from '@/src/components/ui';
import { useTheme } from '@/src/hooks/use-theme';
import { AchievementCard } from '../components';
import { achievements } from '../data/saving-data';

/** Motivation layer showing local streaks and progress rewards. */
export function GamificationScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <Screen>
      <View>
        <Text style={styles.title}>Your momentum</Text>
        <Text style={styles.subtitle}>Saving habits deserve to feel rewarding.</Text>
      </View>
      <BalanceCard amount="7 days" label="Current saving streak" trend="New personal best" />
      <View>
        <SectionTitle title="Achievements" />
        <View style={styles.list}>
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.title} {...achievement} />
          ))}
        </View>
      </View>
    </Screen>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    title: { ...theme.typography.heading, color: theme.colors.textPrimary },
    subtitle: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: theme.spacing.xxs },
    list: { gap: theme.spacing.sm },
  });
