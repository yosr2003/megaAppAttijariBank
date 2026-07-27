import type { GoalBlueprint } from '../types/goal-blueprint';
import { buildLocalBlueprint } from '@/src/services/gemini-service';

export type GoalVisual = Pick<
  GoalBlueprint,
  'icon' | 'accent' | 'blockTop' | 'blockSide' | 'blockFront' | 'label'
>;

/** @deprecated Prefer GoalBlueprint via useGoalBlueprint */
export function getGoalVisual(title: string): GoalVisual {
  const bp = buildLocalBlueprint(title);
  return {
    icon: bp.icon,
    accent: bp.accent,
    blockTop: bp.blockTop,
    blockSide: bp.blockSide,
    blockFront: bp.blockFront,
    label: bp.label,
  };
}

export function blueprintToVisual(blueprint: GoalBlueprint): GoalVisual {
  return {
    icon: blueprint.icon,
    accent: blueprint.accent,
    blockTop: blueprint.blockTop,
    blockSide: blueprint.blockSide,
    blockFront: blueprint.blockFront,
    label: blueprint.label,
  };
}
