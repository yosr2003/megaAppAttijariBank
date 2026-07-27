import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { Card } from '@/src/components/ui';
import { useTheme } from '@/src/hooks/use-theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export interface WalletNavigationCardProps extends Omit<PressableProps, 'children' | 'style'> {
  description: string;
  icon: IconName;
  title: string;
  style?: StyleProp<ViewStyle>;
}

export function WalletNavigationCard({ description, icon, title, style, ...props }: WalletNavigationCardProps) {
  const theme = useTheme();
  
  return (
    <Pressable accessibilityRole="button" style={({ pressed }) => [pressed && styles.pressed, style]} {...props}>
      <Card elevated style={[styles.card, { backgroundColor: theme.colors.surfaceSubtle, flexDirection: 'row' }]}>
        <View style={[styles.icon, { backgroundColor: theme.colors.accent }]}>
          <Ionicons color={theme.colors.primary} name={icon} size={22} />
        </View>
        <View style={[styles.copy, { marginHorizontal: 16 }]}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary, marginTop: 4 }]}>{description}</Text>
        </View>
        <Ionicons color={theme.colors.textSecondary} name="chevron-forward" size={20} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({ 
  card: { alignItems: 'center', gap: 12, padding: 16 }, 
  icon: { alignItems: 'center', borderRadius: 12, height: 44, justifyContent: 'center', width: 44 }, 
  copy: { flex: 1, gap: 4 }, 
  title: { fontSize: 16, fontWeight: '700' }, 
  description: { fontSize: 12 }, 
  pressed: { opacity: 0.8 } 
});
