import { Image, StyleSheet, Text, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';

import { Card } from './card';
import { useTheme } from '@/src/hooks/use-theme';

export interface MarketplaceCardProps { description: string; imageSource?: ImageSourcePropType; price: string; title: string; style?: StyleProp<ViewStyle>; }

/** Marketplace listing card with an optional local or remote preview image. */
export function MarketplaceCard({ description, imageSource, price, title, style }: MarketplaceCardProps) {
  const theme = useTheme();
  return (
    <Card style={style}>
      {imageSource ? (
        <Image source={imageSource} style={[styles.image, { backgroundColor: theme.colors.surfaceSubtle, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.md }]} />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.surfaceSubtle, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.md }]} />
      )}
      <Text numberOfLines={1} style={[styles.title, { ...theme.typography.title, color: theme.colors.textPrimary }]}>
        {title}
      </Text>
      <Text numberOfLines={2} style={[styles.description, { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: theme.spacing.xxs }]}>
        {description}
      </Text>
      <Text style={[styles.price, { ...theme.typography.bodyMedium, color: theme.colors.action, marginTop: theme.spacing.sm }]}>
        {price}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({ 
  image: { height: 136, width: '100%' }, 
  imagePlaceholder: { height: 136, width: '100%' }, 
  title: {}, 
  description: {}, 
  price: {} 
});