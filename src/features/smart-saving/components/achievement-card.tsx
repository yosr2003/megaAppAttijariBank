import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Card } from '@/src/components/ui';
import { useTheme } from '@/src/hooks/use-theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
export interface AchievementCardProps { icon: IconName; title: string; description: string; unlocked?: boolean; style?: StyleProp<ViewStyle>; }

export function AchievementCard({ description, icon, title, unlocked = false, style }: AchievementCardProps) {
  const theme = useTheme();
  
  return (
    <Card style={[styles.card, !unlocked && styles.locked, style]}>
      <View style={[styles.icon, { backgroundColor: theme.colors.accent }]}>
        <Ionicons color={theme.colors.primary} name={icon} size={22} />
      </View>
      <View style={[styles.copy, { marginLeft: 16 }]}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary, marginTop: 4 }]}>{description}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({ 
  card: { alignItems: 'center', flexDirection: 'row' }, 
  locked: { opacity: 0.58 }, 
  icon: { alignItems: 'center', borderRadius: 12, height: 44, justifyContent: 'center', width: 44 }, 
  copy: { flex: 1, gap: 4 }, 
  title: { fontSize: 16, fontWeight: '700' }, 
  description: { fontSize: 12 } 
});
