import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface QuestionData {
  prompt: string;
  geography?: string;
  industry?: string;
  difficulty?: string;
  approach?: string;
  components: {
    text: string;
    correct: boolean;
    explanation?: string;
  }[];
  summary?: string;
}

async function seedQuestions() {
  try {
    console.log('🌱 Starting database seed...');

    // Read questions from the frontend assets
    const questionsPath = path.join(__dirname, '../../../assets/questions.json');
    
    if (!fs.existsSync(questionsPath)) {
      console.error('❌ Questions file not found at:', questionsPath);
      console.log('Please make sure the questions.json file exists in the assets folder');
      return;
    }

    const questionsData: QuestionData[] = JSON.parse(
      fs.readFileSync(questionsPath, 'utf-8')
    );

    console.log(`📋 Found ${questionsData.length} questions to seed`);

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await prisma.response.deleteMany();
    await prisma.session.deleteMany();
    await prisma.component.deleteMany();
    await prisma.question.deleteMany();

    // Seed questions and components
    for (const questionData of questionsData) {
      console.log(`➕ Adding question: "${questionData.prompt.substring(0, 50)}..."`);

      // Create question with components
      await prisma.question.create({
        data: {
          prompt: questionData.prompt,
          summary: questionData.summary || `${questionData.geography || ''} ${questionData.industry || ''} ${questionData.approach || ''} analysis`.trim(),
          components: {
            create: questionData.components
              .filter(comp => comp.text && comp.text.trim() !== '' && comp.text.trim() !== '-')
              .map(comp => ({
                text: comp.text,
                correct: comp.correct,
                explanation: comp.explanation
              }))
          }
        }
      });
    }

    // Get final counts
    const questionCount = await prisma.question.count();
    const componentCount = await prisma.component.count();

    console.log('✅ Database seeded successfully!');
    console.log(`📊 Created ${questionCount} questions with ${componentCount} components`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedQuestions()
    .then(() => {
      console.log('🎉 Seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed failed:', error);
      process.exit(1);
    });
}

export { seedQuestions };
