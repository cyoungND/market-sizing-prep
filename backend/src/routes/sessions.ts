import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { analyticsService } from '../services/analytics';

const router = Router();

// Validation schemas
const createSessionSchema = z.object({
  totalQuestions: z.number().min(1)
});

const submitResponseSchema = z.object({
  questionId: z.string(),
  selectedComponents: z.array(z.string()),
  correct: z.boolean(),
  attempts: z.number().min(1),
  timeSpent: z.number().optional()
});

const endSessionSchema = z.object({
  completed: z.boolean().default(true)
});

// Create new practice session
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { totalQuestions } = createSessionSchema.parse(req.body);

    const session = await prisma.session.create({
      data: {
        userId: req.user!.id,
        totalQuestions
      },
      select: {
        id: true,
        startedAt: true,
        totalQuestions: true,
        correctAnswers: true,
        totalAttempts: true
      }
    });

    res.status(201).json({
      message: 'Session created successfully',
      session
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit response to a question
router.post('/:sessionId/responses', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, selectedComponents, correct, attempts, timeSpent } = 
      submitResponseSchema.parse(req.body);

    // Verify session belongs to user
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: req.user!.id
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.completed) {
      return res.status(400).json({ error: 'Session already completed' });
    }

    // Create response record
    const response = await prisma.response.create({
      data: {
        sessionId,
        questionId,
        selectedComponents: JSON.stringify(selectedComponents),
        correct,
        attempts,
        timeSpent
      }
    });

    // Update session statistics
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        correctAnswers: correct ? { increment: 1 } : undefined,
        totalAttempts: { increment: attempts }
      }
    });

    // Track analytics for this response
    console.log(`📊 Tracking analytics for user ${req.user!.id}: ${correct ? 'correct' : 'incorrect'} answer`);
    await analyticsService.updateUserStats({
      userId: req.user!.id,
      questionId,
      correct,
      timeSpent: timeSpent || 0,
      attempts
    });

    res.status(201).json({
      message: 'Response recorded successfully',
      response: {
        id: response.id,
        correct: response.correct,
        attempts: response.attempts,
        createdAt: response.createdAt
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error submitting response:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// End practice session
router.patch('/:sessionId/end', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params;
    const { completed } = endSessionSchema.parse(req.body);

    // Verify session belongs to user
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: req.user!.id
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date(),
        completed
      },
      include: {
        responses: {
          select: {
            correct: true,
            attempts: true,
            timeSpent: true
          }
        }
      }
    });

    // Calculate session statistics
    const accuracy = updatedSession.totalAttempts > 0 
      ? Math.round((updatedSession.correctAnswers / updatedSession.totalAttempts) * 100)
      : 0;

    const avgTimePerQuestion = updatedSession.responses.length > 0
      ? updatedSession.responses
          .filter(r => r.timeSpent)
          .reduce((sum, r) => sum + (r.timeSpent || 0), 0) / updatedSession.responses.length
      : 0;

    // Track session completion analytics
    console.log(`🏁 Tracking session completion for user ${req.user!.id}: ${completed ? 'completed' : 'abandoned'}`);
    await analyticsService.updateSessionStats(req.user!.id, completed);

    res.json({
      message: 'Session ended successfully',
      session: {
        id: updatedSession.id,
        startedAt: updatedSession.startedAt,
        endedAt: updatedSession.endedAt,
        completed: updatedSession.completed,
        totalQuestions: updatedSession.totalQuestions,
        correctAnswers: updatedSession.correctAnswers,
        totalAttempts: updatedSession.totalAttempts,
        accuracy,
        avgTimePerQuestion: Math.round(avgTimePerQuestion)
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's session history
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId: req.user!.id
      },
      include: {
        responses: {
          select: {
            correct: true,
            attempts: true,
            timeSpent: true
          }
        }
      },
      orderBy: {
        startedAt: 'desc'
      }
    });

    const sessionsWithStats = sessions.map(session => {
      const accuracy = session.totalAttempts > 0 
        ? Math.round((session.correctAnswers / session.totalAttempts) * 100)
        : 0;

      const avgTimePerQuestion = session.responses.length > 0
        ? session.responses
            .filter(r => r.timeSpent)
            .reduce((sum, r) => sum + (r.timeSpent || 0), 0) / session.responses.length
        : 0;

      return {
        id: session.id,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        completed: session.completed,
        totalQuestions: session.totalQuestions,
        correctAnswers: session.correctAnswers,
        totalAttempts: session.totalAttempts,
        accuracy,
        avgTimePerQuestion: Math.round(avgTimePerQuestion)
      };
    });

    res.json({
      sessions: sessionsWithStats,
      total: sessions.length
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
