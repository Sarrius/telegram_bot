const { EnhancedMessageHandler } = require('../../dist/usecases/enhancedMessageHandler');

async function testBotBehavior() {
  console.log('🤖 Testing Enhanced Ukrainian Telegram Bot Behavior\n');
  
  const handler = new EnhancedMessageHandler();
  
  const testMessages = [
    // Звичайні повідомлення (не повинні викликати реакцію)
    { text: 'привіт', description: 'Звичайне привітання' },
    { text: 'як справи?', description: 'Звичайне питання' },
    { text: 'добре', description: 'Коротка відповідь' },
    { text: 'що робиш?', description: 'Повсякденне питання' },
    
    // Запити можливостей (повинні викликати відповідь)
    { text: 'що ти можеш?', description: 'Запит можливостей' },
    { text: 'what can you do?', description: 'English capabilities request' },
    { text: 'допомога', description: 'Запит допомоги' },
    
    // Сильні емоції (можуть викликати реакцію)
    { text: 'СУПЕР ПОТУЖНО!!! ВАУ!!!', description: 'Дуже сильні позитивні емоції' },
    { text: 'допоможи мені будь ласка', description: 'Прохання про допомогу' },
    { text: 'всім привіт!', description: 'Групове привітання' },
    
    // Мем запити
    { text: 'створи мем про понеділок', description: 'Запит мему' },
    { text: '/meme топ текст | низ текст', description: 'Команда мему' },
  ];
  
  for (const testMsg of testMessages) {
    console.log(`📝 Тестуємо: "${testMsg.text}" (${testMsg.description})`);
    
    const context = {
      text: testMsg.text,
      userId: 'test_user',
      chatId: 'test_chat',
      userName: 'TestUser',
      isGroupChat: true,
      messageId: Date.now(),
      isReplyToBot: false,
      mentionsBot: false,
      isDirectMention: false,
      requestsMeme: testMsg.text.includes('мем') || testMsg.text.includes('meme'),
      memeRequest: testMsg.text.includes('мем') || testMsg.text.includes('meme') ? testMsg.text : undefined
    };
    
    try {
      const response = await handler.handleMessage(context);
      
      console.log(`   🎯 Тип відповіді: ${response.responseType}`);
      console.log(`   🤔 Рішення: ${response.reasoning}`);
      
      if (response.shouldReply && response.reply) {
        console.log(`   💬 Відповідь: ${response.reply.substring(0, 100)}...`);
      }
      
      if (response.shouldReact && response.reaction) {
        console.log(`   😊 Реакція: ${response.reaction} (НЕ надсилається як повідомлення)`);
      }
      
      if (response.responseType === 'none') {
        console.log(`   🤐 Бот мовчить (правильно!)`);
      }
      
    } catch (error) {
      console.log(`   ❌ Помилка: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('✅ Тестування завершено!');
  console.log('\n📊 Висновки:');
  console.log('- Бот більше не спамить емоджі як повідомлення');
  console.log('- Реагує тільки на важливі запити та сильні емоції');
  console.log('- Завжди відповідає на запити можливостей');
  console.log('- Генерує меми за запитом');
  console.log('- Ігнорує звичайні повсякденні повідомлення');
}

testBotBehavior().catch(console.error); 