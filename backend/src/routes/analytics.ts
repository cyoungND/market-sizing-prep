import { Router } from 'express';
import { analyticsService } from '../services/analytics';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';

const router = Router();

// Apply authentication to all analytics routes
router.use(authenticateToken);

/**
 * GET /api/analytics/user-stats
 * Get comprehensive user analytics
 */
router.get('/user-stats', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    console.log(`📊 Getting user analytics for user: ${userId}`);
    
    const analytics = await analyticsService.getUserAnalytics(userId);
    
    if (!analytics) {
      return res.json({
        totalQuestions: 0,
        totalCorrect: 0,
        totalAttempts: 0,
        accuracy: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageTime: 0,
        fastestTime: null,
        totalTimeSpent: 0,
        totalSessions: 0,
        completedSessions: 0
      });
    }
    
    console.log(`✅ User analytics retrieved: ${analytics.totalQuestions} questions, ${analytics.accuracy.toFixed(2)} accuracy`);
    res.json(analytics);
  } catch (error) {
    console.error('❌ Error fetching user analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/analytics/daily-trends?days=30
 * Get historical daily analytics for trends
 */
router.get('/daily-trends', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const days = parseInt(req.query.days as string) || 30;
    
    console.log(`📈 Getting daily trends for user: ${userId}, last ${days} days`);
    
    const dailyAnalytics = await analyticsService.getDailyAnalytics(userId, days);
    
    console.log(`✅ Daily trends retrieved: ${dailyAnalytics.length} days of data`);
    res.json({
      days: dailyAnalytics,
      summary: {
        totalDays: dailyAnalytics.length,
        averageAccuracy: dailyAnalytics.length > 0 
          ? dailyAnalytics.reduce((sum: number, day) => sum + day.dailyAccuracy, 0) / dailyAnalytics.length 
          : 0,
        totalQuestions: dailyAnalytics.reduce((sum, day) => sum + day.questionsAnswered, 0),
        totalSessions: dailyAnalytics.reduce((sum, day) => sum + day.sessionsPlayed, 0)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching daily trends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/analytics/share-data
 * Get data formatted for sharing (Wordle-style)
 */
router.get('/share-data', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    console.log(`🔗 Getting share data for user: ${userId}`);
    
    const shareData = await analyticsService.getShareData(userId);
    
    // Generate Wordle-style emoji representation
    const accuracyEmoji = shareData.accuracy >= 0.9 ? '🟢' : 
                         shareData.accuracy >= 0.8 ? '🟡' : 
                         shareData.accuracy >= 0.7 ? '🟠' : '🔴';
    
    const streakEmoji = shareData.currentStreak >= 10 ? '🔥🔥🔥' :
                       shareData.currentStreak >= 5 ? '🔥🔥' :
                       shareData.currentStreak >= 1 ? '🔥' : '❄️';
    
    const shareText = `Market Sizing Prep 📊
${accuracyEmoji} ${(shareData.accuracy * 100).toFixed(1)}% accuracy
${streakEmoji} ${shareData.currentStreak} question streak
🎯 ${shareData.totalQuestions} questions completed
⚡ Best time: ${shareData.fastestTime ? `${shareData.fastestTime}s` : 'N/A'}
🏆 Rank: ${shareData.rank}

Can you beat my score?`;
    
    console.log(`✅ Share data generated for ${shareData.rank} user`);
    res.json({
      ...shareData,
      shareText,
      emojis: {
        accuracy: accuracyEmoji,
        streak: streakEmoji
      }
    });
  } catch (error) {
    console.error('❌ Error generating share data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/analytics/session-results/:sessionId
 * Get detailed results for a specific session
 */
router.get('/session-results/:sessionId', async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.id;
    
    console.log(`📋 Getting session results for session: ${sessionId}`);
    
    // Get session with responses
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: userId // Ensure user owns this session
      },
      include: {
        responses: {
          include: {
            question: {
              select: {
                id: true,
                prompt: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Calculate session metrics
    const totalQuestions = session.responses.length;
    const correctAnswers = session.responses.filter((r: any) => r.correct).length;
    const totalTime = session.responses.reduce((sum: number, r: any) => sum + r.timeSpent, 0);
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) : 0;
    const averageTime = totalQuestions > 0 ? (totalTime / totalQuestions) : 0;
    
    // Calculate streak within this session
    let longestSessionStreak = 0;
    let currentSessionStreak = 0;
    
    session.responses.forEach((response: any) => {
      if (response.correct) {
        currentSessionStreak++;
        longestSessionStreak = Math.max(longestSessionStreak, currentSessionStreak);
      } else {
        currentSessionStreak = 0;
      }
    });
    
    console.log(`✅ Session results: ${correctAnswers}/${totalQuestions} correct, ${accuracy.toFixed(2)} accuracy`);
    
    res.json({
      session: {
        id: session.id,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        completed: session.completed
      },
      metrics: {
        totalQuestions,
        correctAnswers,
        accuracy,
        totalTime,
        averageTime,
        longestSessionStreak
      },
      responses: session.responses.map((response: any) => ({
        questionId: response.questionId,
        questionPrompt: response.question.prompt.substring(0, 100) + '...',
        correct: response.correct,
        timeSpent: response.timeSpent,
        attempts: response.attempts
      }))
    });
    
  } catch (error) {
    console.error('❌ Error fetching session results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/analytics/leaderboard
 * Get leaderboard data (optional feature for gamification)
 */
router.get('/leaderboard', async (req: AuthRequest, res) => {
  try {
    console.log('🏆 Getting leaderboard data');
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Get top users by accuracy (minimum 10 questions)
    const topUsers = await prisma.userStats.findMany({
      where: {
        totalQuestions: {
          gte: 10
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { accuracy: 'desc' },
        { totalQuestions: 'desc' }
      ],
      take: 10
    });
    
    const leaderboard = topUsers.map((userStat: any, index: number) => ({
      rank: index + 1,
      name: userStat.user.name || 'Anonymous',
      email: userStat.user.email.substring(0, 3) + '***', // Privacy
      accuracy: userStat.accuracy,
      totalQuestions: userStat.totalQuestions,
      currentStreak: userStat.currentStreak,
      longestStreak: userStat.longestStreak
    }));
    
    console.log(`✅ Leaderboard generated with ${leaderboard.length} users`);
    res.json({ leaderboard });
    
  } catch (error) {
    console.error('❌ Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
