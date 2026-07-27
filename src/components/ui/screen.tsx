import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/src/hooks/use-theme';

export interface ScreenProps {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/** Standard safe, scrollable canvas for content-heavy application screens. */
export function Screen({ children, contentContainerStyle }: ScreenProps) {
  const theme = useTheme();
  
  return (
    <SafeAreaView 
      edges={['top']} 
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView 
        contentContainerStyle={[
          styles.content, 
          { 
            gap: theme.spacing.xl, 
            padding: theme.spacing.md, 
            paddingBottom: theme.spacing.xxl 
          }, 
          contentContainerStyle
        ]} 
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ 
  safeArea: { flex: 1 }, 
  content: { } 
});
