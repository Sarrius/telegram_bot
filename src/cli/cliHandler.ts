// CLI Handler для командного режиму
import { appConfig, getSafeConfig } from '../config/appConfig';
import { EnhancedMessageHandler } from '../usecases/enhancedMessageHandler';
import { FeatureManager } from '../config/featureManager';
import { featureMapper } from '../config/featureMapping';

export interface CLICommand {
  name: string;
  description: string;
  execute: () => Promise<void> | void;
}

export class CLIHandler {
  private commands: Map<string, CLICommand> = new Map();
  private messageHandler?: EnhancedMessageHandler;
  private featureManager: FeatureManager;

  constructor() {
    this.featureManager = FeatureManager.getInstance();
    this.initializeCommands();
  }

  private initializeCommands(): void {
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
    this.registerCommand('knowledge', 'Тестувати knowledge search', this.testKnowledgeSearch.bind(this));
    this.registerCommand('cli-commands', 'Тестувати CLI команди в Telegram', this.testCLICommands.bind(this));
    this.registerCommand('feature-mapping', 'Тестувати feature mapping', this.testFeatureMapping.bind(this));
    this.registerCommand('powerwords', 'Тестувати детектор потужних слів', this.testPowerWordsDetector.bind(this));
    this.registerCommand('chat', 'Почати інтерактивний чат із ботом', this.startInteractiveChat.bind(this));
    this.registerCommand('currency', 'Тестувати курси валют', this.testCurrencyService.bind(this));
    this.registerCommand('usd', 'Показати курс долара', this.showUSDRate.bind(this));
    this.registerCommand('eur', 'Показати курс євро', this.showEURRate.bind(this));
    
    // Команди управління функціями
    this.registerCommand('enable', 'Увімкнути функцію (enable <назва>)', this.enableFeature.bind(this));
    this.registerCommand('disable', 'Вимкнути функцію (disable <назва>)', this.disableFeature.bind(this));
    this.registerCommand('toggle', 'Перемкнути функцію (toggle <назва>)', this.toggleFeature.bind(this));
    this.registerCommand('status', 'Показати статус всіх функцій', this.showFeatureStatus.bind(this));
    this.registerCommand('enable-all', 'Увімкнути всі функції', this.enableAllFeatures.bind(this));
    this.registerCommand('disable-all', 'Вимкнути всі функції', this.disableAllFeatures.bind(this));
    this.registerCommand('reset-features', 'Скинути функції до стандартних', this.resetFeatures.bind(this));
    this.registerCommand('feature-help', 'Довідка по функціях', this.showFeatureHelp.bind(this));
    this.registerCommand('exit', 'Вийти з CLI режиму', this.exit.bind(this));
  }

  private registerCommand(name: string, description: string, handler: () => Promise<void> | void): void {
    this.commands.set(name, { name, description, execute: handler });
  }

  public async start(): Promise<void> {
    console.log('🚀 CLI режим активовано');
    console.log('💡 Введіть "help" для списку команд');
    
    // Ініціалізуємо message handler для тестів
    try {
      this.messageHandler = new EnhancedMessageHandler();
      console.log('✅ Message handler ініціалізовано');
    } catch (error) {
      console.error('❌ Помилка ініціалізації message handler:', error);
    }

    // Обробляємо CLI аргументи
    await this.processArguments();

    if (!this.shouldExitAfterArguments()) {
      await this.startInteractiveMode();
    }
  }

  private async processArguments(): Promise<void> {
    const args = process.argv.slice(2);
    
    for (const arg of args) {
      if (arg === '--stats') {
        await this.showStats();
      } else if (arg === '--config') {
        await this.showConfig();
      } else if (arg === '--test-mode') {
        await this.runTests();
      } else if (arg === '--health') {
        await this.checkHealth();
      } else if (arg === '--validate') {
        await this.validateConfig();
      } else if (arg === '--features') {
        await this.showFeatures();
      }
    }
  }

  private shouldExitAfterArguments(): boolean {
    const args = process.argv.slice(2);
    return args.some(arg => ['--stats', '--config', '--health', '--validate', '--features'].includes(arg));
  }

