import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Avatar } from './avatar';
import { useTheme } from '@/src/hooks/use-theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export interface TransactionRowProps { amount: string; icon?: IconName; subtitle: string; title: string; style?: StyleProp<ViewStyle>; }

/** Consistent transaction summary suitable for dense financial activity lists. */
export function TransactionRow({ amount, icon = 'swap-horizontal-outline', subtitle, title, style }: TransactionRowProps) {
  const theme = useTheme();
  return (
    <View style={[styles.container, style]}>
      <Avatar initials="" size={40} style={[styles.avatar, { backgroundColor: theme.colors.surfaceSubtle }]} />
      <View style={styles.icon}>
        <Ionicons color={theme.colors.action} name={icon} size={18} />
      </View>
      <View style={[styles.copy, { marginLeft: theme.spacing.sm }]}>
        <Text numberOfLines={1} style={[styles.title, { ...theme.typography.bodyMedium, color: theme.colors.textPrimary }]}>
          {title}
        </Text>
        <Text numberOfLines={1} style={[styles.subtitle, { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: theme.spacing.xxs }]}>
          {subtitle}
        </Text>
      </View>
      <Text style={[styles.amount, { ...theme.typography.bodyMedium, color: theme.colors.textPrimary, marginLeft: theme.spacing.sm }]}>
        {amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: { alignItems: 'center', flexDirection: 'row' }, 
  avatar: {}, 
  icon: { left: 11, position: 'absolute', top: 11 }, 
  copy: { flex: 1 }, 
  title: {}, 
  subtitle: {}, 
  amount: {} 
});