import type { ComponentProps } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { Goal3DBuilder } from './goal-3d-builder';
import type { GoalBlueprint } from '../types/goal-blueprint';
import { buildLocalBlueprint } from '@/src/services/gemini-service';

type IconName = ComponentProps<typeof import('@expo/vector-icons/Ionicons').default>['name'];

export interface AnimatedGoalProgressProps {
  icon: IconName;
  label: string;
  progress: number;
  blueprint?: GoalBlueprint;
  buildTrigger?: number;
  compact?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Savings progress with AI-shaped 3D build visualization. */
export function AnimatedGoalProgress({
  icon,
  label,
  progress,
  blueprint,
  buildTrigger,
  compact,
  loading,
  style,
}: AnimatedGoalProgressProps) {
  return (
    <Goal3DBuilder
      progress={progress}
      label={label}
      icon={icon}
      blueprint={blueprint ?? buildLocalBlueprint(label)}
      buildTrigger={buildTrigger}
      compact={compact}
      loading={loading}
      style={style}
    />
  );
}
