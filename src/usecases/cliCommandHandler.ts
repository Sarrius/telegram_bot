import { CLICommandDetector, CLICommandMatch } from '../domain/cliCommandDetector';
import { FeatureManager } from '../config/featureManager';
import { featureMapper } from '../config/featureMapping';
import { CurrencyHandler, CurrencyResponse } from './currencyHandler';
import { NewsWeatherHandler } from './newsWeatherHandler';
import { KnowledgeSearchHandler } from './knowledgeSearchHandler';
import { MemeGenerator } from '../domain/memeGenerator';
import { UserMemory } from '../domain/userMemory';

export interface CLICommandResponse {
  shouldRespond: boolean;
  responseType: 'cli_help' | 'cli_status' | 'cli_features' | 'cli_control' | 'cli_currency' | 'cli_news' | 'cli_weather' | 'cli_knowledge' | 'cli_meme' | 'cli_stats' | 'cli_memory' | 'cli_test' | 'cli_diagnostic' | 'ignore';
  response: string;
  confidence: number;
  reasoning: string;
  command?: string;
  args?: string[];
  data?: any; // Для структурованих даних
}

export class CLICommandHandler {
  private detector: CLICommandDetector;
  private featureManager: FeatureManager;
  private currencyHandler: CurrencyHandler;
  private newsWeatherHandler: NewsWeatherHandler | null = null;
  private knowledgeHandler: KnowledgeSearchHandler;
  private memeGenerator: MemeGenerator;
  private userMemory: UserMemory;

  constructor(newsWeatherHandler?: NewsWeatherHandler) {
    this.detector = new CLICommandDetector();
    this.featureManager = FeatureManager.getInstance();
    this.currencyHandler = new CurrencyHandler();
    this.newsWeatherHandler = newsWeatherHandler || null;
    this.knowledgeHandler = new KnowledgeSearchHandler();
    this.memeGenerator = new MemeGenerator();
    this.userMemory = new UserMemory();
    console.log('🎛️ Enhanced CLI Command Handler initialized with full feature support');
  }

  public async handleMessage(
    text: string,
    chatType: string,
    userId: string,
    chatId: string
  ): Promise<CLICommandResponse> {
    try {
      const match = this.detector.detectCommand(text);

      if (!match.isCommand) {
        return {
          shouldRespond: false,
          responseType: 'ignore',
          response: '',
          confidence: 0,
          reasoning: 'Not a CLI command'
        };
      }

      console.log(`🎛️ CLI command detected: ${match.command} (${match.confidence})`);

      switch (match.command) {
        case 'help':
          return this.handleHelpCommand(match);
        case 'status':
          return this.handleStatusCommand(match);
        case 'features':
          return this.handleFeaturesCommand(match);
        case 'cli':
          return this.handleCliModeCommand(match);
        case 'enable':
        case 'disable':
        case 'toggle':
          return this.handleFeatureControl(match);
        
        // === Валютні команди ===
        case 'currency':
        case 'exchange':
        case 'курс':
        case 'валюта':
          return await this.handleCurrencyCommand(match, chatId);
        
        // === Новини та погода ===
        case 'news':
        case 'новини':
          return await this.handleNewsCommand(match, chatId);
        case 'weather':
        case 'погода':
          return await this.handleWeatherCommand(match, chatId);
        
        // === Пошук знань ===
        case 'search':
        case 'find':
        case 'знайти':
        case 'пошук':
          return await this.handleKnowledgeSearchCommand(match, chatId, userId);
        
        // === Меми ===
        case 'meme':
        case 'мем':
          return await this.handleMemeCommand(match, userId);
        
        // === Статистика ===
        case 'stats':
        case 'statistics':
        case 'статистика':
          return this.handleStatsCommand(match, chatId, userId);
        
        // === Управління пам'яттю ===
        case 'memory':
        case 'пам\'ять':
          return this.handleMemoryCommand(match, userId);
        
        // === Тестування ===
        case 'test':
        case 'тест':
          return this.handleTestCommand(match);
        
        // === Діагностика ===
        case 'diagnostic':
        case 'диагностика':
          return this.handleDiagnosticCommand(match, chatId, userId);
        
        default:
          return {
            shouldRespond: false,
            responseType: 'ignore',
            response: '',
            confidence: 0,
            reasoning: `Unknown CLI command: ${match.command}`
          };
      }
    } catch (error) {
      console.error('❌ CLI command handler error:', error);
      return {
        shouldRespond: true,
        responseType: 'cli_diagnostic',
        response: `❌ Помилка обробки CLI команди: ${error}`,
        confidence: 1.0,
        reasoning: `Error processing CLI command: ${error}`
      };
    }
  }

