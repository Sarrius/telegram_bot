const { EnhancedMessageHandler } = require('../../dist/usecases/enhancedMessageHandler');

async function testPowerWordsQuick() {
  const handler = new EnhancedMessageHandler();
  
  const testCases = [
    'Потужно працюю!',
    'Супер результат',
    'Могутній алгоритм', 
    'Офігенна робота',
    'Топ кодинг сесія',
    'Мега проект завершено'
  ];
  
  console.log('⚡ Швидкий тест Power Words:');
  console.log('='.repeat(40));
  
  for (const text of testCases) {
    const context = {
      messageId: Math.floor(Math.random() * 1000),
      text,
      chatId: 123,
      userId: 1,
      isPrivate: false,
      fromMe: false
    };
    
    const result = await handler.handleMessage(context);
    console.log(`📝 "${text}"`);
    console.log(`✅ Реакція: ${result.shouldReact ? result.reaction : 'немає'}`);
    console.log(`💬 Відповідь: ${result.shouldReply ? 'ТАК' : 'НІ'}`);
    console.log(`🎯 Впевненість: ${(result.confidence * 100).toFixed(1)}%`);
    console.log('─'.repeat(40));
  }
  
  console.log('✅ Тест завершено!');
}

testPowerWordsQuick().catch(console.error); 