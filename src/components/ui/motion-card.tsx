import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export interface MotionCardProps { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle>; }

/** Opt-in entrance motion for important card groups; avoids global animation overload. */
export function MotionCard({ children, delay = 0, style }: MotionCardProps) {
  return <Animated.View entering={FadeInDown.duration(280).delay(delay)} style={style}>{children}</Animated.View>;
}