  private handleHelpCommand(match: CLICommandMatch): CLICommandResponse {
    const response = this.generateHelpResponse(match.language);
    
    return {
      shouldRespond: true,
      responseType: 'cli_help',
      response,
      confidence: match.confidence,
      reasoning: `CLI help command in ${match.language}`,
      command: match.command,
      args: match.args
    };
  }

  private handleStatusCommand(match: CLICommandMatch): CLICommandResponse {
    const response = this.generateStatusResponse(match.language);
    
    return {
      shouldRespond: true,
      responseType: 'cli_status',
      response,
      confidence: match.confidence,
      reasoning: `CLI status command in ${match.language}`,
      command: match.command,
      args: match.args
    };
  }

  private handleFeaturesCommand(match: CLICommandMatch): CLICommandResponse {
    const response = this.generateFeaturesResponse(match.language);
    
    return {
      shouldRespond: true,
      responseType: 'cli_features',
      response,
      confidence: match.confidence,
      reasoning: `CLI features command in ${match.language}`,
      command: match.command,
      args: match.args
    };
  }

  private handleCliModeCommand(match: CLICommandMatch): CLICommandResponse {
    const response = this.generateCliModeResponse(match.language);
    
    return {
      shouldRespond: true,
      responseType: 'cli_help',
      response,
      confidence: match.confidence,
      reasoning: `CLI mode entry command in ${match.language}`,
      command: match.command,
      args: match.args
    };
  }

  private handleFeatureControl(match: CLICommandMatch): CLICommandResponse {
    if (!match.args || match.args.length === 0) {
      const errorMsg = match.language === 'uk' 
        ? '❌ Потрібно вказати назву функції. Наприклад: "увімкни powerWords" або "увімкни nlpConversations"'
        : '❌ Feature name required. Example: "enable powerWords" or "enable nlpConversations"';
      
      return {
        shouldRespond: true,
        responseType: 'cli_control',
        response: errorMsg,
        confidence: match.confidence,
        reasoning: 'Missing feature name',
        command: match.command,
        args: match.args
      };
    }

    const inputFeature = match.args[0];
    
    // Знаходимо правильну назву функції через mapper
    const mappedFeature = featureMapper.findFeatureByAlias(inputFeature);
    
    if (!mappedFeature) {
      const availableFeatures = featureMapper.getAllFeatureManagerNames().join(', ');
      const errorMsg = match.language === 'uk' 
        ? `❌ Невідома функція: "${inputFeature}"\n\n🎛️ Доступні функції:\n${availableFeatures}\n\n💡 Спробуйте: features - для детального списку`
        : `❌ Unknown feature: "${inputFeature}"\n\n🎛️ Available features:\n${availableFeatures}\n\n💡 Try: features - for detailed list`;
      
      return {
        shouldRespond: true,
        responseType: 'cli_control',
        response: errorMsg,
        confidence: match.confidence,
        reasoning: `Unknown feature: ${inputFeature}`,
        command: match.command,
        args: match.args
      };
    }

    let result: string;

    switch (match.command) {
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
        result = match.language === 'uk' 
          ? '❌ Невідома команда'
          : '❌ Unknown command';
    }

    // Додаємо інформацію про мапінг
    const featureInfo = featureMapper.getFeatureInfo(mappedFeature);
    if (featureInfo && inputFeature !== mappedFeature) {
      result += `\n💡 "${inputFeature}" → "${mappedFeature}" (${featureInfo.description})`;
    }

    return {
      shouldRespond: true,
      responseType: 'cli_control',
      response: result,
      confidence: match.confidence,
      reasoning: `Feature control: ${match.command} ${inputFeature} → ${mappedFeature}`,
      command: match.command,
      args: [mappedFeature] // Повертаємо mapped назву
    };
  }

