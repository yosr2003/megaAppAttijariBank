import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, TextInput, View, type TextInputProps, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/src/hooks/use-theme';

export interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  containerStyle?: StyleProp<ViewStyle>;
}

/** Search field with a large touch target and native text-input behavior. */
export function SearchBar({ containerStyle, placeholder = 'Search', ...props }: SearchBarProps) {
  const theme = useTheme();
  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.colors.surface, 
        borderColor: theme.colors.border, 
        borderRadius: theme.borderRadius.md, 
        borderWidth: 1, 
        paddingHorizontal: theme.spacing.md 
      }, 
      containerStyle
    ]}>
      <Ionicons color={theme.colors.textSecondary} name="search" size={20} />
      <TextInput 
        placeholder={placeholder} 
        placeholderTextColor={theme.colors.textSecondary} 
        style={[
          styles.input, 
          { ...theme.typography.body, color: theme.colors.textPrimary, marginLeft: theme.spacing.sm }
        ]} 
        {...props} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flexDirection: 'row', minHeight: 48 },
  input: { flex: 1, paddingVertical: 0 },
});