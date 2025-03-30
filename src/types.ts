export interface Expense {
  id: number;
  amount: number;
  description: string;
  category: string;
  date: Date;
  roast: string;
}

export interface Task {
  id: number;
  title: string;
  points: number;
  completed: boolean;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  total_points: number;
  streak_days: number;
  achievements: Achievement[];
  level: number;
  next_level_points: number;
}