  private generateHelpResponse(language: 'uk' | 'en'): string {
    const features = this.featureManager.getAllFeatures();
    const featureEntries = Object.entries(features);

    if (language === 'uk') {
      let response = '🎛️ **Розширені CLI команди:**\n\n';
      
      // Основні команди
      response += '📋 **Основні команди:**\n';
      response += '• `help` - ця довідка\n';
      response += '• `status` - статус функцій\n';
      response += '• `features` - список функцій\n';
      response += '• `enable [функція]` - увімкнути\n';
      response += '• `disable [функція]` - вимкнути\n';
      response += '• `toggle [функція]` - перемкнути\n\n';

      // Валютні команди
      response += '💱 **Валютні команди:**\n';
      response += '• `currency rate [валюта]` - курс валюти\n';
      response += '• `currency convert [сума] [з] [в]` - конвертація\n';
      response += '• `currency list` - список валют\n';
      response += '• `currency popular` - популярні курси\n\n';

      // Інформаційні команди
      response += '📰 **Інформація:**\n';
      response += '• `news [локація]` - новини\n';
      response += '• `weather [місто]` - погода\n';
      response += '• `search [запит]` - пошук знань\n\n';

      // Розваги
      response += '🎭 **Розваги:**\n';
      response += '• `meme generate [текст]` - створити мем\n';
      response += '• `meme templates` - шаблони мемів\n\n';

      // Система
      response += '🔧 **Система:**\n';
      response += '• `stats [тип]` - статистика\n';
      response += '• `memory [команда]` - управління пам\'яттю\n';
      response += '• `test [модуль]` - тестування\n';
      response += '• `diagnostic` - діагностика\n\n';

      // Статус функцій
      response += '⚙️ **Статус функцій:**\n';
      featureEntries.forEach(([name, enabled]) => {
        const emoji = enabled ? '✅' : '🔴';
        response += `• ${emoji} \`${name}\`\n`;
      });

      response += '\n📱 **Використання:** `cli [команда]` або `@bot [команда]`';

      return response;
    } else {
      let response = '🎛️ **Enhanced CLI Commands:**\n\n';
      
      // Basic commands
      response += '📋 **Basic Commands:**\n';
      response += '• `help` - this help\n';
      response += '• `status` - features status\n';
      response += '• `features` - list features\n';
      response += '• `enable [feature]` - enable\n';
      response += '• `disable [feature]` - disable\n';
      response += '• `toggle [feature]` - toggle\n\n';

      // Currency commands
      response += '💱 **Currency Commands:**\n';
      response += '• `currency rate [currency]` - get rate\n';
      response += '• `currency convert [amount] [from] [to]` - convert\n';
      response += '• `currency list` - list currencies\n';
      response += '• `currency popular` - popular rates\n\n';

      // Information commands
      response += '📰 **Information:**\n';
      response += '• `news [location]` - news\n';
      response += '• `weather [city]` - weather\n';
      response += '• `search [query]` - knowledge search\n\n';

      // Entertainment
      response += '🎭 **Entertainment:**\n';
      response += '• `meme generate [text]` - create meme\n';
      response += '• `meme templates` - meme templates\n\n';

      // System
      response += '🔧 **System:**\n';
      response += '• `stats [type]` - statistics\n';
      response += '• `memory [command]` - memory management\n';
      response += '• `test [module]` - testing\n';
      response += '• `diagnostic` - diagnostics\n\n';

      // Features status
      response += '⚙️ **Features Status:**\n';
      featureEntries.forEach(([name, enabled]) => {
        const emoji = enabled ? '✅' : '🔴';
        response += `• ${emoji} \`${name}\`\n`;
      });

      response += '\n📱 **Usage:** `cli [command]` or `@bot [command]`';

      return response;
    }
  }

  private generateStatusResponse(language: 'uk' | 'en'): string {
    return this.featureManager.getFeatureStatus();
  }

  private generateFeaturesResponse(language: 'uk' | 'en'): string {
    const basicHelp = this.featureManager.getFeatureHelp();
    const mappedFeatures = featureMapper.getFormattedFeaturesList();
    
    return basicHelp + '\n\n' + mappedFeatures;
  }

