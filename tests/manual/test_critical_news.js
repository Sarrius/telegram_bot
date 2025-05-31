const { NewsWeatherHandler } = require('../../dist/usecases/newsWeatherHandler');
const { EnhancedMessageHandler } = require('../../dist/usecases/enhancedMessageHandler');

console.log('🚨 Тестування критичних новин:');
console.log('='.repeat(50));

// Mock Telegram bot
const mockBot = {
  sendMessage: (chatId, message, options) => {
    console.log(`Bot відправляє повідомлення до чату ${chatId}:`);
    console.log(message);
    console.log('─'.repeat(40));
    return Promise.resolve();
  }
};

// Створюємо хендлер
const newsHandler = new NewsWeatherHandler(
  process.env.NEWS_API_KEY || 'test-key',
  process.env.WEATHER_API_KEY || 'test-key',
  mockBot
);

const enhancedHandler = new EnhancedMessageHandler(newsHandler, null, null);

async function testCriticalNewsCommands() {
  console.log('📰 Тестуємо команди новин:\n');

  const testCommands = [
    'Які новини?',
    'Що відбувається?',
    'Що нового?',
    'що по новинах',
    'останні новини',
    'свіжі новини',
    'критичні новини',
    'що твориться в світі'
  ];

  for (const command of testCommands) {
    console.log(`🔍 Тестуємо: "${command}"`);
    
    try {
      const response = await enhancedHandler.handleMessage({
        chat: { id: 12345, type: 'private' },
        message_id: Math.floor(Math.random() * 1000000),
        date: Math.floor(Date.now() / 1000),
        text: command,
        from: {
          id: 67890,
          is_bot: false,
          first_name: 'Тестер',
          username: 'tester'
        }
      });

      if (response.response && response.response.trim()) {
        console.log('✅ Відповідь бота:');
        console.log(response.response);
        console.log(`📊 Впевненість: ${(response.confidence * 100).toFixed(1)}%`);
        console.log(`🎯 Тип відповіді: ${response.type}`);
        if (response.reasoning) {
          console.log(`💭 Міркування: ${response.reasoning}`);
        }
      } else {
        console.log('❌ Команда не розпізнана');
      }
      
    } catch (error) {
      console.log(`❌ Помилка: ${error.message}`);
    }
    
    console.log('─'.repeat(60));
  }
}

async function testNewsRecognition() {
  console.log('\n🔍 Тестуємо розпізнавання команд новин:');
  console.log('='.repeat(50));

  const testPhrases = [
    'що по новинах',
    'що відбувається у світі',
    'які останні події',
    'критичні новини',
    'терміново що нового',
    'екстерні новини'
  ];

  for (const phrase of testPhrases) {
    const result = newsHandler.testCommandRecognition(phrase);
    
    if (result && result.type === 'news') {
      console.log(`✅ "${phrase}"`);
      console.log(`   Тип: ${result.type}`);
      console.log(`   Впевненість: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`   Збіг: ${result.matchedKeyword}`);
    } else if (result) {
      console.log(`⚠️ "${phrase}" - виявлено як ${result.type} (не news)`);
    } else {
      console.log(`❌ "${phrase}" - не розпізнано`);
    }
    console.log('');
  }
}

async function runTests() {
  console.log('🚨 Запуск тестів критичних новин...\n');
  
  await testNewsRecognition();
  await testCriticalNewsCommands();
  
  console.log('\n✅ Тестування завершено!');
  console.log('🔍 Перевірте, чи правильно бот показує критичні новини з заголовками та посиланнями.');
}

runTests().catch(console.error); 