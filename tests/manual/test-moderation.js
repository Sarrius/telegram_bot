const { ModerationHandler } = require('../../dist/usecases/moderationHandler');

console.log('🔴 Тестування системи модерації нецензурної лексики');
console.log('=' .repeat(60));

const moderationHandler = new ModerationHandler();

// Тестові повідомлення
const testMessages = [
  { text: 'Привіт! Як справи?', type: 'clean' },
  { text: 'Блять, що за фігня тут відбувається?', type: 'moderate' },
  { text: 'Сука яка неприємна ситуація', type: 'mild' },
  { text: 'Хуй пізда ебать блять мудак', type: 'severe' },
  { text: 'Мудак якийсь знову спізнився', type: 'moderate' },
  { text: 'Пиздец какой ужас', type: 'severe' },
  { text: 'Этот му@ак снова тут', type: 'obfuscated' },
  { text: 'Какая п1зда ситуация', type: 'obfuscated' }
];

console.log('\n📊 Статистика фільтра:');
const stats = moderationHandler.getStats();
console.log(`- Українських слів: ${stats.profanityFilter.ukrainianWordsCount}`);
console.log(`- Російських слів: ${stats.profanityFilter.russianWordsCount}`);
console.log(`- Всього слів: ${stats.profanityFilter.totalWordsCount}`);
console.log(`- Шаблонів відповідей: ${stats.responseTemplates.warning + stats.responseTemplates.moderate + stats.responseTemplates.strict}`);

console.log('\n🧪 Тестування повідомлень:');
console.log('-'.repeat(60));

testMessages.forEach((testMsg, index) => {
  console.log(`\n${index + 1}. Тип: ${testMsg.type.toUpperCase()}`);
  console.log(`   Текст: "${testMsg.text}"`);
  
  const response = moderationHandler.analyzeMessage(
    testMsg.text,
    'group',
    'test_user',
    'test_chat'
  );
  
  if (response.shouldRespond) {
    console.log(`   ✅ ВИЯВЛЕНО: ${response.responseType} (${(response.confidence * 100).toFixed(1)}%)`);
    console.log(`   📝 Відповідь: "${response.response}"`);
    console.log(`   🔍 Причина: ${response.reasoning}`);
  } else {
    console.log(`   ✅ ЧИСТО: ${response.reasoning}`);
  }
});

console.log('\n🔧 Тестування конфігурації:');
console.log('-'.repeat(60));

// Тест відключення модерації для легких порушень
console.log('\n1. Відключення попереджень для легких порушень:');
moderationHandler.updateConfig({ warnOnMild: false });

const mildTest = moderationHandler.analyzeMessage(
  'Сука яка неприємна ситуація',
  'group',
  'test_user',
  'test_chat'
);

console.log(`   Результат: ${mildTest.shouldRespond ? 'РЕАГУЄ' : 'ІГНОРУЄ'}`);
console.log(`   Причина: ${mildTest.reasoning}`);

// Повернути налаштування
moderationHandler.updateConfig({ warnOnMild: true });

// Тест додавання кастомного слова
console.log('\n2. Додавання кастомного слова:');
moderationHandler.addProfanityWord('тестлайка', 'ua');

const customTest = moderationHandler.analyzeMessage(
  'Яка тестлайка ситуація',
  'group',
  'test_user',
  'test_chat'
);

console.log(`   Результат: ${customTest.shouldRespond ? 'ВИЯВЛЕНО' : 'НЕ ВИЯВЛЕНО'}`);
if (customTest.shouldRespond) {
  console.log(`   Відповідь: "${customTest.response}"`);
}

console.log('\n3. Тестування різних типів чатів:');

const chatTypes = ['private', 'group', 'supergroup', 'channel'];
const testText = 'Блять неприємно';

chatTypes.forEach(chatType => {
  const response = moderationHandler.analyzeMessage(
    testText,
    chatType,
    'test_user',
    'test_chat'
  );
  
  console.log(`   ${chatType}: ${response.shouldRespond ? 'РЕАГУЄ' : 'ІГНОРУЄ'} - ${response.reasoning}`);
});

console.log('\n✅ Тестування завершено!');
console.log('\n💡 Система модерації готова до використання у боті.');
console.log('   Бот буде автоматично виявляти нецензурну лексику та відповідати відповідно до налаштувань.'); 