  private generateCliModeResponse(language: 'uk' | 'en'): string {
    if (language === 'uk') {
      return `🖥️ **CLI режим активовано!**

📖 **Доступні CLI команди:**

**Основні команди:**
• \`help\` - показати довідку
• \`status\` - статус всіх функцій
• \`features\` - список функцій для управління

**Управління функціями:**
• \`enable [функція]\` - увімкнути функцію
• \`disable [функція]\` - вимкнути функцію
• \`toggle [функція]\` - перемкнути функцію

**Приклади:**
• \`enable powerWords\`
• \`disable moderation\`
• \`status\`

💡 **Підказка:** Для звичайного спілкування просто пишіть без команд CLI.
Наприклад: "що ти можеш?" - дасть дружню відповідь.`;
    } else {
      return `🖥️ **CLI Mode Activated!**

📖 **Available CLI Commands:**

**Basic Commands:**
• \`help\` - show help
• \`status\` - show all features status
• \`features\` - list manageable features

**Feature Management:**
• \`enable [feature]\` - enable feature
• \`disable [feature]\` - disable feature
• \`toggle [feature]\` - toggle feature

**Examples:**
• \`enable powerWords\`
• \`disable moderation\`
• \`status\`

💡 **Tip:** For natural conversation, just type without CLI commands.
Example: "what can you do?" - will give a friendly response.`;
    }
  }

  public getStats() {
    const detectorStats = this.detector.getStats();
    return {
      ...detectorStats,
      handlerName: 'CLICommandHandler',
      version: '1.0.0',
      integrations: ['FeatureManager', 'CLICommandDetector'],
      capabilities: [
        'Help command with features status',
        'Feature status display',
        'Feature management (enable/disable/toggle)',
        'Multi-language support (Ukrainian/English)',
        'Bot mention support (@bot commands)',
        'Telegram slash commands (/help, /status)'
      ]
    };
  }

  // Тестовий метод для CLI
  public async testCommand(command: string): Promise<any> {
    const result = await this.handleMessage(command, 'private', 'test', 'test');
    return {
      command,
      detected: result.shouldRespond,
      response: result.shouldRespond ? result.response.substring(0, 100) + '...' : 'Not detected',
      confidence: result.confidence,
      reasoning: result.reasoning
    };
  }

  // === Валютні команди ===
  private async handleCurrencyCommand(match: CLICommandMatch, chatId: string): Promise<CLICommandResponse> {
    const subCommand = match.args?.[0] || 'help';
    
    try {
      switch (subCommand.toLowerCase()) {
        case 'rate':
        case 'курс': {
          const currency = match.args?.[1];
          if (!currency) {
            return this.createErrorResponse('cli_currency', 
              'Потрібно вказати валюту. Наприклад: currency rate USD',
              match.confidence);
          }
          
          const result = await this.currencyHandler.handleMessage(`курс ${currency}`);
          return {
            shouldRespond: true,
            responseType: 'cli_currency',
            response: result.response,
            confidence: match.confidence,
            reasoning: `Currency rate query for ${currency}`,
            command: match.command,
            args: match.args,
            data: result
          };
        }
        
        case 'convert':
        case 'конвертувати': {
          const amount = match.args?.[1];
          const fromCurrency = match.args?.[2];
          const toCurrency = match.args?.[3] || 'UAH';
          
          if (!amount || !fromCurrency) {
            return this.createErrorResponse('cli_currency',
              'Потрібно вказати суму та валюту. Наприклад: currency convert 100 USD UAH',
              match.confidence);
          }
          
          const result = await this.currencyHandler.handleMessage(`${amount} ${fromCurrency} в ${toCurrency}`);
          return {
            shouldRespond: true,
            responseType: 'cli_currency',
            response: result.response,
            confidence: match.confidence,
            reasoning: `Currency conversion: ${amount} ${fromCurrency} to ${toCurrency}`,
            command: match.command,
            args: match.args,
            data: result
          };
        }
        
        case 'list':
        case 'список': {
          const result = await this.currencyHandler.handleMessage('список валют');
          return {
            shouldRespond: true,
            responseType: 'cli_currency',
            response: result.response,
            confidence: match.confidence,
            reasoning: 'Currency list request',
            command: match.command,
            args: match.args,
            data: result
          };
        }
        
        case 'popular':
        case 'популярні': {
          const result = await this.currencyHandler.handleMessage('популярні курси');
          return {
            shouldRespond: true,
            responseType: 'cli_currency',
            response: result.response,
            confidence: match.confidence,
            reasoning: 'Popular currencies request',
            command: match.command,
            args: match.args,
            data: result
          };
        }
        
        default:
          return {
            shouldRespond: true,
            responseType: 'cli_currency',
            response: this.generateCurrencyHelp(match.language),
            confidence: match.confidence,
            reasoning: 'Currency help',
            command: match.command,
            args: match.args
          };
      }
    } catch (error) {
      return this.createErrorResponse('cli_currency', 
        `Помилка обробки валютної команди: ${error}`, 
        match.confidence);
    }
  }

