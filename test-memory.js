const { UserMemory } = require('./dist/domain/userMemory');

function testMemorySystem() {
    console.log('🧠 Тестування системи пам\'яті бота\n');
    
    const memory = new UserMemory();
    
    // Тестові дані
    const users = [
        { id: 'user1', username: 'GoodUser', firstName: 'Іван' },
        { id: 'user2', username: 'BadUser', firstName: 'Петро' },
        { id: 'user3', username: 'MixedUser', firstName: 'Марія' }
    ];
    
    console.log('📝 Сценарій 1: Добропорядний користувач');
    console.log('=' .repeat(50));
    
    // Добрий користувач
    let response = memory.analyzeMessage(users[0].id, users[0].username, users[0].firstName, 'Привіт! Дякую за допомогу!', false);
    console.log(`✅ Позитивне повідомлення: "${response.memoryMessage || 'Немає відповіді'}" (${response.emotionalState})`);
    
    response = memory.analyzeMessage(users[0].id, users[0].username, users[0].firstName, 'Покажи мем', true);
    console.log(`🎯 Прохання: "${response.memoryMessage || 'Відповідь дозволена'}" (Заблоковано: ${response.shouldBlock})`);
    
    console.log('\n📝 Сценарій 2: Токсичний користувач');
    console.log('=' .repeat(50));
    
    // Поганий користувач - образа
    response = memory.analyzeMessage(users[1].id, users[1].username, users[1].firstName, 'Ти дурак, нічого не вмієш!', false);
    console.log(`❌ Образливе повідомлення: "${response.memoryMessage || 'Образа зареєстрована'}" (${response.emotionalState})`);
    
    // Спроба зробити прохання без вибачення
    response = memory.analyzeMessage(users[1].id, users[1].username, users[1].firstName, 'Покажи мем', true);
    console.log(`🚫 Прохання після образи:`);
    console.log(`   Заблоковано: ${response.shouldBlock}`);
    console.log(`   Відповідь: "${response.memoryMessage}"`);
    console.log(`   Емоційний стан: ${response.emotionalState}`);
    
    // Слабе вибачення
    response = memory.analyzeMessage(users[1].id, users[1].username, users[1].firstName, 'сорі', false);
    console.log(`😒 Слабе вибачення: "${response.memoryMessage}" (Прийнято: ${!response.shouldDemandApology})`);
    
    // Нормальне вибачення
    response = memory.analyzeMessage(users[1].id, users[1].username, users[1].firstName, 'Вибач мене, я був неправий і більше не буду', false);
    console.log(`✅ Хороше вибачення: "${response.memoryMessage}" (Прийнято: ${response.shouldRewardGoodBehavior})`);
    
    // Тепер прохання має пройти
    response = memory.analyzeMessage(users[1].id, users[1].username, users[1].firstName, 'Тепер покажи мем', true);
    console.log(`🎯 Прохання після вибачення: "${response.memoryMessage || 'Відповідь дозволена'}" (Заблоковано: ${response.shouldBlock})`);
    
    console.log('\n📝 Сценарій 3: Тяжка образа');
    console.log('=' .repeat(50));
    
    // Дуже погана образа
    response = memory.analyzeMessage(users[2].id, users[2].username, users[2].firstName, 'Іди нахуй, сука!', false);
    console.log(`💀 Тяжка образа зареєстрована (рівень вибачення: ${memory.getUserProfile(users[2].id).apologyLevel})`);
    
    // Спроба прохання
    response = memory.analyzeMessage(users[2].id, users[2].username, users[2].firstName, 'Допоможи з кодом', true);
    console.log(`🔥 Вимога вибачення:`);
    console.log(`   "${response.memoryMessage}"`);
    
    // Спроба простого вибачення (недостатньо для humiliating)
    response = memory.analyzeMessage(users[2].id, users[2].username, users[2].firstName, 'Вибач', false);
    console.log(`❌ Просте вибачення відхилено: "${response.memoryMessage}"`);
    
    // Щире вибачення
    response = memory.analyzeMessage(users[2].id, users[2].username, users[2].firstName, 'Каюся, я був дуже неправий, вибач мене будь ласка, обіцяю що більше не буду так поводитися', false);
    console.log(`✅ Щире вибачення прийнято: "${response.memoryMessage}"`);
    
    console.log('\n📊 Статистика пам\'яті');
    console.log('=' .repeat(50));
    const stats = memory.getStats();
    console.log(`👥 Всього користувачів: ${stats.totalUsers}`);
    console.log(`⚠️ Потребують вибачення: ${stats.usersNeedingApology}`);
    console.log(`💬 Всього взаємодій: ${stats.totalInteractions}`);
    console.log(`😡 Образ: ${stats.totalOffenses}`);
    console.log(`😊 Комплементів: ${stats.totalCompliments}`);
    console.log(`📈 Середнє ставлення: ${stats.averageAttitude.toFixed(2)}`);
    
    console.log('\n👥 Профілі користувачів');
    console.log('=' .repeat(50));
    users.forEach(user => {
        const profile = memory.getUserProfile(user.id);
        if (profile) {
            console.log(`\n${user.username} (@${user.firstName}):`);
            console.log(`  💭 Ставлення: ${profile.averageAttitude.toFixed(2)}`);
            console.log(`  💬 Взаємодій: ${profile.totalInteractions}`);
            console.log(`  😡 Образ: ${profile.offensiveHistory.count}`);
            console.log(`  😊 Комплементів: ${profile.positiveHistory.count}`);
            console.log(`  🙏 Потрібне вибачення: ${profile.needsApology ? 'Так (' + profile.apologyLevel + ')' : 'Ні'}`);
            
            if (profile.offensiveHistory.worstOffenses.length > 0) {
                console.log(`  🔥 Найгірші образи:`);
                profile.offensiveHistory.worstOffenses.slice(0, 3).forEach((offense, i) => {
                    console.log(`     ${i + 1}. "${offense}"`);
                });
            }
        }
    });
    
    console.log('\n🎭 Тестування поведінки після покращення');
    console.log('=' .repeat(50));
    
    // Користувач з поганою історією пише комплімент
    response = memory.analyzeMessage(users[1].id, users[1].username, users[1].firstName, 'Дякую, ти чудовий бот!', false);
    console.log(`🥰 Винагорода за покращення: "${response.memoryMessage || 'Немає особливої реакції'}" (${response.emotionalState})`);
    
    console.log('\n✅ Тестування завершено!');
}

// Запускаємо тест
try {
    testMemorySystem();
} catch (error) {
    console.error('❌ Помилка:', error);
} 