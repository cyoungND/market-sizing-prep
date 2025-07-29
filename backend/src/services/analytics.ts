import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AnalyticsUpdate {
  userId: string;
  questionId: string;
  correct: boolean;
  timeSpent: number;
  attempts: number;
}

export interface UserAnalytics {
  totalQuestions: number;
  totalCorrect: number;
  totalAttempts: number;
  accuracy: number;
  currentStreak: number;
  longestStreak: number;
  averageTime: number;
  fastestTime: number | null;
  totalTimeSpent: number;
  totalSessions: number;
  completedSessions: number;
}

export interface DailyAnalytics {
  date: string;
  questionsAnswered: number;
  correctAnswers: number;
  totalAttempts: number;
  timeSpent: number;
  sessionsPlayed: number;
  dailyAccuracy: number;
  averageTimePerQ: number;
  streakAtEndOfDay: number;
}

export class AnalyticsService {
  
  /**
   * Update user statistics after a question response
   */
  async updateUserStats(data: AnalyticsUpdate): Promise<void> {
    const { userId, correct, timeSpent, attempts } = data;
    
    // Get or create user stats
    let userStats = await prisma.userStats.findUnique({
      where: { userId }
    });
    
    if (!userStats) {
      userStats = await prisma.userStats.create({
        data: { userId }
      });
    }
    
    // Calculate new metrics
    const newTotalQuestions = userStats.totalQuestions + 1;
    const newTotalCorrect = userStats.totalCorrect + (correct ? 1 : 0);
    const newTotalAttempts = userStats.totalAttempts + attempts;
    const newTotalTimeSpent = userStats.totalTimeSpent + timeSpent;
    
    // Calculate accuracy
    const newAccuracy = newTotalAttempts > 0 ? (newTotalCorrect / newTotalAttempts) : 0;
    
    // Calculate average time
    const newAverageTime = newTotalQuestions > 0 ? (newTotalTimeSpent / newTotalQuestions) : 0;
    
    // Update streak
    let newCurrentStreak = userStats.currentStreak;
    let newLongestStreak = userStats.longestStreak;
    
    if (correct) {
      newCurrentStreak += 1;
      newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);
    } else {
      newCurrentStreak = 0;
    }
    
    // Update fastest time (only for correct answers)
    let newFastestTime = userStats.fastestTime;
    if (correct && (newFastestTime === null || timeSpent < newFastestTime)) {
      newFastestTime = timeSpent;
    }
    
    // Update user stats
    await prisma.userStats.update({
      where: { userId },
      data: {
        totalQuestions: newTotalQuestions,
        totalCorrect: newTotalCorrect,
        totalAttempts: newTotalAttempts,
        accuracy: newAccuracy,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastStreakDate: new Date(),
        averageTime: newAverageTime,
        fastestTime: newFastestTime,
        totalTimeSpent: newTotalTimeSpent,
      }
    });
    