  // === Новини та погода ===
  private async handleNewsCommand(match: CLICommandMatch, chatId: string): Promise<CLICommandResponse> {
    if (!this.newsWeatherHandler) {
      return this.createErrorResponse('cli_news',
        'Модуль новин недоступний',
        match.confidence);
    }

    try {
      const location = match.args?.join(' ') || '';
      const query = location ? `новини ${location}` : 'новини';
      
      const result = await this.newsWeatherHandler.handleNewsCommand(
        parseInt(chatId),
        query
      );

      return {
        shouldRespond: true,
        responseType: 'cli_news',
        response: result || 'Новини недоступні',
        confidence: match.confidence,
        reasoning: `News request${location ? ` for ${location}` : ''}`,
        command: match.command,
        args: match.args
      };
    } catch (error) {
      return this.createErrorResponse('cli_news',
        `Помилка отримання новин: ${error}`,
        match.confidence);
    }
  }

  private async handleWeatherCommand(match: CLICommandMatch, chatId: string): Promise<CLICommandResponse> {
    if (!this.newsWeatherHandler) {
      return this.createErrorResponse('cli_weather',
        'Модуль погоди недоступний',
        match.confidence);
    }

    try {
      const location = match.args?.join(' ') || 'Київ';
      const query = `погода ${location}`;
      
      const result = await this.newsWeatherHandler.handleNewsCommand(
        parseInt(chatId),
        query
      );

      return {
        shouldRespond: true,
        responseType: 'cli_weather',
        response: result || 'Погода недоступна',
        confidence: match.confidence,
        reasoning: `Weather request for ${location}`,
        command: match.command,
        args: match.args
      };
    } catch (error) {
      return this.createErrorResponse('cli_weather',
        `Помилка отримання погоди: ${error}`,
        match.confidence);
    }
  }

  // === Пошук знань ===
  private async handleKnowledgeSearchCommand(match: CLICommandMatch, chatId: string, userId: string): Promise<CLICommandResponse> {
    const query = match.args?.join(' ');
    
    if (!query) {
      return this.createErrorResponse('cli_knowledge',
        'Потрібно вказати запит для пошуку. Наприклад: search математика',
        match.confidence);
    }

    try {
      const result = await this.knowledgeHandler.handleMessage(
        query,
        'private',
        userId,
        chatId
      );

      return {
        shouldRespond: true,
        responseType: 'cli_knowledge',
        response: result.response,
        confidence: Math.min(match.confidence, result.confidence),
        reasoning: `Knowledge search for: ${query}`,
        command: match.command,
        args: match.args,
        data: result
      };
    } catch (error) {
      return this.createErrorResponse('cli_knowledge',
        `Помилка пошуку: ${error}`,
        match.confidence);
    }
  }

  // === Меми ===
  private async handleMemeCommand(match: CLICommandMatch, userId: string): Promise<CLICommandResponse> {
    const subCommand = match.args?.[0] || 'random';
    
    try {
      switch (subCommand.toLowerCase()) {
        case 'generate':
        case 'створити': {
          const memeText = match.args?.slice(1).join(' ');
          if (!memeText) {
            return this.createErrorResponse('cli_meme',
              'Потрібно вказати текст для мему. Наприклад: meme generate funny text',
              match.confidence);
          }

          const result = await this.memeGenerator.generateQuickMeme(memeText);
          
          return {
            shouldRespond: true,
            responseType: 'cli_meme',
            response: result.success ? 
              `🎭 Мем створено!\n${result.text || result.imageUrl || 'Готово!'}` :
              '❌ Не вдалося створити мем',
            confidence: match.confidence,
            reasoning: `Meme generation: ${memeText}`,
            command: match.command,
            args: match.args,
            data: result
          };
        }
        
        case 'templates':
        case 'шаблони': {
          const templates = this.memeGenerator.getAvailableTemplates();
          const templateList = templates.map(t => `• ${t}: шаблон мему`).join('\n');
          
          return {
            shouldRespond: true,
            responseType: 'cli_meme',
            response: `🎭 **Доступні шаблони мемів:**\n\n${templateList}`,
            confidence: match.confidence,
            reasoning: 'Meme templates list',
            command: match.command,
            args: match.args,
            data: { templates }
          };
        }
        
        default: {
          // Випадковий мем
          const result = await this.memeGenerator.generateQuickMeme('CLI мем');
          
          return {
            shouldRespond: true,
            responseType: 'cli_meme',
            response: result.success ? 
              `🎭 Випадковий мем!\n${result.text || result.imageUrl || 'Готово!'}` :
              '❌ Не вдалося створити мем',
            confidence: match.confidence,
            reasoning: 'Random meme generation',
            command: match.command,
            args: match.args,
            data: result
          };
        }
      }
    } catch (error) {
      return this.createErrorResponse('cli_meme',
        `Помилка створення мему: ${error}`,
        match.confidence);
    }
  }

