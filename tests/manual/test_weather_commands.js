const { NewsCommandsFuzzyMatcher } = require('../../dist/config/vocabulary/newsCommandsFuzzyMatcher');

const matcher = new NewsCommandsFuzzyMatcher();

console.log('🌤 Тестування команд погоди для Тернополя:');
console.log('='.repeat(50));

const testCommands = [
  'Яка погода в Тернополі?',
  'Погода в Тернополі',
  'Тернопіль погода',
  'Температура в Тернополі',
  'Як погода в Тернополю?',
  'погода тернопіль',
  'яка погода тернопіль',
  'погода в тернополь',
  'як на вулиці в тернополі?',
  'температура тернопіль'
];

testCommands.forEach(command => {
  const result = matcher.recognizeCommand(command);
  
  if (result && result.type === 'weather') {
    console.log(`✅ "${command}"`);
    console.log(`   Тип: ${result.type}`);
    console.log(`   Місто: ${result.city || 'не виявлено'}`);
    console.log(`   Впевненість: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`   Збіг: ${result.matchedKeyword}`);
  } else if (result) {
    console.log(`⚠️ "${command}" - виявлено як ${result.type} (не weather)`);
  } else {
    console.log(`❌ "${command}" - не розпізнано`);
  }
  console.log('');
});

console.log('\n🌍 Підтримувані міста:');
const stats = matcher.getRecognitionStats();
console.log(`Всього міст: ${stats.supportedCities}`);
console.log(`Всього ключових слів: ${stats.totalKeywords}`);
console.log(`Всього варіацій: ${stats.totalVariations}`); 