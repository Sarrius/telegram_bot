const { CurrencyCommandsFuzzyMatcher } = require('./src/config/vocabulary/currencyCommandsFuzzyMatcher.ts');

const matcher = new CurrencyCommandsFuzzyMatcher();

// Тестуємо конкретні запити з тестів CurrencyHandler
const handlerTestQueries = [
  'курс долара',
  'скільки коштує долар',
  'ціна долара',
  'USD',
  '100 USD в UAH',
  '100 USD в EUR',
  'популярні курси',
  'список валют',
  '100 INVALID в UAH'  // Додаємо проблемний запит
];

console.log('=== Тестування запитів з CurrencyHandler тестів ===');

handlerTestQueries.forEach(query => {
  console.log(`\nТестування: "${query}"`);
  const result = matcher.findCurrencyCommand(query);
  console.log('Результат:', result);
  if (result) {
    console.log('Тип:', result.type);
    console.log('Параметри:', result.parameters);
  }
});

const testQueries = [
  'курс долара',
  'курс доллара', 
  'курс долара США',
  'USD курс',
  '100 USD в UAH',
  '100 доларів в гривні',
  'популярні курси',
  'список валют'
];

// Тестуємо проблемні запити з тестів
const failingQueries = [
  'скільки коштує долар',
  'ціна долара',
  'вартість долара',
  'скільки коштує євро',
  'ціна євро',
  'курс фунта',
  'польський злотий курс',
  'швейцарський франк',
  '50 доларів в євро',
  '200 EUR в USD',
  '100 USD to EUR',
  'конвертувати 100 USD в EUR',
  'Привіт! Скажи курс долара',
  'Можеш показати популярні курси?',
  'А які у вас валюти доступні?'
];

// Тестуємо конкретні regex паттерни
const ratePatterns = [
  /скільки\s+(коштує|стоїть)\s+(долар|доллар|євро|евро|фунт|злот|франк)/i,
  /(ціна|вартість)\s+(долар|доллар|долара|доллара|євро|евро|фунт|фунта|злот|злотого|франк|франка)/i,
];

console.log('=== Тестування CurrencyCommandsFuzzyMatcher ===');

testQueries.forEach(query => {
  console.log(`\nТестування: "${query}"`);
  const result = matcher.findCurrencyCommand(query);
  console.log('Результат:', result);
});

console.log('\n=== Тестування проблемних запитів ===');

failingQueries.forEach(query => {
  console.log(`\nТестування: "${query}"`);
  const result = matcher.findCurrencyCommand(query);
  console.log('Результат:', result);
});

console.log('\n=== Статистика ===');
console.log(matcher.getRecognitionStats());

console.log('\n=== Тестування конкретних regex ===');

const problematicQueries = [
  'скільки коштує долар',
  'ціна долара',
  'вартість долара',
  'скільки коштує євро',
  'ціна євро'
];

problematicQueries.forEach(query => {
  console.log(`\nТестування regex для: "${query}"`);
  ratePatterns.forEach((pattern, index) => {
    const match = query.match(pattern);
    console.log(`Pattern ${index + 1}: ${match ? 'Збіг!' : 'Немає збігу'}`);
    if (match) {
      console.log('Groups:', match);
    }
  });
}); 