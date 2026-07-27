import { StyleSheet, Text, View } from 'react-native';

import { AIMessageBubble, Card, Input, Screen, SectionTitle } from '@/src/components/ui';
import { useTheme } from '@/src/hooks/use-theme';

/** Frontend-only AI Coach conversation state for the wallet experience. */
export function WalletAICoachScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <Screen>
      <View>
        <Text style={styles.title}>AI Coach</Text>
        <Text style={styles.subtitle}>A smarter perspective on your wallet.</Text>
      </View>
      <View>
        <SectionTitle title="Today's insight" />
        <Card elevated style={styles.insight}>
          <Text style={styles.insightTitle}>You are on track</Text>
          <Text style={styles.insightBody}>
            Your weekly spending is 12% below plan, leaving room to accelerate your Summer escape goal.
          </Text>
        </Card>
      </View>
      <View style={styles.messages}>
        <AIMessageBubble message="I reviewed your recurring expenses and found a 23 TND opportunity this month." sender="ai" />
        <AIMessageBubble message="How can I save it automatically?" sender="user" />
        <AIMessageBubble message="I can direct it to your Summer escape goal every Friday." sender="ai" />
      </View>
      <Input editable={false} label="Ask your AI Coach" placeholder="Chat will be available soon" />
    </Screen>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    title: { ...theme.typography.heading, color: theme.colors.textPrimary },
    subtitle: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: theme.spacing.xxs },
    insight: { gap: theme.spacing.xs },
    insightTitle: { ...theme.typography.bodyMedium, color: theme.colors.textPrimary },
    insightBody: { ...theme.typography.body, color: theme.colors.textSecondary },
    messages: { gap: theme.spacing.sm },
  });
