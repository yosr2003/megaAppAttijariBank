import type { AchievementCardProps, SavingGoalCardProps } from '../components';

export interface SavingGoal extends Pick<SavingGoalCardProps, 'currentAmount' | 'goalAmount' | 'icon' | 'label' | 'progress'> { route: string; }

export const savingGoals: readonly SavingGoal[] = [
  { currentAmount: '1,250 TND', goalAmount: '2,000 TND', icon: 'airplane-outline', label: 'Summer escape', progress: 0.625, route: '/savings/goal-details' },
  { currentAmount: '680 TND', goalAmount: '3,500 TND', icon: 'car-sport-outline', label: 'First car', progress: 0.194, route: '/savings/goal-details' },
];

export const achievements: readonly AchievementCardProps[] = [
  { description: 'Saved for seven days in a row.', icon: 'flame-outline', title: 'Weekly streak', unlocked: true },
  { description: 'Reached 50% of your Summer escape goal.', icon: 'rocket-outline', title: 'Halfway there', unlocked: true },
  { description: 'Complete a goal before its deadline.', icon: 'trophy-outline', title: 'Goal finisher', unlocked: false },
];
