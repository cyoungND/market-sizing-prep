/**
 * Seed script to add sample market sizing questions for testing
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sampleQuestions = [
  {
    prompt: "How many coffee shops are there in New York City?",
    summary: "Estimate the total number of coffee shops in NYC using population and consumption patterns.",
    components: [
      {
        text: "Population of NYC: 8.4 million people",
        correct: true,
        explanation: "NYC has approximately 8.4 million residents"
      },
      {
        text: "65% of people drink coffee regularly",
        correct: true,
        explanation: "About 2/3 of adults are regular coffee drinkers"
      },
      {
        text: "Each coffee shop serves 500 regular customers",
        correct: true,
        explanation: "A typical coffee shop has around 500 regular customers"
      },
      {
        text: "Total coffee shops: ~11,000",
        correct: true,
        explanation: "(8.4M * 0.65) / 500 = ~11,000 coffee shops"
      }
    ]
  },
  {
    prompt: "What is the market size for ride-sharing services in San Francisco?",
    summary: "Calculate the annual revenue potential for ride-sharing in SF.",
    components: [
      {
        text: "SF Population: 875,000 people",
        correct: true,
        explanation: "San Francisco has about 875,000 residents"
      },
      {
        text: "45% use ride-sharing services",
        correct: true,
        explanation: "Nearly half of SF residents use ride-sharing"
      },
      {
        text: "8 rides per user per month",
        correct: true,
        explanation: "Average user takes 8 rides monthly"
      },
      {
        text: "$15 average price per ride",
        correct: true,
        explanation: "Typical ride costs around $15"
      },
      {
        text: "Annual market: ~$567M",
        correct: true,
        explanation: "875K * 0.45 * 8 * $15 * 12 = ~$567 million annually"
      }
    ]
  },
  {
    prompt: "How many pizza slices are consumed in the US per day?",
    summary: "Estimate daily pizza slice consumption across America.",
    components: [
      {
        text: "US Population: 330 million people",
        correct: true,
        explanation: "The US has approximately 330 million residents"
      },
      {
        text: "75% eat pizza regularly",
        correct: true,
        explanation: "About 3/4 of Americans eat pizza regularly"
      },
      {
        text: "0.5 slices per person per day",
        correct: true,
        explanation: "Average person eats half a slice daily"
      },
      {
        text: "Total: ~124 million slices daily",
        correct: true,
        explanation: "330M * 0.75 * 0.5 = ~124 million slices per day"
      }
    ]
  }
];

async function seedQuestions() {
  console.log('🌱 Seeding sample questions...');

  try {
    for (const questionData of sampleQuestions) {
      const { components, ...questionInfo } = questionData;
      
      const question = await prisma.question.create({
        data: {
          prompt: questionInfo.prompt,
          summary: questionInfo.summary,
          components: {
            create: components
          }
        }
      });

      console.log(`✅ Created question: "${question.prompt}"`);
    }

    console.log(`🎉 Successfully seeded ${sampleQuestions.length} questions!`);
  } catch (error) {
    console.error('❌ Error seeding questions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedQuestions();