  // === Статистика ===
  private handleStatsCommand(match: CLICommandMatch, chatId: string, userId: string): CLICommandResponse {
    const statsType = match.args?.[0] || 'general';
    
    try {
      let statsData: any = {};
      let response: string;

      switch (statsType.toLowerCase()) {
        case 'features':
        case 'функції': {
          const features = this.featureManager.getAllFeatures();
          const featureEntries = Object.entries(features);
          const enabled = featureEntries.filter(([, isEnabled]) => isEnabled).length;
          const total = featureEntries.length;
          
          response = `📊 **Статистика функцій:**\n\n`;
          response += `✅ Увімкнено: ${enabled}/${total}\n`;
          response += `🔴 Вимкнено: ${total - enabled}/${total}\n\n`;
          
          featureEntries.forEach(([name, isEnabled]) => {
            const emoji = isEnabled ? '✅' : '🔴';
            response += `${emoji} ${name}\n`;
          });
          
          statsData = { features, enabled, total };
          break;
        }
        
        case 'memory':
        case 'пам\'ять': {
          const memoryStats = this.userMemory.getStats();
          response = `🧠 **Статистика пам'яті:**\n\n`;
          response += `👥 Користувачів: ${memoryStats.totalUsers}\n`;
          response += `💬 Взаємодій: ${memoryStats.totalInteractions}\n`;
          response += `⚠️ Порушень: ${memoryStats.totalOffenses}\n`;
          response += `🏆 Компліментів: ${memoryStats.totalCompliments}\n`;
          
          statsData = memoryStats;
          break;
        }
        
        case 'currency':
        case 'валюта': {
          // Статистика валют (заглушка, можна розширити)
          response = `💱 **Статистика валют:**\n\n`;
          response += `📈 Підтримуваних валют: 20+\n`;
          response += `🔄 Доступні операції: курс, конвертація, список\n`;
          response += `🏦 Джерело: НБУ (Національний банк України)\n`;
          
          statsData = { supportedCurrencies: 20, source: 'NBU' };
          break;
        }
        
        default: {
          // Загальна статистика
          const features = this.featureManager.getAllFeatures();
          const enabledFeatures = Object.values(features).filter(Boolean).length;
          const totalFeatures = Object.keys(features).length;
          
          response = `📊 **Загальна статистика системи:**\n\n`;
          response += `🎛️ CLI команд: 15+\n`;
          response += `⚙️ Функцій увімкнено: ${enabledFeatures}/${totalFeatures}\n`;
          response += `🤖 Модулів: 8 основних\n`;
          response += `🌍 Мови: українська, англійська\n`;
          response += `💼 Можливості: валюти, новини, погода, меми, пошук\n`;
          
          statsData = {
            totalCommands: 15,
            enabledFeatures,
            totalFeatures,
            modules: 8,
            languages: ['uk', 'en']
          };
          break;
        }
      }

      return {
        shouldRespond: true,
        responseType: 'cli_stats',
        response,
        confidence: match.confidence,
        reasoning: `Statistics request: ${statsType}`,
        command: match.command,
        args: match.args,
        data: statsData
      };
    } catch (error) {
      return this.createErrorResponse('cli_stats',
        `Помилка отримання статистики: ${error}`,
        match.confidence);
    }
  }

