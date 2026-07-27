import type { TextStyle } from 'react-native';

export const typography = {
  display: { fontSize: 34, lineHeight: 42, fontWeight: '700', letterSpacing: -0.6 },
  heading: { fontSize: 26, lineHeight: 34, fontWeight: '700', letterSpacing: -0.3 },
  title: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  numeric: { fontSize: 28, lineHeight: 34, fontWeight: '700', fontVariant: ['tabular-nums'] },
} as const satisfies Record<string, TextStyle>;
