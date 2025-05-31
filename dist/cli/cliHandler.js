"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIHandler = void 0;
exports.startCLI = startCLI;
// CLI Handler для командного режиму
const appConfig_1 = require("../config/appConfig");
const enhancedMessageHandler_1 = require("../usecases/enhancedMessageHandler");
class CLIHandler {
    constructor() {
        this.commands = new Map();
        this.initializeCommands();
    }
    initializeCommands() {
        // Реєструємо доступні команди
        this.registerCommand('help', 'Показати список доступних команд', this.showHelp.bind(this));
        this.registerCommand('config', 'Показати поточну конфігурацію', this.showConfig.bind(this));
        this.registerCommand('stats', 'Показати статистику бота', this.showStats.bind(this));
        this.registerCommand('test', 'Запустити тестові сценарії', this.runTests.bind(this));
        this.registerCommand('validate', 'Валідувати конфігурацію', this.validateConfig.bind(this));
        this.registerCommand('features', 'Показати статус функцій', this.showFeatures.bind(this));
        this.registerCommand('env', 'Показати змінні середовища', this.showEnvironment.bind(this));
        this.registerCommand('health', 'Перевірити здоров\'я системи', this.checkHealth.bind(this));
        this.registerCommand('memory', 'Показати статистику пам\'яті', this.showMemoryStats.bind(this));
        this.registerCommand('profanity', 'Тестувати фільтр нецензурщини', this.testProfanityFilter.bind(this));
        this.registerCommand('fuzzy', 'Тестувати fuzzy matching', this.testFuzzyMatching.bind(this));
        this.registerCommand('exit', 'Вийти з CLI режиму', this.exit.bind(this));
    }
    registerCommand(name, description, handler) {
        this.commands.set(name, { name, description, execute: handler });
    }
    async start() {
        console.log('🚀 CLI режим активовано');
        console.log('💡 Введіть "help" для списку команд');
        // Ініціалізуємо message handler для тестів
        try {
            this.messageHandler = new enhancedMessageHandler_1.EnhancedMessageHandler();
            console.log('✅ Message handler ініціалізовано');
        }
        catch (error) {
            console.error('❌ Помилка ініціалізації message handler:', error);
        }
        // Обробляємо CLI аргументи
        await this.processArguments();
        if (!this.shouldExitAfterArguments()) {
            await this.startInteractiveMode();
        }
    }
    async processArguments() {
        const args = process.argv.slice(2);
        for (const arg of args) {
            if (arg === '--stats') {
                await this.showStats();
            }
            else if (arg === '--config') {
                await this.showConfig();
            }
            else if (arg === '--test-mode') {
                await this.runTests();
            }
            else if (arg === '--health') {
                await this.checkHealth();
            }
            else if (arg === '--validate') {
                await this.validateConfig();
            }
            else if (arg === '--features') {
                await this.showFeatures();
            }
        }
    }
    shouldExitAfterArguments() {
        const args = process.argv.slice(2);
        return args.some(arg => ['--stats', '--config', '--health', '--validate', '--features'].includes(arg));
    }
    async startInteractiveMode() {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '🤖 telegram-bot> '
        });
        rl.prompt();
        rl.on('line', async (input) => {
            const trimmedInput = input.trim();
            if (trimmedInput) {
                await this.executeCommand(trimmedInput);
            }
            rl.prompt();
        });
        rl.on('close', () => {
            console.log('\n👋 До побачення!');
            process.exit(0);
        });
    }
    async executeCommand(input) {
        const [commandName, ...args] = input.split(' ');
        const command = this.commands.get(commandName);
        if (!command) {
            console.log(`❌ Невідома команда: ${commandName}`);
            console.log('💡 Введіть "help" для списку доступних команд');
            return;
        }
        try {
            await command.execute();
        }
        catch (error) {
            console.error(`❌ Помилка виконання команди ${commandName}:`, error);
        }
    }
    // Реалізація команд
    showHelp() {
        console.log('\n📋 Доступні команди:');
        console.log('='.repeat(50));
        this.commands.forEach(command => {
            console.log(`  ${command.name.padEnd(15)} - ${command.description}`);
        });
        console.log('\n💡 Приклади використання:');
        console.log('  npm run dev -- --cli --stats     # Запустити з показом статистики');
        console.log('  npm run dev -- --cli --config    # Запустити з показом конфігурації');
        console.log('  npm run dev -- --cli --test-mode # Запустити в тестовому режимі');
    }
    showConfig() {
        console.log('\n⚙️ Поточна конфігурація:');
        console.log('='.repeat(50));
        const safeConfig = (0, appConfig_1.getSafeConfig)();
        console.log(JSON.stringify(safeConfig, null, 2));
    }
    async showStats() {
        console.log('\n📊 Статистика бота:');
        console.log('='.repeat(50));
        if (!this.messageHandler) {
            console.log('❌ Message handler не ініціалізовано');
            return;
        }
        try {
            const stats = this.messageHandler.getEnhancedStats();
            console.log('📈 Загальна статистика:');
            console.log(`  - Активні користувачі NLP: ${stats.nlp.activeUsers}`);
            console.log(`  - Всього взаємодій NLP: ${stats.nlp.totalInteractions}`);
            console.log(`  - Українські користувачі: ${stats.nlp.ukrainianUsers}`);
            console.log(`  - Англійські користувачі: ${stats.nlp.englishUsers}`);
            console.log(`  - Доступні меми: ${stats.memes.availableTemplates}`);
            console.log(`  - Активні чат callbacks: ${stats.atmosphere.activeChatCallbacks}`);
            console.log('\n🎭 Атмосфера чату:');
            // Показуємо статистику для тестового чата
            const testChatId = 'test_chat';
            const atmosphereStats = this.messageHandler.getChatAtmosphereStats(testChatId);
            console.log(`  Тестовий чат ${testChatId}:`);
            console.log(`    - Callback зареєстровано: ${atmosphereStats.engagementCallbackRegistered}`);
            console.log(`    - Ролі користувачів: ${atmosphereStats.userRoles.length}`);
        }
        catch (error) {
            console.error('❌ Помилка отримання статистики:', error);
        }
    }
    async runTests() {
        console.log('\n🧪 Запуск тестових сценаріїв:');
        console.log('='.repeat(50));
        if (!this.messageHandler) {
            console.log('❌ Message handler не ініціалізовано');
            return;
        }
        // Тест 1: Аналіз українського тексту
        console.log('🔍 Тест 1: Аналіз українського тексту');
        try {
            const testMessage = 'Привіт! Як справи? Чудовий день сьогодні! 😊';
            const context = {
                text: testMessage,
                userId: 'test_user',
                chatId: 'test_chat',
                userName: 'Тест',
                chatType: 'group',
                isGroupChat: true,
                messageId: 1,
                isReplyToBot: false,
                mentionsBot: false,
                isDirectMention: false,
                requestsMeme: false
            };
            const response = await this.messageHandler.handleMessage(context);
            console.log(`  ✅ Повідомлення оброблено: ${response.shouldReact ? 'Реакція потрібна' : 'Реакції немає'}`);
            console.log(`  📊 Тип відповіді: ${response.responseType}`);
            console.log(`  🎯 Впевненість: ${response.confidence}`);
        }
        catch (error) {
            console.log(`  ❌ Помилка: ${error}`);
        }
        // Тест 2: Тест нецензурщини
        console.log('\n🚫 Тест 2: Фільтр нецензурщини');
        try {
            const profaneMessage = 'Ти дурак, нічого не вмієш!';
            const context = {
                text: profaneMessage,
                userId: 'test_user2',
                chatId: 'test_chat',
                userName: 'Тест2',
                chatType: 'group',
                isGroupChat: true,
                messageId: 2,
                isReplyToBot: false,
                mentionsBot: false,
                isDirectMention: false,
                requestsMeme: false
            };
            const response = await this.messageHandler.handleMessage(context);
            console.log(`  ✅ Неналежний контент виявлено: ${response.inappropriateContentWarning ? 'Так' : 'Ні'}`);
            if (response.reply) {
                console.log(`  💬 Відповідь: ${response.reply.substring(0, 100)}...`);
            }
        }
        catch (error) {
            console.log(`  ❌ Помилка: ${error}`);
        }
        // Тест 3: Запит можливостей
        console.log('\n🤖 Тест 3: Запит можливостей');
        try {
            const capabilityMessage = 'Що ти можеш?';
            const context = {
                text: capabilityMessage,
                userId: 'test_user3',
                chatId: 'test_chat',
                userName: 'Тест3',
                chatType: 'group',
                isGroupChat: true,
                messageId: 3,
                isReplyToBot: false,
                mentionsBot: false,
                isDirectMention: false,
                requestsMeme: false
            };
            const response = await this.messageHandler.handleMessage(context);
            console.log(`  ✅ Запит можливостей оброблено: ${response.responseType === 'conversation' ? 'Так' : 'Ні'}`);
            if (response.reply) {
                console.log(`  📋 Показано можливості: ${response.reply.includes('можливості') ? 'Так' : 'Ні'}`);
            }
        }
        catch (error) {
            console.log(`  ❌ Помилка: ${error}`);
        }
        console.log('\n✅ Тестування завершено!');
    }
    validateConfig() {
        console.log('\n✅ Валідація конфігурації:');
        console.log('='.repeat(50));
        const { validateConfig } = require('../config/appConfig');
        const validation = validateConfig();
        if (validation.valid) {
            console.log('✅ Конфігурація валідна!');
        }
        else {
            console.log('❌ Знайдено помилки:');
            validation.errors.forEach((error) => {
                console.log(`  - ${error}`);
            });
        }
    }
    showFeatures() {
        console.log('\n🎛️ Статус функцій:');
        console.log('='.repeat(50));
        Object.entries(appConfig_1.appConfig.features).forEach(([feature, enabled]) => {
            const status = enabled ? '✅ Увімкнено' : '❌ Вимкнено';
            console.log(`  ${feature.padEnd(25)} - ${status}`);
        });
    }
    showEnvironment() {
        console.log('\n🌍 Змінні середовища:');
        console.log('='.repeat(50));
        const envVars = [
            'NODE_ENV', 'PORT', 'PRIMARY_LANGUAGE', 'LOG_LEVEL',
            'ENABLE_NLP', 'ENABLE_CONTENT_MODERATION', 'ENABLE_ATMOSPHERE',
            'ENABLE_MEMES', 'ENABLE_USER_MEMORY', 'ENABLE_PROFANITY_FILTER'
        ];
        envVars.forEach(varName => {
            const value = process.env[varName] || 'не встановлено';
            console.log(`  ${varName.padEnd(30)} = ${value}`);
        });
    }
    checkHealth() {
        console.log('\n🏥 Перевірка здоров\'я системи:');
        console.log('='.repeat(50));
        // Перевірка пам'яті
        const memUsage = process.memoryUsage();
        console.log('💾 Використання пам\'яті:');
        console.log(`  RSS: ${Math.round(memUsage.rss / 1024 / 1024)} MB`);
        console.log(`  Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`);
        console.log(`  Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`);
        // Перевірка часу роботи
        console.log('\n⏰ Час роботи процесу:');
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        console.log(`  ${hours}год ${minutes}хв ${seconds}с`);
        // Перевірка конфігурації
        console.log('\n⚙️ Стан конфігурації:');
        const { validateConfig } = require('../config/appConfig');
        const validation = validateConfig();
        console.log(`  Валідність: ${validation.valid ? '✅ OK' : '❌ Помилки'}`);
        // Перевірка message handler
        console.log('\n🤖 Message Handler:');
        console.log(`  Стан: ${this.messageHandler ? '✅ Ініціалізовано' : '❌ Не ініціалізовано'}`);
    }
    showMemoryStats() {
        console.log('\n🧠 Статистика пам\'яті користувачів:');
        console.log('='.repeat(50));
        if (!this.messageHandler) {
            console.log('❌ Message handler не ініціалізовано');
            return;
        }
        try {
            // Тут буде статистика з UserMemory, коли буде виправлено
            console.log('📊 Статистика пам\'яті буде доступна після виправлення тестів');
        }
        catch (error) {
            console.error('❌ Помилка отримання статистики пам\'яті:', error);
        }
    }
    testProfanityFilter() {
        console.log('\n🚫 Тестування фільтра нецензурщини:');
        console.log('='.repeat(50));
        const testPhrases = [
            'Привіт, як справи?',
            'Ти дурак',
            'Іди в біс!',
            'Класний день сьогодні',
            'What a beautiful day',
            'You are stupid'
        ];
        try {
            const { ProfanityFilter } = require('../domain/profanityFilter');
            const filter = new ProfanityFilter();
            testPhrases.forEach(phrase => {
                const analysis = filter.analyzeMessage(phrase);
                const status = analysis.hasProfanity ? '🚫 ПРОФАНАЦІЯ' : '✅ ЧИСТО';
                console.log(`  "${phrase}" - ${status}`);
                if (analysis.hasProfanity) {
                    console.log(`    Мова: ${analysis.language}, Рівень: ${analysis.severityLevel}`);
                }
            });
        }
        catch (error) {
            console.error('❌ Помилка тестування фільтра:', error);
        }
    }
    testFuzzyMatching() {
        console.log('\n🔍 Тестування fuzzy matching:');
        console.log('='.repeat(50));
        const testQueries = [
            'що ти можеш',
            'шо можеш',
            'новини',
            'погода в києві',
            'підписатися',
            'what can you do'
        ];
        try {
            // Тестуємо capability matcher
            console.log('🤖 Capability Fuzzy Matcher:');
            const { CapabilityFuzzyMatcher } = require('../config/vocabulary/capabilityFuzzyMatcher');
            const capabilityMatcher = new CapabilityFuzzyMatcher();
            testQueries.forEach(query => {
                const result = capabilityMatcher.detectCapabilityRequest(query);
                console.log(`  "${query}" - ${result.isCapabilityRequest ? '✅ РОЗПІЗНАНО' : '❌ НЕ РОЗПІЗНАНО'} (${result.confidence})`);
            });
            // Тестуємо news commands matcher
            console.log('\n📰 News Commands Fuzzy Matcher:');
            const { NewsCommandsFuzzyMatcher } = require('../config/vocabulary/newsCommandsFuzzyMatcher');
            const newsMatcher = new NewsCommandsFuzzyMatcher();
            testQueries.forEach(query => {
                const result = newsMatcher.recognizeCommand(query);
                if (result) {
                    console.log(`  "${query}" - ✅ ${result.type.toUpperCase()} (${result.confidence})`);
                }
                else {
                    console.log(`  "${query}" - ❌ НЕ РОЗПІЗНАНО`);
                }
            });
        }
        catch (error) {
            console.error('❌ Помилка тестування fuzzy matching:', error);
        }
    }
    exit() {
        console.log('\n👋 Вихід з CLI режиму...');
        process.exit(0);
    }
}
exports.CLIHandler = CLIHandler;
// Експорт для використання
function startCLI() {
    const cli = new CLIHandler();
    return cli.start();
}
