const { EnhancedMessageHandler } = require('../../dist/usecases/enhancedMessageHandler');

async function testPowerWords() {
  console.log('🧪 Тестування потужних слів в EnhancedMessageHandler:');
  console.log('='.repeat(50));

  const handler = new EnhancedMessageHandler();

  const testMessages = [
    'Потужно працюю сьогодні!',
    'Супер результат!',
    'Могутній успіх в проекті',
    'Офігенний день сьогодні',
    'Топ робота, класний результат',
    'Мега крутий алгоритм',
    'Звичайний день на роботі'
  ];

  for (const message of testMessages) {
    try {
      console.log(`\n📩 Тестую: "${message}"`);
      
      const context = {
        text: message,
        userId: 'test_user_123',
        chatId: 'test_chat',
        userName: 'TestUser',
        chatType: 'group',
        isGroupChat: true,
        messageId: 1,
        isReplyToBot: false,
        mentionsBot: false,
        isDirectMention: false,
        requestsMeme: false
      };

      const response = await handler.handleMessage(context);
      
      console.log(`   Тип відповіді: ${response.responseType}`);
      console.log(`   Реакція: ${response.shouldReact ? response.reaction : 'немає'}`);
      console.log(`   Відповідь: ${response.shouldReply ? response.reply : 'немає'}`);
      console.log(`   Впевненість: ${(response.confidence * 100).toFixed(1)}%`);
      
      if (response.powerWordReaction) {
        console.log(`   ⚡ Power Word: ${response.powerWordReaction.emoji} (${response.powerWordReaction.match.matchedWord})`);
      } else {
        console.log(`   ⚡ Power Word: не виявлено`);
      }
      
      console.log(`   Reasoning: ${response.reasoning}`);
    } catch (error) {
      console.error(`   ❌ Помилка: ${error.message}`);
    }
  }
}

testPowerWords().catch(console.error); 