import { Image, StyleSheet, Text, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/src/hooks/use-theme';

export interface AvatarProps { initials?: string; size?: number; source?: ImageSourcePropType; style?: StyleProp<ViewStyle>; }

/** Identity avatar with an initials fallback when no profile image is available. */
export function Avatar({ initials, size = 40, source, style }: AvatarProps) {
  const theme = useTheme();
  const dimensions = { borderRadius: size / 2, height: size, width: size };
  return (
    <View accessibilityLabel={initials} style={[styles.container, dimensions, { backgroundColor: theme.colors.accent, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }, style]}>
      {source ? (
        <Image source={source} style={dimensions} />
      ) : (
        <Text style={[styles.initials, { ...theme.typography.caption, color: theme.colors.primary, fontWeight: '700' }]}>
          {initials?.slice(0, 2).toUpperCase()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: {}, 
  initials: {} 
});