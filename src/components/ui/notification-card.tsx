import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Card } from './card';
import { useTheme } from '@/src/hooks/use-theme';

export interface NotificationCardProps { action?: ReactNode; body: string; read?: boolean; title: string; style?: StyleProp<ViewStyle>; }

/** Notification surface with an optional trailing action and unread marker. */
export function NotificationCard({ action, body, read = false, title, style }: NotificationCardProps) {
  const theme = useTheme();
  return (
    <Card style={[styles.card, { padding: theme.spacing.md }, !read && { borderColor: theme.colors.accent }, style]}>
      <View style={[styles.content, { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }]}>
        <View style={[styles.copy, { flex: 1, paddingRight: theme.spacing.sm }]}>
          <Text style={[styles.title, { ...theme.typography.bodyMedium, color: theme.colors.textPrimary }]}>
            {title}
          </Text>
          <Text style={[styles.body, { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: theme.spacing.xxs }]}>
            {body}
          </Text>
        </View>
        {action}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({ 
  card: {}, 
  content: {}, 
  copy: {}, 
  title: {}, 
  body: {} 
});