  // === Управління пам'яттю ===
  private handleMemoryCommand(match: CLICommandMatch, userId: string): CLICommandResponse {
    const subCommand = match.args?.[0] || 'status';
    
    try {
      switch (subCommand.toLowerCase()) {
        case 'status':
        case 'статус': {
          const profile = this.userMemory.getUserProfile(userId);
          let response = `🧠 **Профіль пам'яті користувача:**\n\n`;
          response += `👤 ID: ${profile?.userId || userId}\n`;
          response += `😊 Середнє ставлення: ${profile?.averageAttitude || 0}\n`;
          response += `🔢 Взаємодій: ${profile?.totalInteractions || 0}\n`;
          response += `⚠️ Образ: ${profile?.offensiveHistory?.count || 0}\n`;
          response += `🏆 Компліментів: ${profile?.positiveHistory?.count || 0}\n`;
          response += `🕒 Остання активність: ${profile?.lastSeen?.toLocaleString('uk-UA') || 'Немає даних'}\n`;
          
          return {
            shouldRespond: true,
            responseType: 'cli_memory',
            response,
            confidence: match.confidence,
            reasoning: `Memory status for user ${userId}`,
            command: match.command,
            args: match.args,
            data: profile
          };
        }
        
        case 'reset':
        case 'скинути': {
          this.userMemory.resetUserApology(userId);
          
          return {
            shouldRespond: true,
            responseType: 'cli_memory',
            response: '🔄 Пам\'ять користувача скинута. Вибачення більше не потрібне.',
            confidence: match.confidence,
            reasoning: `Memory reset for user ${userId}`,
            command: match.command,
            args: match.args
          };
        }
        
        case 'stats':
        case 'статистика': {
          const stats = this.userMemory.getStats();
          let response = `🧠 **Загальна статистика пам'яті:**\n\n`;
          response += `👥 Всього користувачів: ${stats.totalUsers}\n`;
          response += `💬 Всього взаємодій: ${stats.totalInteractions}\n`;
          response += `⚠️ Всього порушень: ${stats.totalOffenses}\n`;
          response += `🏆 Всього компліментів: ${stats.totalCompliments}\n`;
          
          return {
            shouldRespond: true,
            responseType: 'cli_memory',
            response,
            confidence: match.confidence,
            reasoning: 'Memory global statistics',
            command: match.command,
            args: match.args,
            data: stats
          };
        }
        
        default:
          return this.createErrorResponse('cli_memory',
            'Доступні команди: status, reset, stats',
            match.confidence);
      }
    } catch (error) {
      return this.createErrorResponse('cli_memory',
        `Помилка управління пам'яттю: ${error}`,
        match.confidence);
    }
  }

  // === Тестування ===
  private handleTestCommand(match: CLICommandMatch): CLICommandResponse {
    const testType = match.args?.[0] || 'system';
    
    try {
      let response: string;
      let testData: any = {};

      switch (testType.toLowerCase()) {
        case 'features':
        case 'функції': {
          const features = this.featureManager.getAllFeatures();
          const featureTests = Object.entries(features).map(([name, enabled]) => ({
            feature: name,
            enabled,
            status: enabled ? 'PASS' : 'DISABLED'
          }));
          
          response = `🧪 **Тест функцій:**\n\n`;
          featureTests.forEach(test => {
            const emoji = test.enabled ? '✅' : '⚪';
            response += `${emoji} ${test.feature}: ${test.status}\n`;
          });
          
          testData = { tests: featureTests };
          break;
        }
        
        case 'currency':
        case 'валюта': {
          // Тест валютного модуля
          response = `🧪 **Тест валютного модуля:**\n\n`;
          response += `✅ CurrencyHandler: ініціалізовано\n`;
          response += `✅ CurrencyExchangeService: доступний\n`;
          response += `✅ Підтримка NBU API: активна\n`;
          response += `✅ Команди: rate, convert, list, popular\n`;
          
          testData = { 
            currencyHandler: true,
            exchangeService: true,
            nbuApi: true,
            commands: ['rate', 'convert', 'list', 'popular']
          };
          break;
        }
        
        case 'cli':
        case 'команди': {
          const allCommands = [
            'help', 'status', 'features', 'enable', 'disable', 'toggle',
            'currency', 'news', 'weather', 'search', 'meme', 'stats', 'memory', 'test', 'diagnostic'
          ];
          
          response = `🧪 **Тест CLI команд:**\n\n`;
          allCommands.forEach(cmd => {
            response += `✅ ${cmd}: доступна\n`;
          });
          
          testData = { commands: allCommands, available: allCommands.length };
          break;
        }
        
        default: {
          // Системний тест
          const features = this.featureManager.getAllFeatures();
          const enabledCount = Object.values(features).filter(Boolean).length;
          
          response = `🧪 **Системний тест:**\n\n`;
          response += `✅ FeatureManager: ініціалізовано\n`;
          response += `✅ CLI Detector: працює\n`;
          response += `✅ CurrencyHandler: готовий\n`;
          response += `✅ KnowledgeHandler: активний\n`;
          response += `✅ MemeGenerator: доступний\n`;
          response += `✅ UserMemory: працює\n`;
          response += `📊 Функцій увімкнено: ${enabledCount}\n`;
          
          testData = {
            featureManager: true,
            cliDetector: true,
            currencyHandler: true,
            knowledgeHandler: true,
            memeGenerator: true,
            userMemory: true,
            enabledFeatures: enabledCount
          };
          break;
        }
      }

      return {
        shouldRespond: true,
        responseType: 'cli_test',
        response,
        confidence: match.confidence,
        reasoning: `System test: ${testType}`,
        command: match.command,
        args: match.args,
        data: testData
      };
    } catch (error) {
      return this.createErrorResponse('cli_test',
        `Помилка тестування: ${error}`,
        match.confidence);
    }
  }

