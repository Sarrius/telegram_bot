const { PotuzhnoPowerWordsDetector } = require('../../dist/domain/potuzhnoPowerWordsDetector');

const detector = new PotuzhnoPowerWordsDetector();

console.log('🔍 Тестування детектора потужних слів:');
console.log('='.repeat(50));

const testPhrases = [
  'Потужно працюю сьогодні!',
  'Супер результат!',
  'Могутній успіх',
  'Офігенний день', 
  'Топ робота',
  'Мега крутий',
  'Звичайний день',
  'Привіт всім',
  'бомбезний результат',
  'неймовірно круто',
  'круто зроблено',
  'класно вийшло',
  'потужно виконано'
];

testPhrases.forEach(phrase => {
  const bestMatch = detector.getBestPowerWordMatch(phrase);
  
  if (bestMatch) {
    const emoji = detector.getReactionEmoji(bestMatch);
    const motivation = detector.getMotivationalResponse(bestMatch);
    console.log(`⚡ "${phrase}"`);
    console.log(`   Знайдено: "${bestMatch.originalWord}" → "${bestMatch.matchedWord}"`);
    console.log(`   Впевненість: ${(bestMatch.confidence * 100).toFixed(1)}%`);
    console.log(`   Категорія: ${bestMatch.category}, Інтенсивність: ${bestMatch.intensity}`);
    console.log(`   Реакція: ${emoji}`);
    console.log(`   Мотивація: ${motivation.substring(0, 50)}...`);
  } else {
    console.log(`❌ "${phrase}" - не виявлено`);
  }
  console.log('');
}); 