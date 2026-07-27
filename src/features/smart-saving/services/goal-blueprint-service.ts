import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  buildLocalBlueprint,
  generateGoalBlueprintWithGemini,
} from '@/src/services/gemini-service';
import type { GoalBlueprint } from '../types/goal-blueprint';

const CACHE_PREFIX = 'goal-blueprint:';

function cacheKey(goalId?: string, title?: string): string {
  if (goalId) return `${CACHE_PREFIX}${goalId}`;
  return `${CACHE_PREFIX}title:${title?.trim().toLowerCase() ?? 'unknown'}`;
}

async function readCache(key: string): Promise<GoalBlueprint | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as GoalBlueprint) : null;
  } catch {
    return null;
  }
}

async function writeCache(key: string, blueprint: GoalBlueprint): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(blueprint));
  } catch {
    // cache is best-effort
  }
}

/** Load cached blueprint, then Gemini, then local keyword fallback. */
export async function resolveGoalBlueprint(
  title: string,
  options?: { goalId?: string; preferRemote?: boolean },
): Promise<GoalBlueprint> {
  const key = cacheKey(options?.goalId, title);
  const cached = await readCache(key);
  if (cached && (!options?.preferRemote || cached.source === 'gemini')) {
    return cached;
  }

  const fromGemini = await generateGoalBlueprintWithGemini(title);
  if (fromGemini) {
    await writeCache(key, fromGemini);
    return fromGemini;
  }

  const local = cached ?? buildLocalBlueprint(title);
  await writeCache(key, local);
  return local;
}

/** Warm the cache right after creating a goal (non-blocking friendly). */
export async function prefetchGoalBlueprint(goalId: string, title: string): Promise<GoalBlueprint> {
  return resolveGoalBlueprint(title, { goalId, preferRemote: true });
}

export async function clearGoalBlueprintCache(goalId: string): Promise<void> {
  await AsyncStorage.removeItem(cacheKey(goalId));
}
