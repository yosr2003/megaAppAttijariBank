import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Card, type CardProps } from './card';
import { useTheme } from '@/src/hooks/use-theme';

export interface GlassCardProps extends CardProps { strong?: boolean; style?: StyleProp<ViewStyle>; }

/** Dark translucent surface with an electric-blue edge for SuperTounsi feature panels. */
export function GlassCard({ strong = false, style, ...props }: GlassCardProps) {
  const theme = useTheme();
  return (
    <Card 
      elevated 
      style={[
        {
          backgroundColor: theme.colors.glass,
          borderColor: theme.colors.border,
        },
        strong && { backgroundColor: theme.colors.glassStrong },
        style
      ]} 
      {...props} 
    />
  );
}

const styles = StyleSheet.create({ });
