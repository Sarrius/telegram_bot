/**
 * Тест перевірки фактичної роботи вимкнених функцій
 * Перевіряє, що коли функція вимкнена через FeatureManager, вона дійсно не спрацьовує
 */

const { FeatureManager } = require('../../dist/config/featureManager');
const { EnhancedMessageHandler } = require('../../dist/usecases/enhancedMessageHandler');

console.log('🧪 Тест перевірки вимкнених функцій');
console.log('=====================================');

// Тестові повідомлення для різних функцій
const testMessages = [
    {
        functionName: 'moderation',
        message: 'йобаний дурак',
        expectedResponse: 'none', // Має бути none якщо moderation вимкнена
        description: 'Лайка має ігноруватися при вимкненій модерації'
    },
    {
        functionName: 'memory', 
        message: 'зроби щось корисне',
        expectedResponse: 'none', // Має бути none якщо memory вимкнена
        description: 'Запам\'ятовування має не працювати при вимкненій пам\'яті'
    },
    {
        functionName: 'nlp',
        message: 'привіт як справи', 
        expectedResponse: 'none', // Має бути none якщо nlp вимкнена  
        description: 'NLP розмови мають не працювати при вимкненій nlp'
    },
    {
        functionName: 'atmosphere',
        message: 'всім привіт!',
        expectedResponse: 'none', // Має бути none якщо atmosphere вимкнена
        description: 'Відстеження атмосфери має не працювати при вимкненій atmosphere'
    },
    {
        functionName: 'profanityFilter',
        message: 'блядь сука',
        expectedResponse: 'none', // Має бути none якщо profanityFilter вимкнена
        description: 'Фільтр нецензурщини має не працювати при вимкненому profanityFilter'
    },
    {
        functionName: 'powerWords',
        message: 'потужно!', 
        expectedResponse: 'power_word', // Має працювати - єдина функція що працює
        description: 'PowerWords має працювати (увімкнена)'
    }
];

async function testFeatureDisabling() {
    const featureManager = FeatureManager.getInstance();
    const messageHandler = new EnhancedMessageHandler();
    
    console.log('\n📋 Поточний статус функцій:');
    console.log(featureManager.getFeatureStatus());
    
    console.log('\n🧪 Тестування вимкнених функцій...\n');
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = [];
    
    for (const test of testMessages) {
        totalTests++;
        
        console.log(`🔍 Тестую ${test.functionName}: "${test.message}"`);
        console.log(`   Опис: ${test.description}`);
        console.log(`   Очікуваний responseType: ${test.expectedResponse}`);
        
        const context = {
            text: test.message,
            userId: 'test_user_123',
            userName: 'TestUser',
            chatId: 'test_chat_456',
            chatType: 'group',
            isDirectMention: false,
            mentionsBot: false,
            isReplyToBot: false
        };
        
        try {
            const response = await messageHandler.handleMessage(context);
            console.log(`   Фактичний responseType: ${response.responseType}`);
            
            if (response.responseType === test.expectedResponse) {
                console.log(`   ✅ ПРОЙДЕНО - функція ${test.functionName} працює правильно`);
                passedTests++;
            } else {
                console.log(`   ❌ ПРОВАЛ - функція ${test.functionName} працює неправильно!`);
                console.log(`      Очікувалося: ${test.expectedResponse}, отримано: ${response.responseType}`);
                
                if (response.shouldReply) {
                    console.log(`      Відповідь: "${response.reply}"`);
                }
                if (response.shouldReact) {
                    console.log(`      Реакція: ${response.reaction}`);
                }
                
                failedTests.push({
                    functionName: test.functionName,
                    expected: test.expectedResponse,
                    actual: response.responseType,
                    message: test.message
                });
            }
            
        } catch (error) {
            console.log(`   ❌ ПОМИЛКА - ${error.message}`);
            failedTests.push({
                functionName: test.functionName,
                expected: test.expectedResponse,
                actual: 'ERROR',
                message: test.message,
                error: error.message
            });
        }
        
        console.log(''); // Порожній рядок для розділення
    }
    
    // Підсумки
    console.log('=================================');
    console.log('📊 РЕЗУЛЬТАТИ ТЕСТУВАННЯ:');
    console.log(`   Всього тестів: ${totalTests}`);
    console.log(`   Пройдено: ${passedTests} ✅`);
    console.log(`   Провалено: ${failedTests.length} ❌`);
    console.log(`   Успішність: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    if (failedTests.length > 0) {
        console.log('\n❌ ПРОБЛЕМИ ВИЯВЛЕНІ:');
        failedTests.forEach(fail => {
            console.log(`   • ${fail.functionName}: очікувалося ${fail.expected}, отримано ${fail.actual}`);
            if (fail.error) {
                console.log(`     Помилка: ${fail.error}`);
            }
        });
        
        console.log('\n🔧 РЕКОМЕНДАЦІЇ ДЛЯ ВИПРАВЛЕННЯ:');
        console.log('   1. Перевірте EnhancedMessageHandler.handleMessage()');
        console.log('   2. Переконайтеся що всі функції перевіряють featureManager.isEnabled()');
        console.log('   3. Переконайтеся що перевірка відбувається ПЕРЕД обробкою');
        console.log('   4. Перевірте що shouldEngageBasedOnEmotions() не перевизначає настройки');
    } else {
        console.log('\n🎉 ВСІ ТЕСТИ ПРОЙДЕНІ! Функції працюють правильно');
    }
}

// Запуск тесту
testFeatureDisabling().catch(console.error); 