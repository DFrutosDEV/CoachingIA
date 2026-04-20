import type { Goal } from '@/types';

/** Desafíos del más antiguo al más reciente según la fecha del desafío. */
export function sortGoalsByDateAsc(goals: Goal[]): Goal[] {
  return [...goals].sort((a, b) => {
    const ta = new Date(a.date).getTime();
    const tb = new Date(b.date).getTime();
    if (ta !== tb) return ta - tb;
    return String(a._id).localeCompare(String(b._id));
  });
}