  private async startInteractiveMode(): Promise<void> {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '🤖 telegram-bot> '
    });

    rl.prompt();

    rl.on('line', async (input: string) => {
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

  private async executeCommand(input: string): Promise<void> {
    const [commandName, ...args] = input.split(' ');
    
    // Спеціальна обробка команд з аргументами
    if (commandName === 'enable' || commandName === 'disable' || commandName === 'toggle') {
      await this.handleFeatureCommand(commandName, args);
      return;
    }

    const command = this.commands.get(commandName);

    if (!command) {
      console.log(`❌ Невідома команда: ${commandName}`);
      console.log('💡 Введіть "help" для списку доступних команд');
      return;
    }

    try {
      await command.execute();
    } catch (error) {
      console.error(`❌ Помилка виконання команди ${commandName}:`, error);
    }
  }

  private async handleFeatureCommand(command: string, args: string[]): Promise<void> {
    if (args.length === 0) {
      console.log(`❌ Використання: ${command} <назва_функції>`);
      console.log('💡 Введіть "feature-help" для списку доступних функцій');
      console.log('💡 Можна використовувати як коротку назву (nlp), так і повну (nlpConversations)');
      return;
    }

    const inputFeature = args[0];
    
    // Знаходимо правильну назву функції через mapper
    const mappedFeature = featureMapper.findFeatureByAlias(inputFeature);
    
    if (!mappedFeature) {
      const availableFeatures = featureMapper.getAllFeatureManagerNames();
      console.log(`❌ Невідома функція: "${inputFeature}"`);
      console.log('\n🎛️ Доступні функції:');
      availableFeatures.forEach(feature => {
        const info = featureMapper.getFeatureInfo(feature);
        if (info) {
          console.log(`  ${info.emoji} ${feature} - ${info.description}`);
        }
      });
      console.log('\n💡 Спробуйте: feature-help - для детального списку');
      return;
    }

    let result: string;

    switch (command) {
      case 'enable':
        result = this.featureManager.enableFeature(mappedFeature as any);
        break;
      case 'disable':
        result = this.featureManager.disableFeature(mappedFeature as any);
        break;
      case 'toggle':
        result = this.featureManager.toggleFeature(mappedFeature as any);
        break;
      default:
        console.log(`❌ Невідома команда: ${command}`);
        return;
    }

    console.log(result);
    
    // Додаємо інформацію про мапінг
    const featureInfo = featureMapper.getFeatureInfo(mappedFeature);
    if (featureInfo && inputFeature !== mappedFeature) {
      console.log(`💡 "${inputFeature}" → "${mappedFeature}" (${featureInfo.description})`);
    }
  }

  // Реалізація команд
  private showHelp(): void {
    console.log('\n📋 Доступні команди:');
    console.log('='.repeat(80));
    
    // Отримуємо статус функцій
    const features = this.featureManager.getAllFeatures();
    const featureEntries = Object.entries(features);
    let featureIndex = 0;
    
    const commands = Array.from(this.commands.values());
    const maxLines = Math.max(commands.length, featureEntries.length);
    
    for (let i = 0; i < maxLines; i++) {
      let line = '';
      
      // Ліва сторона - команди
      if (i < commands.length) {
        const command = commands[i];
        line += `  ${command.name.padEnd(15)} - ${command.description.padEnd(40)}`;
      } else {
        line += ' '.repeat(58);
      }
      
      // Права сторона - статус функцій
      if (i < featureEntries.length) {
        const [name, enabled] = featureEntries[i];
        const emoji = enabled ? '✅' : '🔴';
        const status = enabled ? 'ON ' : 'OFF';
        line += ` │ ${emoji} ${name.padEnd(12)} ${status}`;
      }
      
      console.log(line);
    }
    
    console.log('='.repeat(80));
    console.log('\n🎛️  Управління функціями:');
    console.log('  enable <функція>    - увімкнути функцію');
    console.log('  disable <функція>   - вимкнути функцію'); 
    console.log('  toggle <функція>    - перемкнути функцію');
    console.log('  status              - показати статус всіх функцій');
    console.log('  feature-help        - довідка по функціях');
    
    console.log('\n💡 Приклади використання:');
    console.log('  npm run dev -- --cli --stats     # Запустити з показом статистики');
    console.log('  npm run dev -- --cli --config    # Запустити з показом конфігурації'); 
    console.log('  npm run dev -- --cli --test-mode # Запустити в тестовому режимі');
    console.log('  enable powerWords                # Увімкнути реакції на потужні слова');
    console.log('  disable moderation               # Вимкнути модерацію');
    console.log('  chat                             # Запустити інтерактивний чат');
  }

  private showConfig(): void {
    console.log('\n⚙️ Поточна конфігурація:');
    console.log('='.repeat(50));
    
    const safeConfig = getSafeConfig();
    console.log(JSON.stringify(safeConfig, null, 2));
  }

  private async showStats(): Promise<void> {
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

    } catch (error) {
      console.error('❌ Помилка отримання статистики:', error);
    }
  }

  private async runTests(): Promise<void> {
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
        chatType: 'group' as const,
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
    } catch (error) {
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
        chatType: 'group' as const,
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
    } catch (error) {
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
        chatType: 'group' as const,
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
    } catch (error) {
      console.log(`  ❌ Помилка: ${error}`);
    }

    console.log('\n✅ Тестування завершено!');
  }

  private validateConfig(): void {
    console.log('\n✅ Валідація конфігурації:');
    console.log('='.repeat(50));

    const { validateConfig } = require('../config/appConfig');
    const validation = validateConfig();

    if (validation.valid) {
      console.log('✅ Конфігурація валідна!');
    } else {
      console.log('❌ Знайдено помилки:');
      validation.errors.forEach((error: string) => {
        console.log(`  - ${error}`);
      });
    }
  }

  private showFeatures(): void {
    console.log('\n🎛️ Статус функцій:');
    console.log('='.repeat(50));

    Object.entries(appConfig.features).forEach(([feature, enabled]) => {
      const status = enabled ? '✅ Увімкнено' : '❌ Вимкнено';
      console.log(`  ${feature.padEnd(25)} - ${status}`);
    });
  }

  private showEnvironment(): void {
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

  private checkHealth(): void {
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

  private showMemoryStats(): void {
    console.log('\n🧠 Статистика пам\'яті користувачів:');
    console.log('='.repeat(50));

    if (!this.messageHandler) {
      console.log('❌ Message handler не ініціалізовано');
      return;
    }

    try {
      // Тут буде статистика з UserMemory, коли буде виправлено
      console.log('📊 Статистика пам\'яті буде доступна після виправлення тестів');
    } catch (error) {
      console.error('❌ Помилка отримання статистики пам\'яті:', error);
    }
  }

  private testProfanityFilter(): void {
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
    } catch (error) {
      console.error('❌ Помилка тестування фільтра:', error);
    }
  }

  private testFuzzyMatching(): void {
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
        } else {
          console.log(`  "${query}" - ❌ НЕ РОЗПІЗНАНО`);
        }
      });

    } catch (error) {
      console.error('❌ Помилка тестування fuzzy matching:', error);
    }
  }

  private testPowerWordsDetector(): void {
    console.log('\n⚡ Тестування детектора потужних слів:');
    console.log('='.repeat(50));

    const testPhrases = [
      'Потужно працюю сьогодні!',
      'Супер результат, дуже круто',
      'Могутній успіх в проекті',
      'Офігенний день сьогодні',
      'Топ робота, класний результат',
      'Мега крутий алгоритм',
      'Звичайний день на роботі',
      'Привіт, як справи?',
      'бомбезний фідбек від клієнта',
      'неймовірний прогрес в розвитку'
    ];

    try {
      const { PotuzhnoPowerWordsDetector } = require('../domain/potuzhnoPowerWordsDetector');
      const detector = new PotuzhnoPowerWordsDetector();

      testPhrases.forEach(phrase => {
        const matches = detector.detectPowerWords(phrase);
        const bestMatch = detector.getBestPowerWordMatch(phrase);
        
        if (bestMatch) {
          const emoji = detector.getReactionEmoji(bestMatch);
          const motivation = detector.getMotivationalResponse(bestMatch);
          console.log(`  ⚡ "${phrase}"`);
          console.log(`    Знайдено: "${bestMatch.originalWord}" → "${bestMatch.matchedWord}"`);
          console.log(`    Впевненість: ${(bestMatch.confidence * 100).toFixed(1)}%`);
          console.log(`    Категорія: ${bestMatch.category}, Інтенсивність: ${bestMatch.intensity}`);
          console.log(`    Реакція: ${emoji}`);
          console.log(`    Мотивація: ${motivation}`);
        } else {
          console.log(`  ❌ "${phrase}" - не виявлено потужних слів`);
        }
        console.log('');
      });
    } catch (error) {
      console.error('❌ Помилка тестування детектора потужних слів:', error);
    }
  }

  private async testKnowledgeSearch(): Promise<void> {
    console.log('\n🔍 Тестування Knowledge Search:');
    console.log('='.repeat(50));

    try {
      const { KnowledgeSearchHandler } = require('../usecases/knowledgeSearchHandler');
      const searchHandler = new KnowledgeSearchHandler();

      const testQueries = [
        // Математичні запити
        'Скільки буде 2 + 2?',
        'What is 15 * 7?',
        'Обчисли 100 - 37',
        'Calculate 25 / 5',
        
        // Фактичні питання (українські)
        'Хто такий Дональд Трамп?',
        'Що таке штучний інтелект?',
        'Коли закінчилася Друга світова війна?',
        'Де знаходиться Ейфелева вежа?',
        
        // Фактичні питання (англійські) 
        'Who is Elon Musk?',
        'What is cryptocurrency?',
        'When did Ukraine become independent?',
        'Where is the Statue of Liberty?',
        
        // Звичайні повідомлення (не повинні спрацювати)
        'Привіт, як справи?',
        'Доброго ранку!',
        'Hello everyone'
      ];

      for (let i = 0; i < testQueries.length; i++) {
        const query = testQueries[i];
        console.log(`\n${i + 1}. Запит: "${query}"`);
        
        try {
          const result = await searchHandler.testSearch(query);
          
          if (result.confidence > 0) {
            console.log(`  ✅ Знайдено відповідь (впевненість: ${Math.round(result.confidence * 100)}%)`);
            console.log(`  🔍 Відповідь: ${result.result.substring(0, 100)}${result.result.length > 100 ? '...' : ''}`);
            console.log(`  💭 Пояснення: ${result.reasoning}`);
          } else {
            console.log(`  ❌ Відповідь не знайдена`);
            console.log(`  💭 Причина: ${result.reasoning}`);
          }
        } catch (error) {
          console.log(`  ❌ Помилка: ${error}`);
        }
        
        // Невелика затримка між запитами
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Показуємо статистику
      console.log('\n📊 Статистика Knowledge Search:');
      const stats = searchHandler.getStats();
      console.log(`  - Підтримка української: ${stats.supportedQuestionTypes.ukrainian} типів`);
      console.log(`  - Підтримка англійської: ${stats.supportedQuestionTypes.english} типів`);
      console.log(`  - Математичні шаблони: ${stats.mathPatterns}`);
      console.log('  - Можливості:');
      stats.capabilities.forEach((capability: string) => {
        console.log(`    • ${capability}`);
      });

    } catch (error) {
      console.error('❌ Помилка тестування Knowledge Search:', error);
    }
  }

  private testCLICommands(): void {
    console.log('\n🎛️ Тестування CLI команд у Telegram:');
    console.log('='.repeat(50));

    try {
      const { CLICommandHandler } = require('../usecases/cliCommandHandler');
      const cliHandler = new CLICommandHandler();

      const testCommands = [
        // Help команди
        'help',
        '/help',
        'команди',
        'допомога',
        'довідка',
        'показати команди',
        '@bot help',
        '@bot cli help',
        'бот допомога',
        
        // Status команди
        'status',
        '/status',
        'статус',
        'показати статус',
        '@bot status',
        
        // Feature управління
        'увімкни powerWords',
        'вимкни moderation',
        'перемкни memes',
        'enable knowledgeSearch',
        'disable nlp',
        'toggle weather',
        '@bot enable news',
        '@bot вимкни atmosphere',
        
        // Features показ
        'features',
        'функції',
        'показати функції',
        '@bot features',
        
        // Звичайні повідомлення (не повинні спрацювати)
        'Привіт, як справи?',
        'Hello everyone',
        'Що нового?',
        'Good morning'
      ];

      testCommands.forEach((command, index) => {
        console.log(`\n${index + 1}. Команда: "${command}"`);
        
        try {
          const result = cliHandler.testCommand(command);
          
          if (result.detected) {
            console.log(`  ✅ Розпізнано (впевненість: ${Math.round(result.confidence * 100)}%)`);
            console.log(`  🎛️ Тип: CLI команда`);
            console.log(`  📋 Відповідь: ${result.response}`);
            console.log(`  💭 Пояснення: ${result.reasoning}`);
          } else {
            console.log(`  ❌ Не розпізнано як CLI команда`);
            console.log(`  💭 Причина: ${result.reasoning}`);
          }
        } catch (error) {
          console.log(`  ❌ Помилка: ${error}`);
        }
      });

      // Показуємо статистику
      console.log('\n📊 Статистика CLI Commands:');
      const stats = cliHandler.getStats();
      console.log(`  - Help patterns: ${stats.helpPatterns}`);
      console.log(`  - Status patterns: ${stats.statusPatterns}`);
      console.log(`  - Feature patterns: ${stats.featurePatterns}`);
      console.log(`  - Підтримувані команди: ${stats.supportedCommands.join(', ')}`);
      console.log(`  - Мови: ${stats.languages.join(', ')}`);
      console.log('  - Можливості:');
      stats.capabilities.forEach((capability: string) => {
        console.log(`    • ${capability}`);
      });

    } catch (error) {
      console.error('❌ Помилка тестування CLI Commands:', error);
    }
  }

  private testFeatureMapping(): void {
    console.log('\n🔀 Тестування Feature Mapping:');
    console.log('='.repeat(50));

    try {
      const testInputs = [
        // AppConfig назви
        'nlpConversations',
        'contentModeration',
        'atmosphereEnhancement',
        'memeGeneration',
        'sentimentReactions',
        'userMemory',
        'profanityFilter',
        'newsWeatherMonitoring',
        'learningSystem',
        
        // FeatureManager назви
        'nlp',
        'moderation',
        'atmosphere',
        'memes',
        'powerWords',
        'memory',
        'news',
        'weather',
        'knowledgeSearch',
        
        // Аліаси
        'conversations',
        'chat',
        'модерація',
        'content',
        'атмосфера',
        'меми',
        'пам\'ять',
        'нецензурщина',
        'новини',
        'погода',
        'пошук',
        'знання',
        
        // Невідомі
        'unknownFeature',
        'тест',
        'hello'
      ];

      testInputs.forEach((input, index) => {
        console.log(`\n${index + 1}. Вхід: "${input}"`);
        
        const mapped = featureMapper.findFeatureByAlias(input);
        if (mapped) {
          const info = featureMapper.getFeatureInfo(mapped);
          console.log(`  ✅ Знайдено: ${mapped}`);
          if (info) {
            console.log(`  ${info.emoji} ${info.description}`);
            if (info.appConfigName) {
              console.log(`  📋 AppConfig: ${info.appConfigName}`);
            }
          }
        } else {
          console.log(`  ❌ Не знайдено`);
        }
      });

      // Статистика
      console.log('\n📊 Статистика Feature Mapper:');
      const stats = featureMapper.getStats();
      console.log(`  - Всього мапінгів: ${stats.totalMappings}`);
      console.log(`  - Тільки FeatureManager: ${stats.featureManagerOnly}`);
      console.log(`  - Загалом функцій: ${stats.totalFeatures}`);
      console.log(`  - Доступні аліаси: ${stats.availableAliases.join(', ')}`);

    } catch (error) {
      console.error('❌ Помилка тестування Feature Mapping:', error);
    }
  }

  private async testCurrencyService(): Promise<void> {
    console.log('\n💱 Тестування сервісу курсів валют:');
    console.log('='.repeat(50));

    try {
      const { CurrencyExchangeService } = require('../domain/currencyExchangeService');
      const currencyService = new CurrencyExchangeService();

      // Тест 1: Отримання курсу долара
      console.log('🔄 Тест 1: Отримання курсу USD...');
      const usdRate = await currencyService.getCurrencyRate('USD');
      if (usdRate) {
        console.log(`  ✅ USD: ${usdRate.rate.toFixed(4)} ₴ (${usdRate.date})`);
      } else {
        console.log('  ❌ Не вдалося отримати курс USD');
      }

      // Тест 2: Отримання курсу євро
      console.log('\n🔄 Тест 2: Отримання курсу EUR...');
      const eurRate = await currencyService.getCurrencyRate('EUR');
      if (eurRate) {
        console.log(`  ✅ EUR: ${eurRate.rate.toFixed(4)} ₴ (${eurRate.date})`);
      } else {
        console.log('  ❌ Не вдалося отримати курс EUR');
      }

      // Тест 3: Конвертація
      console.log('\n🔄 Тест 3: Конвертація 100 USD в UAH...');
      const conversion = await currencyService.convertCurrency(100, 'USD');
      if (conversion) {
        console.log(`  ✅ 100 USD = ${conversion.result.toFixed(2)} ₴`);
      } else {
        console.log('  ❌ Не вдалося конвертувати валюту');
      }

      // Тест 4: Популярні курси
      console.log('\n🔄 Тест 4: Популярні курси...');
      const popularRates = await currencyService.getPopularCurrencies();
      if (popularRates.length > 0) {
        console.log('  ✅ Популярні курси:');
        popularRates.forEach((rate: any) => {
          console.log(`    ${rate.code}: ${rate.rate.toFixed(4)} ₴`);
        });
      } else {
        console.log('  ❌ Не вдалося отримати популярні курси');
      }

    } catch (error) {
      console.error('❌ Помилка тестування валютного сервісу:', error);
    }
  }

  private async showUSDRate(): Promise<void> {
    console.log('\n💵 Курс долара США:');
    console.log('='.repeat(30));

    try {
      const { CurrencyExchangeService } = require('../domain/currencyExchangeService');
      const currencyService = new CurrencyExchangeService();
      
      const usdRate = await currencyService.getCurrencyRate('USD');
      if (usdRate) {
        console.log(`💱 1 USD = ${usdRate.rate.toFixed(4)} ₴`);
        console.log(`📅 Дата: ${usdRate.date}`);
        console.log(`🏦 Офіційний курс НБУ`);
      } else {
        console.log('❌ Не вдалося отримати курс долара');
      }
    } catch (error) {
      console.error('❌ Помилка отримання курсу:', error);
    }
  }

  private async showEURRate(): Promise<void> {
    console.log('\n💶 Курс євро:');
    console.log('='.repeat(30));

    try {
      const { CurrencyExchangeService } = require('../domain/currencyExchangeService');
      const currencyService = new CurrencyExchangeService();
      
      const eurRate = await currencyService.getCurrencyRate('EUR');
      if (eurRate) {
        console.log(`💱 1 EUR = ${eurRate.rate.toFixed(4)} ₴`);
        console.log(`📅 Дата: ${eurRate.date}`);
        console.log(`🏦 Офіційний курс НБУ`);
      } else {
        console.log('❌ Не вдалося отримати курс євро');
      }
    } catch (error) {
      console.error('❌ Помилка отримання курсу:', error);
    }
  }

  private exit(): void {
    console.log('\n👋 До побачення!');
    process.exit(0);
  }

  // Методи управління функціями
  private enableFeature(): void {
    console.log('💡 Використання: enable <назва_функції>');
    console.log('💡 Введіть "feature-help" для списку доступних функцій');
  }

  private disableFeature(): void {
    console.log('💡 Використання: disable <назва_функції>');
    console.log('💡 Введіть "feature-help" для списку доступних функцій');
  }

  private toggleFeature(): void {
    console.log('💡 Використання: toggle <назва_функції>');
    console.log('💡 Введіть "feature-help" для списку доступних функцій');
  }

  private showFeatureStatus(): void {
    console.log(this.featureManager.getFeatureStatus());
  }

  private enableAllFeatures(): void {
    const result = this.featureManager.enableAll();
    console.log(result);
  }

  private disableAllFeatures(): void {
    const result = this.featureManager.disableAll();
    console.log(result);
  }

  private resetFeatures(): void {
    const result = this.featureManager.resetToDefaults();
    console.log(result);
  }

  private showFeatureHelp(): void {
    console.log(this.featureManager.getFeatureHelp());
    console.log('\n' + featureMapper.getFormattedFeaturesList());
  }

  private async startInteractiveChat(): Promise<void> {
    console.log('\n💬 Інтерактивний чат із ботом');
    console.log('='.repeat(50));
    console.log('🎯 Емуляція групового чату - пишіть як у Telegram!');
    console.log('💡 Спеціальні команди:');
    console.log('  /quit або /exit  - вийти з чату');
    console.log('  /stats          - показати статистику');
    console.log('  /reset          - скинути контекст');
    console.log('  @bot [текст]    - пряме звернення до бота');
    console.log('📝 Починайте писати свої повідомлення:\n');

    if (!this.messageHandler) {
      console.log('❌ Message handler не ініціалізовано');
      return;
    }

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '👤 Ви: '
    });

    let messageId = 1;
    const chatId = 'test_group_chat';
    const userId = 'test_user_123';
    const userName = 'TestUser';

    rl.prompt();

    rl.on('line', async (input: string) => {
      const message = input.trim();
      
      if (!message) {
        rl.prompt();
        return;
      }

      // Спеціальні команди
      if (message === '/quit' || message === '/exit') {
        console.log('👋 Вихід з чату...');
        rl.close();
        return;
      }

      if (message === '/stats') {
        await this.showQuickStats();
        rl.prompt();
        return;
      }

      if (message === '/reset') {
        console.log('🔄 Контекст чату скинуто');
        rl.prompt();
        return;
      }

      // Обробляємо повідомлення ботом
      try {
        console.log(`\n📩 [${new Date().toLocaleTimeString()}] Обробка повідомлення...`);
        
        const context = {
          text: message,
          userId: userId,
          chatId: chatId,
          userName: userName,
          chatType: 'group' as const,
          isGroupChat: true,
          messageId: messageId++,
          isReplyToBot: false,
          mentionsBot: message.toLowerCase().includes('@bot'),
          isDirectMention: message.toLowerCase().includes('@bot'),
          requestsMeme: message.toLowerCase().includes('мем') || message.toLowerCase().includes('meme'),
          memeRequest: (message.toLowerCase().includes('мем') || message.toLowerCase().includes('meme')) ? message : undefined
        };

                  const response = await this.messageHandler?.handleMessage(context);

          if (!response) {
            console.log('❌ Не отримано відповідь від бота');
            console.log(''); // порожній рядок для відступу
            rl.prompt();
            return;
          }

        if (response.shouldReply || response.shouldReact) {
          if (response.shouldReact && response.reaction) {
            console.log(`🤖 Бот реагує: ${response.reaction}`);
          }
          
          if (response.shouldReply && response.reply) {
            console.log(`🤖 Бот [${response.responseType}]: ${response.reply}`);
          }
          
          if (response.confidence !== undefined) {
            console.log(`   Впевненість: ${(response.confidence * 100).toFixed(1)}%`);
          }

          if (response.memoryResponse) {
            console.log(`   💭 Пам'ять: ${response.memoryResponse.message}`);
          }

          if (response.inappropriateContentWarning) {
            console.log(`   ⚠️ Модерація: ${response.inappropriateContentWarning}`);
          }
          
          if (response.powerWordReaction) {
            console.log(`   ⚡ Потужне слово: ${response.powerWordReaction.emoji}`);
          }
          
          if (response.memeResponse) {
            console.log(`   🎭 Мем: ${response.memeResponse.type} - ${response.memeResponse.content}`);
          }
        } else {
          console.log('🤖 [мовчить - не реагує на це повідомлення]');
          if (response.reasoning) {
            console.log(`   Причина: ${response.reasoning}`);
          }
        }

      } catch (error) {
        console.error('❌ Помилка обробки повідомлення:', error);
      }

      console.log(''); // порожній рядок для відступу
      rl.prompt();
    });

    rl.on('close', () => {
      console.log('\n👋 Чат завершено!');
    });
  }

  private async showQuickStats(): Promise<void> {
    if (!this.messageHandler) return;
    
    try {
      const stats = this.messageHandler.getEnhancedStats();
      console.log('\n📊 Швидка статистика:');
      console.log(`   💬 NLP взаємодії: ${stats.nlp.totalInteractions}`);
      console.log(`   🇺🇦 Українські користувачі: ${stats.nlp.ukrainianUsers}`);
      console.log(`   🇬🇧 Англійські користувачі: ${stats.nlp.englishUsers}`);
      console.log(`   🎭 Меми доступно: ${stats.memes.availableTemplates}`);
    } catch (error) {
      console.log('❌ Помилка отримання статистики');
    }
  }
}

// Експорт для використання
export function startCLI(): Promise<void> {
  const cli = new CLIHandler();
  return cli.start();
} 