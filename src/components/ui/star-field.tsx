import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/src/hooks/use-theme';

const stars = [
  { left: '8%', top: '7%' }, { left: '27%', top: '18%' }, { left: '78%', top: '9%' }, { left: '89%', top: '29%' },
  { left: '15%', top: '54%' }, { left: '65%', top: '46%' }, { left: '40%', top: '76%' }, { left: '87%', top: '83%' },
] as const;

export interface StarFieldProps { style?: StyleProp<ViewStyle>; }

/** Decorative, non-interactive star field for splash and dark premium surfaces. */
export function StarField({ style }: StarFieldProps) {
  const theme = useTheme();
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      {stars.map((star, index) => (
        <View key={index} style={[
          styles.star, 
          star, 
          { 
            backgroundColor: theme.colors.accent, 
            borderRadius: theme.borderRadius.pill, 
            opacity: 0.36 
          }, 
          index % 3 === 0 && { 
            backgroundColor: theme.colors.action, 
            height: 5, 
            opacity: 0.72, 
            width: 5 
          }
        ]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ 
  star: { height: 3, position: 'absolute', width: 3 } 
});