    // Update daily stats
    await this.updateDailyStats(userId, correct, timeSpent, attempts);
  }
  
  /**
   * Update daily statistics
   */
  private async updateDailyStats(
    userId: string, 
    correct: boolean, 
    timeSpent: number, 
    attempts: number
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day
    
    // Get or create daily stats for today
    let dailyStats = await prisma.dailyStats.findUnique({
      where: {
        userId_date: {
          userId,
          date: today
        }
      }
    });
    
    if (!dailyStats) {
      dailyStats = await prisma.dailyStats.create({
        data: {
          userId,
          date: today
        }
      });
    }
    
    // Calculate new daily metrics
    const newQuestionsAnswered = dailyStats.questionsAnswered + 1;
    const newCorrectAnswers = dailyStats.correctAnswers + (correct ? 1 : 0);
    const newTotalAttempts = dailyStats.totalAttempts + attempts;
    const newTimeSpent = dailyStats.timeSpent + timeSpent;
    
    const newDailyAccuracy = newTotalAttempts > 0 ? (newCorrectAnswers / newTotalAttempts) : 0;
    const newAverageTimePerQ = newQuestionsAnswered > 0 ? (newTimeSpent / newQuestionsAnswered) : 0;
    
    // Get current streak for end of day
    const userStats = await prisma.userStats.findUnique({
      where: { userId }
    });
    const streakAtEndOfDay = userStats?.currentStreak || 0;
    
    // Update daily stats
    await prisma.dailyStats.update({
      where: {
        userId_date: {
          userId,
          date: today
        }
      },
      data: {
        questionsAnswered: newQuestionsAnswered,
        correctAnswers: newCorrectAnswers,
        totalAttempts: newTotalAttempts,
        timeSpent: newTimeSpent,
        dailyAccuracy: newDailyAccuracy,
        averageTimePerQ: newAverageTimePerQ,
        streakAtEndOfDay
      }
    });
  }
  
  /**
   * Update session-related stats
   */
  async updateSessionStats(userId: string, completed: boolean): Promise<void> {
    let userStats = await prisma.userStats.findUnique({
      where: { userId }
    });
    
    if (!userStats) {
      userStats = await prisma.userStats.create({
        data: { userId }
      });
    }
    
    const newTotalSessions = userStats.totalSessions + 1;
    const newCompletedSessions = userStats.completedSessions + (completed ? 1 : 0);
    
    await prisma.userStats.update({
      where: { userId },
      data: {
        totalSessions: newTotalSessions,
        completedSessions: newCompletedSessions
      }
    });
    
    // Update daily session count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await prisma.dailyStats.upsert({
      where: {
        userId_date: {
          userId,
          date: today
        }
      },
      update: {
        sessionsPlayed: {
          increment: 1
        }
      },
      create: {
        userId,
        date: today,
        sessionsPlayed: 1
      }
    });
  }
  
  /**
   * Get comprehensive user analytics
   */
  async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    const userStats = await prisma.userStats.findUnique({
      where: { userId }
    });
    
    if (!userStats) {
      return null;
    }
    
    return {
      totalQuestions: userStats.totalQuestions,
      totalCorrect: userStats.totalCorrect,
      totalAttempts: userStats.totalAttempts,
      accuracy: userStats.accuracy,
      currentStreak: userStats.currentStreak,
      longestStreak: userStats.longestStreak,
      averageTime: userStats.averageTime,
      fastestTime: userStats.fastestTime,
      totalTimeSpent: userStats.totalTimeSpent,
      totalSessions: userStats.totalSessions,
      completedSessions: userStats.completedSessions
    };
  }
  
  /**
   * Get historical daily analytics for trends
   */
  async getDailyAnalytics(userId: string, days: number = 30): Promise<DailyAnalytics[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    
    const dailyStats = await prisma.dailyStats.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    return dailyStats.map((stat: any) => ({
      date: stat.date.toISOString().split('T')[0], // YYYY-MM-DD format
      questionsAnswered: stat.questionsAnswered,
      correctAnswers: stat.correctAnswers,
      totalAttempts: stat.totalAttempts,
      timeSpent: stat.timeSpent,
      sessionsPlayed: stat.sessionsPlayed,
      dailyAccuracy: stat.dailyAccuracy,
      averageTimePerQ: stat.averageTimePerQ,
      streakAtEndOfDay: stat.streakAtEndOfDay
    }));
  }
  
  /**
   * Get sharing data for viral features
   */
  async getShareData(userId: string): Promise<{
    accuracy: number;
    currentStreak: number;
    longestStreak: number;
    totalQuestions: number;
    fastestTime: number | null;
    rank?: string;
  }> {
    const userStats = await this.getUserAnalytics(userId);
    
    if (!userStats) {
      throw new Error('User analytics not found');
    }
    
    // Calculate user rank based on accuracy (could be enhanced)
    let rank = 'Beginner';
    if (userStats.accuracy >= 0.9) rank = 'Expert';
    else if (userStats.accuracy >= 0.8) rank = 'Advanced';
    else if (userStats.accuracy >= 0.7) rank = 'Intermediate';
    
    return {
      accuracy: userStats.accuracy,
      currentStreak: userStats.currentStreak,
      longestStreak: userStats.longestStreak,
      totalQuestions: userStats.totalQuestions,
      fastestTime: userStats.fastestTime,
      rank
    };
  }
}

export const analyticsService = new AnalyticsService();
