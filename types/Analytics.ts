/**
 * TypeScript interfaces for analytics data structures
 */

export interface QuizResult {
  id: string;
  timestamp: number;
  isWin: boolean;
  completionTimeSeconds: number;
  correctGuesses: number;
  totalGuesses: number;
  accuracy: number; // calculated as correctGuesses/totalGuesses * 100
}

export interface QuizCompletionData {
  isWin: boolean;
  completionTimeSeconds: number;
  accuracy: number;
}

export interface ProgressAnalyticsData {
  currentStreak: number;
  bestStreak: number;
  totalQuizzes: number;
  recentAccuracy: number[]; // last 7 quiz accuracy percentages
  recentTimes: number[]; // last 7 completion times in seconds
  averageAccuracy: number;
  averageTime: number;
}

export interface BarChartData {
  value: number;
  color: string;
  label: string;
}

export interface ChartProps {
  data: BarChartData[];
  width: number;
  height: number;
  showValues?: boolean;
  maxValue?: number;
}

export interface StatCardProps {
  label: string;
  value: string;
  isDark?: boolean;
}
