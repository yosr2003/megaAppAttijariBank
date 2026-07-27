import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/src/hooks/use-theme';

export interface AIMessageBubbleProps { message: string; sender: 'ai' | 'user'; style?: StyleProp<ViewStyle>; }

/** Conversation bubble with clear visual ownership for AI and user messages. */
export function AIMessageBubble({ message, sender, style }: AIMessageBubbleProps) {
  const theme = useTheme();
  const isUser = sender === 'user';
  return (
    <View style={[styles.row, isUser && styles.userRow, style]}>
      <View style={[
        styles.bubble, 
        { borderRadius: theme.borderRadius.lg, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm },
        isUser ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.surfaceSubtle }
      ]}>
        <Text style={[
          styles.message, 
          { ...theme.typography.body, color: isUser ? theme.colors.primaryOn : theme.colors.textPrimary }
        ]}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ 
  row: { alignSelf: 'flex-start', maxWidth: '86%' }, 
  userRow: { alignSelf: 'flex-end' }, 
  bubble: {}, 
  message: {} 
});