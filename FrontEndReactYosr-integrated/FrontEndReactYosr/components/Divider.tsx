import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
interface DividerProps {
  text: string;
}
export default function Divider({ text }: DividerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={[Typography.dividerText, styles.text]}>{text}</Text>
      <View style={styles.line} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    width: '100%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  text: {
    paddingHorizontal: 16,
    color: Colors.textSecondary,
  },
});