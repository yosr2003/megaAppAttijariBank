import { useEffect, useState } from 'react';

import { resolveGoalBlueprint } from '../services/goal-blueprint-service';
import type { GoalBlueprint } from '../types/goal-blueprint';
import { buildLocalBlueprint } from '@/src/services/gemini-service';

type Options = {
  goalId?: string;
  /** When true, tries Gemini even if a local cache exists. */
  preferRemote?: boolean;
};

export function useGoalBlueprint(title: string, options?: Options) {
  const [blueprint, setBlueprint] = useState<GoalBlueprint>(() => buildLocalBlueprint(title));
  const [loading, setLoading] = useState(Boolean(options?.preferRemote));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    resolveGoalBlueprint(title, {
      goalId: options?.goalId,
      preferRemote: options?.preferRemote,
    })
      .then((result) => {
        if (!cancelled) setBlueprint(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [title, options?.goalId, options?.preferRemote]);

  return { blueprint, loading };
}
