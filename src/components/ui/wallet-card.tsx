import { useEffect } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Card } from './card';
import { useTheme } from '@/src/hooks/use-theme';

export interface WalletCardProps { balance: string; cardholder: string; lastFourDigits: string; style?: StyleProp<ViewStyle>; }

/** Premium payment-card summary that does not expose sensitive card data. */
export function WalletCard({ balance, cardholder, lastFourDigits, style }: WalletCardProps) {
  const theme = useTheme();
  const reveal = useSharedValue(0);
  useEffect(() => { reveal.value = withTiming(1, { duration: 420 }); }, [reveal]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: reveal.value, transform: [{ perspective: 900 }, { rotateY: `${interpolate(reveal.value, [0, 1], [-4, 0])}deg` }, { translateY: interpolate(reveal.value, [0, 1], [10, 0]) }] }));
  return (
    <Animated.View style={animatedStyle}>
      <Card elevated style={[styles.card, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }, style]}>
        <Text style={[styles.overline, { ...theme.typography.caption, color: theme.colors.accent }]}>
          AVAILABLE BALANCE
        </Text>
        <Text style={[styles.balance, { ...theme.typography.display, color: theme.colors.primaryOn, marginTop: theme.spacing.xs }]}>
          {balance}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.cardholder, { ...theme.typography.caption, color: theme.colors.primaryOn }]}>
            {cardholder}
          </Text>
          <Text style={[styles.digits, { ...theme.typography.caption, color: theme.colors.primaryOn }]}>
            •••• {lastFourDigits}
          </Text>
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({ 
  card: { minHeight: 190, justifyContent: 'space-between' }, 
  overline: {}, 
  balance: {}, 
  footer: { flexDirection: 'row', justifyContent: 'space-between' }, 
  cardholder: {}, 
  digits: {} 
});