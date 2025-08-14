import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import { QuizResult, ProgressAnalyticsData, BarChartData } from '../types/Analytics';

const QUIZ_RESULTS_KEY = 'quiz_results';

/**
 * Format seconds to MM:SS format
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Calculate accuracy percentage
 */
export const calculateAccuracy = (correctGuesses: number, totalGuesses: number): number => {
  if (totalGuesses === 0) return 0;
  return Math.round((correctGuesses / totalGuesses) * 100);
};

/**
 * Get appropriate color based on performance value and type
 */
export const getBarColor = (value: number, type: 'accuracy' | 'time'): string => {
  if (type === 'accuracy') {
    if (value >= 80) return Colors.secondaryTeal; // Good performance
    if (value >= 60) return Colors.goldenYellow; // Medium performance
    return Colors.coralRed; // Poor performance
  } else {
    // For time, lower is better (assuming typical quiz completion times)
    if (value <= 60) return Colors.secondaryTeal; // Fast completion
    if (value <= 120) return Colors.goldenYellow; // Medium completion
    return Colors.coralRed; // Slow completion
  }
};

/**
 * Save quiz result to AsyncStorage
 */
export const saveQuizResult = async (result: QuizResult): Promise<void> => {
  try {
    const existingResults = await getQuizResults();
    const updatedResults = [...existingResults, result];
    
    // Keep only last 50 results to prevent storage bloat
    const trimmedResults = updatedResults.slice(-50);
    
    await AsyncStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(trimmedResults));
  } catch (error) {
    console.error('Error saving quiz result:', error);
  }
};

/**
 * Get all quiz results from AsyncStorage
 */
export const getQuizResults = async (): Promise<QuizResult[]> => {
  try {
    const results = await AsyncStorage.getItem(QUIZ_RESULTS_KEY);
    return results ? JSON.parse(results) : [];
  } catch (error) {
    console.error('Error getting quiz results:', error);
    return [];
  }
};

/**
 * Calculate current win streak from quiz results
 */
export const getWinStreak = (quizResults: QuizResult[]): number => {
  if (quizResults.length === 0) return 0;
  
  let streak = 0;
  // Start from the most recent result and count backwards
  for (let i = quizResults.length - 1; i >= 0; i--) {
    if (quizResults[i].isWin) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

/**
 * Calculate best win streak from quiz results
 */
export const getBestStreak = (quizResults: QuizResult[]): number => {
  if (quizResults.length === 0) return 0;
  
  let maxStreak = 0;
  let currentStreak = 0;
  
  for (const result of quizResults) {
    if (result.isWin) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return maxStreak;
};

/**
 * Calculate win rate percentage
 */
export const getWinRate = (quizResults: QuizResult[]): number => {
  if (quizResults.length === 0) return 0;
  
  const wins = quizResults.filter(result => result.isWin).length;
  return Math.round((wins / quizResults.length) * 100);
};

/**
 * Get progress analytics data from stored quiz results
 */
export const getProgressAnalytics = async (): Promise<ProgressAnalyticsData> => {
  const quizResults = await getQuizResults();
  
  if (quizResults.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      totalQuizzes: 0,
      recentAccuracy: [],
      recentTimes: [],
      averageAccuracy: 0,
      averageTime: 0,
    };
  }
  
  // Get last 7 results for recent trends
  const recentResults = quizResults.slice(-7);
  
  // Calculate averages from all results
  const totalAccuracy = quizResults.reduce((sum, result) => sum + result.accuracy, 0);
  const totalTime = quizResults.reduce((sum, result) => sum + result.completionTimeSeconds, 0);
  
  return {
    currentStreak: getWinStreak(quizResults),
    bestStreak: getBestStreak(quizResults),
    totalQuizzes: quizResults.length,
    recentAccuracy: recentResults.map(result => result.accuracy),
    recentTimes: recentResults.map(result => result.completionTimeSeconds),
    averageAccuracy: Math.round(totalAccuracy / quizResults.length),
    averageTime: Math.round(totalTime / quizResults.length),
  };
};

/**
 * Generate bar chart data for accuracy chart
 */
export const generateAccuracyChartData = (accuracyData: number[]): BarChartData[] => {
  return accuracyData.map((accuracy, index) => ({
    value: accuracy,
    color: getBarColor(accuracy, 'accuracy'),
    label: `${accuracy}%`,
  }));
};

/**
 * Generate bar chart data for speed chart
 */
export const generateSpeedChartData = (timeData: number[]): BarChartData[] => {
  return timeData.map((time, index) => ({
    value: time,
    color: getBarColor(time, 'time'),
    label: formatTime(time),
  }));
};

/**
 * Create a new quiz result object
 */
export const createQuizResult = (
  isWin: boolean,
  completionTimeSeconds: number,
  correctGuesses: number,
  totalGuesses: number
): QuizResult => {
  return {
    id: Date.now().toString(),
    timestamp: Date.now(),
    isWin,
    completionTimeSeconds,
    correctGuesses,
    totalGuesses,
    accuracy: calculateAccuracy(correctGuesses, totalGuesses),
  };
};