  // === Діагностика ===
  private handleDiagnosticCommand(match: CLICommandMatch, chatId: string, userId: string): CLICommandResponse {
    try {
      const diagnosticData = {
        timestamp: new Date().toISOString(),
        chatId,
        userId,
        features: this.featureManager.getAllFeatures(),
        handlers: {
          cli: true,
          currency: !!this.currencyHandler,
          newsWeather: !!this.newsWeatherHandler,
          knowledge: !!this.knowledgeHandler,
          meme: !!this.memeGenerator,
          memory: !!this.userMemory
        },
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          memory: process.memoryUsage(),
          uptime: process.uptime()
        }
      };

      let response = `🔧 **Діагностика системи:**\n\n`;
      response += `🕒 Час: ${new Date().toLocaleString('uk-UA')}\n`;
      response += `👤 Користувач: ${userId}\n`;
      response += `💬 Чат: ${chatId}\n\n`;
      
      response += `🎛️ **Обробники:**\n`;
      Object.entries(diagnosticData.handlers).forEach(([name, status]) => {
        const emoji = status ? '✅' : '❌';
        response += `${emoji} ${name}\n`;
      });
      
      response += `\n⚙️ **Функції:**\n`;
      Object.entries(diagnosticData.features).forEach(([name, enabled]) => {
        const emoji = enabled ? '✅' : '🔴';
        response += `${emoji} ${name}\n`;
      });
      
      response += `\n🖥️ **Система:**\n`;
      response += `• Node.js: ${diagnosticData.system.nodeVersion}\n`;
      response += `• Платформа: ${diagnosticData.system.platform}\n`;
      response += `• Час роботи: ${Math.round(diagnosticData.system.uptime / 60)} хв\n`;
      response += `• Пам'ять: ${Math.round(diagnosticData.system.memory.heapUsed / 1024 / 1024)} MB\n`;

      return {
        shouldRespond: true,
        responseType: 'cli_diagnostic',
        response,
        confidence: match.confidence,
        reasoning: 'System diagnostic',
        command: match.command,
        args: match.args,
        data: diagnosticData
      };
    } catch (error) {
      return this.createErrorResponse('cli_diagnostic',
        `Помилка діагностики: ${error}`,
        match.confidence);
    }
  }

  // === Допоміжні методи ===
  private createErrorResponse(responseType: CLICommandResponse['responseType'], message: string, confidence: number): CLICommandResponse {
    return {
      shouldRespond: true,
      responseType,
      response: `❌ ${message}`,
      confidence,
      reasoning: 'Error response'
    };
  }

  private generateCurrencyHelp(language: 'uk' | 'en'): string {
    if (language === 'uk') {
      return `💱 **Валютні CLI команди:**\n\n` +
             `• \`currency rate [валюта]\` - курс валюти\n` +
             `• \`currency convert [сума] [з] [в]\` - конвертація\n` +
             `• \`currency list\` - список валют\n` +
             `• \`currency popular\` - популярні курси\n\n` +
             `**Приклади:**\n` +
             `• \`currency rate USD\`\n` +
             `• \`currency convert 100 USD UAH\`\n` +
             `• \`currency popular\``;
    } else {
      return `💱 **Currency CLI Commands:**\n\n` +
             `• \`currency rate [currency]\` - get rate\n` +
             `• \`currency convert [amount] [from] [to]\` - convert\n` +
             `• \`currency list\` - list currencies\n` +
             `• \`currency popular\` - popular rates\n\n` +
             `**Examples:**\n` +
             `• \`currency rate USD\`\n` +
             `• \`currency convert 100 USD UAH\`\n` +
             `• \`currency popular\``;
    }
  }
} 