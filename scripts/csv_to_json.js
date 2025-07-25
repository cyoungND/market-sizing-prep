// Node.js script to convert your Market Sizing CSV to JSON for your React Native app
// Place this file in your project (e.g., /scripts/csv_to_json.js)
// Usage: node scripts/csv_to_json.js ../assets/Market_Sizing_Questions_v1.csv ../assets/questions.json

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

if (process.argv.length < 4) {
  console.log('Usage: node csv_to_json.js <input.csv> <output.json>');
  process.exit(1);
}

const inputCsv = process.argv[2];
const outputJson = process.argv[3];

const questions = [];

fs.createReadStream(inputCsv)
  .pipe(csv())
  .on('data', (row) => {
    // Build components array
    const components = [];
    for (let i = 1; i <= 5; i++) {
      const text = row[`Correct_Component_${i}`]?.trim();
      const explanation = row[`Explanation_Correct_${i}`]?.trim();
      if (text) {
        components.push({
          text,
          correct: true,
          explanation: explanation || ''
        });
      }
    }
    for (let i = 1; i <= 5; i++) {
      const text = row[`Red_Herring_${i}`]?.trim();
      const explanation = row[`Explanation_Red_${i}`]?.trim();
      if (text) {
        components.push({
          text,
          correct: false,
          explanation: explanation || ''
        });
      }
    }
    // Use the main explanation (try Explanation, then Word_Math)
    let explanation = row['Explanation']?.trim() || row['Word_Math']?.trim() || '';
    questions.push({
      prompt: row['Question']?.trim() || '',
      geography: row['Geography']?.trim() || '',
      industry: row['Industry']?.trim() || '',
      difficulty: row['Difficulty']?.trim() || '',
      approach: row['Approach']?.trim() || '',
      components,
      explanation,
    });
  })
  .on('end', () => {
    fs.writeFileSync(outputJson, JSON.stringify(questions, null, 2), 'utf8');
    console.log(`Converted ${questions.length} questions to ${outputJson}`);
  });
