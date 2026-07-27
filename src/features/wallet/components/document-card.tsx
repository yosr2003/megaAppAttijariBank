import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import {
    Image,
    StyleSheet,
    Text,
    View,
    type StyleProp,
    type ViewStyle,
} from "react-native";

import { Card } from "@/src/components/ui";
import { useTheme } from "@/src/hooks/use-theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

export interface DocumentCardProps {
  icon: IconName;
  status: string;
  subtitle: string;
  title: string;
  style?: StyleProp<ViewStyle>;
  imageUrl?: string;
}

export function DocumentCard({
  icon,
  status,
  subtitle,
  title,
  style,
  imageUrl,
}: DocumentCardProps) {
  const theme = useTheme();

  return (
    <Card style={[styles.card, style]}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.icon, { backgroundColor: theme.colors.surfaceSubtle }]}>
          <Ionicons color={theme.colors.primary} name={icon} size={22} />
        </View>
      )}
      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {subtitle}
        </Text>
      </View>
      <View style={[styles.status, { backgroundColor: theme.colors.accent }]}>
        <Text style={[styles.statusText, { color: theme.colors.primary }]}>
          {status}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: "center", flexDirection: "row", gap: 12 },
  icon: {
    alignItems: "center",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  image: { width: 44, height: 44, borderRadius: 12, resizeMode: "cover" },
  copy: { flex: 1, gap: 4 },
  title: { fontSize: 14, fontWeight: "700" },
  subtitle: { fontSize: 12 },
  status: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  statusText: { fontSize: 12, fontWeight: "700" },
});
