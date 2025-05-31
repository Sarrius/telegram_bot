const { EnhancedMessageHandler } = require('../../dist/usecases/enhancedMessageHandler');

console.log('⚡ Тестування Power Words - тільки реакції:');
console.log('='.repeat(50));

async function testPowerWordsReactionOnly() {
  const handler = new EnhancedMessageHandler();

  const testMessages = [
    { text: 'Потужно працюю сьогодні!', expected: '⚡' },
    { text: 'Супер результат!', expected: '⚡' },
    { text: 'Могутній успіх в проекті', expected: '💪' },
    { text: 'Офігенний день сьогодні', expected: '🔥' },
    { text: 'Топ робота, класний результат', expected: '⚡' },
    { text: 'Мега крутий алгоритм', expected: '⚡' },
    { text: 'Неймовірно енергійний день', expected: '🚀' },
    { text: 'Бомбезний фідбек від клієнта', expected: '🔥' }
  ];

  console.log('🔍 Тестуємо, що power words дають тільки реакції:\n');

  for (const { text, expected } of testMessages) {
    try {
      console.log(`📩 Тестую: "${text}"`);
      
      const context = {
        text: text,
        userId: 'test_user_123',
        chatId: 'test_chat',
        userName: 'TestUser',
        chatType: 'group',
        isGroupChat: true,
        messageId: Math.floor(Math.random() * 1000000),
        isReplyToBot: false,
        mentionsBot: false,
        isDirectMention: false,
        requestsMeme: false
      };

      const response = await handler.handleMessage(context);
      
      if (response.responseType === 'power_word') {
        console.log(`   ✅ Тип відповіді: ${response.responseType}`);
        console.log(`   ⚡ Реакція: ${response.reaction || 'немає'}`);
        console.log(`   💬 Текстова відповідь: ${response.shouldReply ? response.reply : 'немає'}`);
        console.log(`   📊 Впевненість: ${(response.confidence * 100).toFixed(1)}%`);
        
        // Перевіряємо, що є тільки реакція
        if (response.shouldReact && !response.shouldReply) {
          console.log(`   ✅ ПРАВИЛЬНО: Тільки реакція, без тексту`);
        } else if (response.shouldReact && response.shouldReply) {
          console.log(`   ❌ ПОМИЛКА: Є і реакція, і текст!`);
        } else {
          console.log(`   ❌ ПОМИЛКА: Немає реакції!`);
        }
        
        if (response.powerWordReaction) {
          console.log(`   🎯 Power Word: ${response.powerWordReaction.match.matchedWord} (${response.powerWordReaction.emoji})`);
        }
        
      } else if (response.responseType === 'none') {
        console.log(`   ❌ Power word не виявлено`);
      } else {
        console.log(`   ⚠️ Інший тип відповіді: ${response.responseType}`);
      }
      
      console.log(`   💭 Reasoning: ${response.reasoning}`);
      
    } catch (error) {
      console.error(`   ❌ Помилка: ${error.message}`);
    }
    
    console.log('─'.repeat(60));
  }
}

async function testNonPowerWords() {
  const handler = new EnhancedMessageHandler();
  
  console.log('\n🔍 Тестуємо звичайні слова (не power words):\n');

  const nonPowerMessages = [
    'Звичайний день на роботі',
    'Йду в магазин за хлібом', 
    'Дякую за допомогу',
    'Як справи у всіх?',
    'Побачимося завтра'
  ];

  for (const text of nonPowerMessages) {
    try {
      console.log(`📩 Тестую: "${text}"`);
      
      const context = {
        text: text,
        userId: 'test_user_456',
        chatId: 'test_chat',
        userName: 'TestUser',
        chatType: 'group',
        isGroupChat: true,
        messageId: Math.floor(Math.random() * 1000000),
        isReplyToBot: false,
        mentionsBot: false,
        isDirectMention: false,
        requestsMeme: false
      };

      const response = await handler.handleMessage(context);
      
      if (response.responseType === 'power_word') {
        console.log(`   ❌ ПОМИЛКА: Виявлено power word у звичайному тексті!`);
      } else {
        console.log(`   ✅ ПРАВИЛЬНО: Power word не виявлено`);
      }
      
      console.log(`   Тип відповіді: ${response.responseType}`);
      
    } catch (error) {
      console.error(`   ❌ Помилка: ${error.message}`);
    }
    
    console.log('');
  }
}

async function runTests() {
  console.log('⚡ Запуск тестів Power Words (тільки реакції)...\n');
  
  await testPowerWordsReactionOnly();
  await testNonPowerWords();
  
  console.log('\n✅ Тестування завершено!');
  console.log('🎯 Результат: Бот має ставити тільки реакції на power words, без текстових відповідей.');
}

runTests().catch(console.error); 