const { FeatureManager } = require('../../dist/config/featureManager');
const { EnhancedMessageHandler } = require('../../dist/usecases/enhancedMessageHandler');

async function testFeatureDisabling() {
  console.log('🧪 Тестування вимкнення функцій через CLI:');
  console.log('='.repeat(50));

  const featureManager = FeatureManager.getInstance();
  const handler = new EnhancedMessageHandler();

  console.log('\n1️⃣ Перевіряємо початковий стан powerWords:');
  console.log(`   Статус: ${featureManager.isEnabled('powerWords') ? '✅ Увімкнено' : '🔴 Вимкнено'}`);

  console.log('\n2️⃣ Тестуємо power word ПЕРЕД вимкненням:');
  const contextBefore = {
    text: 'Потужно працюю!',
    userId: 'test_user',
    chatId: 'test_chat',
    userName: 'TestUser',
    isGroupChat: true,
    messageId: 1,
    isReplyToBot: false,
    mentionsBot: false,
    isDirectMention: false
  };

  const responseBefore = await handler.handleMessage(contextBefore);
  console.log(`   Тип відповіді: ${responseBefore.responseType}`);
  console.log(`   Реакція: ${responseBefore.shouldReact ? responseBefore.reaction : 'немає'}`);
  console.log(`   Power Word виявлено: ${responseBefore.powerWordReaction ? 'ТАК' : 'НІ'}`);

  console.log('\n3️⃣ Вимикаємо powerWords через FeatureManager:');
  const disableResult = featureManager.disableFeature('powerWords');
  console.log(`   Результат: ${disableResult}`);
  console.log(`   Новий статус: ${featureManager.isEnabled('powerWords') ? '✅ Увімкнено' : '🔴 Вимкнено'}`);

  console.log('\n4️⃣ Тестуємо power word ПІСЛЯ вимкнення:');
  const contextAfter = {
    text: 'Потужно працюю!',
    userId: 'test_user',
    chatId: 'test_chat',
    userName: 'TestUser',
    isGroupChat: true,
    messageId: 2,
    isReplyToBot: false,
    mentionsBot: false,
    isDirectMention: false
  };

  const responseAfter = await handler.handleMessage(contextAfter);
  console.log(`   Тип відповіді: ${responseAfter.responseType}`);
  console.log(`   Реакція: ${responseAfter.shouldReact ? responseAfter.reaction : 'немає'}`);
  console.log(`   Power Word виявлено: ${responseAfter.powerWordReaction ? 'ТАК' : 'НІ'}`);

  console.log('\n5️⃣ Перевіряємо чи перевірка isEnabled працює правильно:');
  console.log(`   featureManager.isEnabled('powerWords'): ${featureManager.isEnabled('powerWords')}`);
  console.log(`   handler.featureManager (той самий instance?): ${handler.featureManager === featureManager}`);

  console.log('\n6️⃣ Вмикаємо назад для чистоти:');
  const enableResult = featureManager.enableFeature('powerWords');
  console.log(`   Результат: ${enableResult}`);
  console.log(`   Фінальний статус: ${featureManager.isEnabled('powerWords') ? '✅ Увімкнено' : '🔴 Вимкнено'}`);

  console.log('\n✅ Тест завершено!');
}

testFeatureDisabling().catch(console.error); 