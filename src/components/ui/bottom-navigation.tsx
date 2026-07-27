import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/src/hooks/use-theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export interface BottomNavigationItem { icon: IconName; key: string; label: string; }
export interface BottomNavigationProps { activeKey: string; items: readonly BottomNavigationItem[]; onChange: (key: string) => void; style?: StyleProp<ViewStyle>; }

/** Presentational bottom navigation; Expo Router layouts retain navigation ownership. */
export function BottomNavigation({ activeKey, items, onChange, style }: BottomNavigationProps) {
  const theme = useTheme();
  
  return (
    <View 
      accessibilityRole="tablist" 
      style={[
        styles.container, 
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.lg,
          paddingHorizontal: theme.spacing.xs,
          paddingVertical: theme.spacing.xs,
        },
        theme.shadows.floating,
        style
      ]}
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        const color = active ? theme.colors.action : theme.colors.textSecondary;
        
        return (
          <Pressable 
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            key={item.key}
            onPress={() => onChange(item.key)}
            style={styles.item}
          >
            <Ionicons color={color} name={item.icon} size={22} />
            <Text 
              style={[
                styles.label,
                { ...theme.typography.caption, color: theme.colors.textSecondary },
                active && { color: theme.colors.action }
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: { 
    alignItems: 'center', 
    borderWidth: 1, 
    flexDirection: 'row', 
    justifyContent: 'space-around',
    width: '100%' 
  }, 
  item: { 
    alignItems: 'center', 
    flex: 1, 
    justifyContent: 'center', 
    minHeight: 48 
  }, 
  label: { 
    marginTop: 4 
  } 
});
