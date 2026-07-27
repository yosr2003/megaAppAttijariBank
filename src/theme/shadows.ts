import type { ViewStyle } from 'react-native';

import { colors } from './colors';

export const shadows = {
  card: {
    shadowColor: colors.electricBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  floating: {
    shadowColor: colors.electricBlue,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 8,
  },
} as const satisfies Record<string, ViewStyle>;
