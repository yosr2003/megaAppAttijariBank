import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

export type GoalShape =
  | 'house'
  | 'car'
  | 'plane'
  | 'phone'
  | 'laptop'
  | 'gift'
  | 'education'
  | 'wedding'
  | 'rocket'
  | 'tower';

export type GoalIconName = ComponentProps<typeof Ionicons>['name'];

export type VoxelSlot = { x: number; y: number; layer: number };

export interface GoalBlueprint {
  shape: GoalShape;
  icon: GoalIconName;
  accent: string;
  blockTop: string;
  blockSide: string;
  blockFront: string;
  label: string;
  buildCaption: string;
  source: 'gemini' | 'local';
}
