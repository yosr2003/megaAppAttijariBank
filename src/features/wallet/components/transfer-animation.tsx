import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/src/hooks/use-theme';

export interface TransferAnimationProps { active: boolean; }

/** Opt-in transfer confirmation motion; runs once per active transfer state. */
export function TransferAnimation({ active }: TransferAnimationProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 520 });
  }, [active, progress]);

  const movingStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateX: progress.value * 72 }, { scale: 0.8 + progress.value * 0.2 }],
  }));

  return (
    <View accessibilityLabel="Transfer confirmation" style={styles.track}>
      <View style={styles.endpoint}>
        <Ionicons color={theme.colors.action} name="wallet-outline" size={18} />
      </View>
      <Animated.View style={[styles.moving, movingStyle]}>
        <Ionicons color={theme.colors.primaryOn} name="arrow-forward" size={16} />
      </Animated.View>
      <View style={styles.endpoint}>
        <Ionicons color={theme.colors.action} name="person-outline" size={18} />
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    track: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', width: 132 },
    endpoint: {
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceSubtle,
      borderRadius: theme.borderRadius.pill,
      height: 36,
      justifyContent: 'center',
      width: 36,
    },
    moving: {
      alignItems: 'center',
      backgroundColor: theme.colors.action,
      borderRadius: theme.borderRadius.pill,
      height: 28,
      justifyContent: 'center',
      left: 30,
      position: 'absolute',
      width: 28,
    },
  });
