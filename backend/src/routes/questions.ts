import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all questions (protected route)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        components: {
          select: {
            id: true,
            text: true,
            correct: true,
            explanation: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.json({
      questions,
      total: questions.length
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single random question (MUST be before /:id route)
router.get('/random', authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log('🎲 Random question endpoint hit');
    
    const totalQuestions = await prisma.question.count();
    console.log(`📊 Total questions: ${totalQuestions}`);
    
    if (totalQuestions === 0) {
      return res.status(404).json({ error: 'No questions found' });
    }

    const randomOffset = Math.floor(Math.random() * totalQuestions);
    console.log(`🎯 Random offset: ${randomOffset}`);
    
    const question = await prisma.question.findFirst({
      skip: randomOffset,
      include: {
        components: {
          select: {
            id: true,
            text: true,
            correct: true,
            explanation: true
          }
        }
      }
    });

    console.log(`🔍 Question found: ${question ? 'YES' : 'NO'}`);
    if (question) {
      console.log(`📝 Question: ${question.prompt.substring(0, 50)}...`);
    }

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    console.log('✅ Returning random question');
    res.json({ question });
  } catch (error) {
    console.error('❌ Error fetching random question:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get random questions for practice session
router.get('/random/:count', authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log(`📊 Random with count endpoint hit, count param: ${req.params.count}`);
    const count = parseInt(req.params.count) || 10;
    console.log(`🔢 Parsed count: ${count}`);
    
    // Get total question count
    const totalQuestions = await prisma.question.count();
    
    if (totalQuestions === 0) {
      return res.json({ questions: [], total: 0 });
    }

    // Get random questions using Prisma (SQLite compatible)
    const allQuestions = await prisma.question.findMany({
      include: {
        components: {
          select: {
            id: true,
            text: true,
            correct: true,
            explanation: true
          }
        }
      }
    });
    
    // Shuffle and take the requested count
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const questions = shuffled.slice(0, count);

    res.json({
      questions,
      total: Array.isArray(questions) ? questions.length : 0
    });
  } catch (error) {
    console.error('Error fetching random questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific question by ID (MUST be after /random routes)
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        components: {
          select: {
            id: true,
            text: true,
            correct: true,
            explanation: true
          }
        }
      }
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
