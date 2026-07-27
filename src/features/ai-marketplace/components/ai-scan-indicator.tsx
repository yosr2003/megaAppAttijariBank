import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/src/hooks/use-theme';

export interface AIScanIndicatorProps { scanning: boolean; style?: StyleProp<ViewStyle>; }

/** AI scan-line feedback, activated only while a marketplace analysis is running. */
export function AIScanIndicator({ scanning, style }: AIScanIndicatorProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = scanning
      ? withRepeat(withTiming(1, { duration: 1100 }), -1, true)
      : withTiming(0, { duration: 160 });
  }, [progress, scanning]);

  const lineStyle = useAnimatedStyle(() => ({
    opacity: scanning ? 1 : 0,
    transform: [{ translateY: progress.value * 112 }],
  }));

  return (
    <View accessibilityLabel="AI scanning" style={[styles.frame, style]}>
      <Animated.View style={[styles.line, lineStyle]} />
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    frame: {
      backgroundColor: theme.colors.surfaceSubtle,
      borderColor: theme.colors.accent,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      height: 128,
      overflow: 'hidden',
      width: '100%',
    },
    line: { backgroundColor: theme.colors.action, height: 2, width: '100%' },
  });
