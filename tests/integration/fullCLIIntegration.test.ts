import { EnhancedMessageHandler, EnhancedMessageContext } from '../../src/usecases/enhancedMessageHandler';
import { NewsWeatherHandler } from '../../src/usecases/newsWeatherHandler';
import { FeatureManager } from '../../src/config/featureManager';

describe('Full CLI Integration Tests', () => {
  let enhancedHandler: EnhancedMessageHandler;
  let mockNewsWeatherHandler: NewsWeatherHandler;
  let featureManager: FeatureManager;

  beforeEach(() => {
    // Mock NewsWeatherHandler
    mockNewsWeatherHandler = {
      handleNewsCommand: jest.fn().mockResolvedValue('🇺🇦 Тестові новини України'),
    } as any;

    featureManager = FeatureManager.getInstance();
    enhancedHandler = new EnhancedMessageHandler(
      undefined,
      undefined,
      undefined,
      mockNewsWeatherHandler
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createContext = (text: string, chatType: 'private' | 'group' = 'private'): EnhancedMessageContext => ({
    userId: 'test-user',
    userName: 'TestUser',
    firstName: 'Test',
    chatId: 'test-chat',
    text,
    chatType,
    isDirectMention: false,
    mentionsBot: false,
    isReplyToBot: false
  });

  describe('CLI Command Detection and Processing', () => {
    test('should process help command through full pipeline', async () => {
      const context = createContext('cli help');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.reply).toContain('CLI команди');
      expect(result.cliResponse?.command).toBe('help');
    });

    test('should process status command and show real feature states', async () => {
      const context = createContext('cli status');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.reply).toContain('Статус функцій');
      expect(result.cliResponse?.command).toBe('status');
    });

    test('should enable/disable features through CLI and verify changes', async () => {
      // Перевіряємо початковий стан
      const initialState = featureManager.isEnabled('powerWords');
      
      // Вимикаємо функцію через CLI
      const disableContext = createContext('cli disable powerWords');
      const disableResult = await enhancedHandler.handleMessage(disableContext);
      
      expect(disableResult.shouldReply).toBe(true);
      expect(disableResult.responseType).toBe('cli');
      expect(disableResult.cliResponse?.command).toBe('disable');
      
      // Перевіряємо що функція дійсно вимкнена
      expect(featureManager.isEnabled('powerWords')).toBe(false);
      
      // Вмикаємо назад
      const enableContext = createContext('cli enable powerWords');
      const enableResult = await enhancedHandler.handleMessage(enableContext);
      
      expect(enableResult.shouldReply).toBe(true);
      expect(enableResult.responseType).toBe('cli');
      expect(enableResult.cliResponse?.command).toBe('enable');
      
      // Перевіряємо що функція знову ввімкнена
      expect(featureManager.isEnabled('powerWords')).toBe(true);
    });
  });

  describe('Currency Commands Integration', () => {
    test('should process currency rate command through CLI', async () => {
      const context = createContext('cli currency rate USD');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.cliResponse?.command).toBe('currency');
      expect(result.cliResponse?.args).toContain('rate');
      expect(result.cliResponse?.args).toContain('USD');
    });

    test('should process currency conversion through CLI', async () => {
      const context = createContext('cli currency convert 100 USD UAH');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.cliResponse?.command).toBe('currency');
      expect(result.cliResponse?.args).toEqual(['convert', '100', 'USD', 'UAH']);
    });

    test('should process Ukrainian currency commands', async () => {
      const context = createContext('cli курс USD');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.cliResponse?.command).toBe('currency');
    });

    test('should handle currency help', async () => {
      const context = createContext('cli currency');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.reply).toContain('Валютні CLI команди');
    });
  });

  describe('News and Weather Integration', () => {
    test('should process news command through CLI', async () => {
      const context = createContext('cli news');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.cliResponse?.command).toBe('news');
      expect(mockNewsWeatherHandler.handleNewsCommand).toHaveBeenCalled();
    });

    test('should process weather command with location', async () => {
      const context = createContext('cli weather Київ');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.cliResponse?.command).toBe('weather');
      expect(result.cliResponse?.args).toContain('Київ');
    });

    test('should process Ukrainian news commands', async () => {
      const context = createContext('cli новини Львів');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.cliResponse?.command).toBe('news');
      expect(result.cliResponse?.args).toContain('Львів');
    });
  });

  describe('Knowledge Search Integration', () => {
    test('should process search command through CLI', async () => {
      const context = createContext('cli search математика');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.cliResponse?.command).toBe('search');
      expect(result.cliResponse?.args).toContain('математика');
    });

    test('should handle Ukrainian search commands', async () => {
      const context = createContext('cli пошук фізика');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.cliResponse?.command).toBe('search');
    });

    test('should require query for search', async () => {
      const context = createContext('cli search');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.reply).toContain('Потрібно вказати запит');
    });
  });

  describe('Meme Generation Integration', () => {
    test('should process meme generation through CLI', async () => {
      const context = createContext('cli meme generate funny text');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.cliResponse?.command).toBe('meme');
      expect(result.cliResponse?.args).toContain('generate');
    });

    test('should handle meme templates request', async () => {
      const context = createContext('cli meme templates');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.reply).toContain('шаблони мемів');
    });

    test('should handle Ukrainian meme commands', async () => {
      const context = createContext('cli мем створити тест');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.cliResponse?.command).toBe('meme');
    });
  });

  describe('Statistics Integration', () => {
    test('should process stats command through CLI', async () => {
      const context = createContext('cli stats');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.cliResponse?.command).toBe('stats');
      expect(result.reply).toContain('статистика системи');
    });

    test('should handle features statistics', async () => {
      const context = createContext('cli stats features');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.reply).toContain('Статистика функцій');
    });

    test('should handle memory statistics', async () => {
      const context = createContext('cli stats memory');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.reply).toContain('Статистика пам\'яті');
    });

    test('should handle Ukrainian stats commands', async () => {
      const context = createContext('cli статистика функції');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.cliResponse?.command).toBe('stats');
    });
  });

  describe('Memory Management Integration', () => {
    test('should process memory status through CLI', async () => {
      const context = createContext('cli memory status');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.cliResponse?.command).toBe('memory');
      expect(result.reply).toContain('Профіль пам\'яті');
    });

    test('should handle memory reset', async () => {
      const context = createContext('cli memory reset');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.reply).toContain('скинута');
    });

    test('should handle Ukrainian memory commands', async () => {
      const context = createContext('cli пам\'ять статус');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.cliResponse?.command).toBe('memory');
    });
  });

  describe('Test and Diagnostic Integration', () => {
    test('should process test command through CLI', async () => {
      const context = createContext('cli test');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.cliResponse?.command).toBe('test');
      expect(result.reply).toContain('Системний тест');
    });

    test('should handle features test', async () => {
      const context = createContext('cli test features');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.reply).toContain('Тест функцій');
    });

    test('should process diagnostic command', async () => {
      const context = createContext('cli diagnostic');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.cliResponse?.command).toBe('diagnostic');
      expect(result.reply).toContain('Діагностика системи');
    });

    test('should handle Ukrainian test commands', async () => {
      const context = createContext('cli тест валюта');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.cliResponse?.command).toBe('test');
    });
  });

  describe('Priority System Integration', () => {
    test('CLI commands should have proper priority over other handlers', async () => {
      // CLI команда повинна мати пріоритет над іншими обробниками
      const context = createContext('cli currency rate USD'); // Це CLI команда, не звичайний currency запит
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli'); // Має бути CLI, не currency
      expect(result.cliResponse?.command).toBe('currency');
    });

    test('CLI should process before conversation requests', async () => {
      const context = createContext('cli help please');
      context.isDirectMention = true; // Це зробило б його conversation request
      
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli'); // CLI має пріоритет
      expect(result.cliResponse?.command).toBe('help');
    });

    test('Should process non-CLI currency normally', async () => {
      // Звичайний валютний запит (без CLI) повинен оброблятися currency handler
      const context = createContext('курс долара');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('currency'); // Звичайний currency response
      expect(result.currencyResponse).toBeDefined();
    });

    test('Should process non-CLI search normally', async () => {
      // Звичайний пошук knowledge handler
      const context = createContext('що таке математика?');
      context.isDirectMention = true;
      
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(['knowledge', 'conversation']).toContain(result.responseType);
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle CLI errors gracefully', async () => {
      const context = createContext('cli unknown_command');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(false);
      expect(result.responseType).toBe('none');
    });

    test('should handle feature control errors', async () => {
      const context = createContext('cli enable invalidFeature');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.reply).toContain('Невідома функція');
    });

    test('should handle missing arguments gracefully', async () => {
      const context = createContext('cli currency rate');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.reply).toContain('Потрібно вказати валюту');
    });
  });

  describe('Multi-language Support Integration', () => {
    test('should handle mixed language commands', async () => {
      const testCases = [
        'cli currency rate долар',
        'cli валюта rate USD',
        'cli новини Ukraine',
        'cli news Україна'
      ];

      for (const command of testCases) {
        const context = createContext(command);
        const result = await enhancedHandler.handleMessage(context);

        expect(result.shouldReply).toBe(true);
        expect(result.responseType).toBe('cli');
      }
    });

    test('should provide appropriate language responses', async () => {
      const ukrainianContext = createContext('cli курс USD');
      const ukrainianResult = await enhancedHandler.handleMessage(ukrainianContext);

      expect(ukrainianResult.shouldReply).toBe(true);
      expect(ukrainianResult.responseType).toBe('cli');

      const englishContext = createContext('cli currency rate USD');
      const englishResult = await enhancedHandler.handleMessage(englishContext);

      expect(englishResult.shouldReply).toBe(true);
      expect(englishResult.responseType).toBe('cli');
    });
  });

  describe('Bot Mention Integration', () => {
    test('should handle bot mention CLI commands', async () => {
      const context = createContext('@bot cli help');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.cliResponse?.command).toBe('help');
    });

    test('should handle bot mention with specific commands', async () => {
      const context = createContext('@bot cli currency rate USD');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.responseType).toBe('cli');
      expect(result.cliResponse?.command).toBe('currency');
    });
  });

  describe('Data Structure Validation', () => {
    test('should include proper CLI response structure', async () => {
      const context = createContext('cli help');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.cliResponse).toBeDefined();
      expect(result.cliResponse?.command).toBe('help');
      expect(result.cliResponse?.args).toEqual([]);
      expect(result.cliResponse?.response).toBeDefined();
      expect(typeof result.confidence).toBe('number');
      expect(typeof result.reasoning).toBe('string');
    });

    test('should include data in complex CLI responses', async () => {
      const context = createContext('cli stats features');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.cliResponse).toBeDefined();
      expect(result.cliResponse?.command).toBe('stats');
      expect(result.cliResponse?.args).toContain('features');
    });

    test('should maintain consistency across all CLI commands', async () => {
      const commands = [
        'cli help',
        'cli status',
        'cli features',
        'cli stats',
        'cli test',
        'cli diagnostic'
      ];

      for (const command of commands) {
        const context = createContext(command);
        const result = await enhancedHandler.handleMessage(context);

        expect(result.shouldReply).toBe(true);
        expect(result.responseType).toBe('cli');
        expect(result.cliResponse).toBeDefined();
        expect(result.cliResponse?.command).toBeDefined();
        expect(result.confidence).toBeGreaterThan(0);
        expect(result.reasoning).toContain('CLI');
      }
    });
  });

  describe('Feature Manager Integration', () => {
    test('should reflect actual feature states in CLI responses', async () => {
      // Отримуємо поточний стан
      const initialFeatures = featureManager.getAllFeatures();
      
      const context = createContext('cli status');
      const result = await enhancedHandler.handleMessage(context);

      expect(result.shouldReply).toBe(true);
      expect(result.reply).toContain('Статус функцій');
      
      // Перевіряємо що відповідь містить інформацію про реальні функції
      Object.keys(initialFeatures).forEach(featureName => {
        expect(result.reply).toContain(featureName);
      });
    });

    test('should update feature states and reflect in subsequent calls', async () => {
      // Вимикаємо функцію
      const disableContext = createContext('cli disable powerWords');
      await enhancedHandler.handleMessage(disableContext);
      
      // Перевіряємо стан
      const statusContext = createContext('cli status');
      const statusResult = await enhancedHandler.handleMessage(statusContext);
      
      expect(statusResult.reply).toContain('🔴');
      
      // Вмикаємо назад
      const enableContext = createContext('cli enable powerWords');
      await enhancedHandler.handleMessage(enableContext);
      
      // Перевіряємо знову
      const finalStatusResult = await enhancedHandler.handleMessage(statusContext);
      expect(finalStatusResult.reply).toContain('✅');
    });
  });
}); 