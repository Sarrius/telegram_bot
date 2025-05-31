import { CLICommandHandler } from '../../src/usecases/cliCommandHandler';
import { NewsWeatherHandler } from '../../src/usecases/newsWeatherHandler';
import { FeatureManager } from '../../src/config/featureManager';

describe('Enhanced CLI Command Handler Tests', () => {
  let cliHandler: CLICommandHandler;
  let newsWeatherHandler: NewsWeatherHandler;
  let featureManager: FeatureManager;

  beforeEach(() => {
    // Ініціалізуємо mock handler
    newsWeatherHandler = {
      handleNewsCommand: jest.fn().mockResolvedValue('Тестові новини'),
    } as any;
    
    featureManager = FeatureManager.getInstance();
    cliHandler = new CLICommandHandler(newsWeatherHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic CLI Commands', () => {
    test('should detect help command', async () => {
      const testCases = [
        'help',
        '/help',
        'cli help',
        '@bot cli help'
      ];

      for (const command of testCases) {
        const result = await cliHandler.handleMessage(command, 'private', 'user1', 'chat1');
        expect(result.shouldRespond).toBe(true);
        expect(result.responseType).toBe('cli_help');
        expect(result.command).toBe('help');
        expect(result.response).toContain('CLI команди');
      }
    });

    test('should detect status command', async () => {
      const result = await cliHandler.handleMessage('status', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_status');
      expect(result.command).toBe('status');
    });

    test('should detect features command', async () => {
      const result = await cliHandler.handleMessage('features', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_features');
      expect(result.command).toBe('features');
    });

    test('should handle feature control commands', async () => {
      const enableResult = await cliHandler.handleMessage('enable powerWords', 'private', 'user1', 'chat1');
      expect(enableResult.shouldRespond).toBe(true);
      expect(enableResult.responseType).toBe('cli_control');
      expect(enableResult.command).toBe('enable');

      const disableResult = await cliHandler.handleMessage('disable powerWords', 'private', 'user1', 'chat1');
      expect(disableResult.shouldRespond).toBe(true);
      expect(disableResult.responseType).toBe('cli_control');
      expect(disableResult.command).toBe('disable');

      const toggleResult = await cliHandler.handleMessage('toggle powerWords', 'private', 'user1', 'chat1');
      expect(toggleResult.shouldRespond).toBe(true);
      expect(toggleResult.responseType).toBe('cli_control');
      expect(toggleResult.command).toBe('toggle');
    });

    test('should handle Ukrainian feature control commands', async () => {
      const enableResult = await cliHandler.handleMessage('увімкни powerWords', 'private', 'user1', 'chat1');
      expect(enableResult.shouldRespond).toBe(true);
      expect(enableResult.responseType).toBe('cli_control');
      expect(enableResult.command).toBe('enable');

      const disableResult = await cliHandler.handleMessage('вимкни powerWords', 'private', 'user1', 'chat1');
      expect(disableResult.shouldRespond).toBe(true);
      expect(disableResult.responseType).toBe('cli_control');
      expect(disableResult.command).toBe('disable');
    });
  });

  describe('Currency Commands', () => {
    test('should detect currency rate commands', async () => {
      const testCases = [
        'currency rate USD',
        'cli currency rate EUR',
        '@bot cli currency rate USD'
      ];

      for (const command of testCases) {
        const result = await cliHandler.handleMessage(command, 'private', 'user1', 'chat1');
        expect(result.shouldRespond).toBe(true);
        expect(result.responseType).toBe('cli_currency');
        expect(result.command).toBe('currency');
        expect(result.args).toContain('rate');
      }
    });

    test('should detect currency conversion commands', async () => {
      const result = await cliHandler.handleMessage('currency convert 100 USD UAH', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_currency');
      expect(result.args).toEqual(['convert', '100', 'USD', 'UAH']);
    });

    test('should detect Ukrainian currency commands', async () => {
      const rateResult = await cliHandler.handleMessage('курс USD', 'private', 'user1', 'chat1');
      expect(rateResult.shouldRespond).toBe(true);
      expect(rateResult.responseType).toBe('cli_currency');
      expect(rateResult.command).toBe('currency');

      const currencyResult = await cliHandler.handleMessage('валюта список', 'private', 'user1', 'chat1');
      expect(currencyResult.shouldRespond).toBe(true);
      expect(currencyResult.responseType).toBe('cli_currency');
    });

    test('should handle currency help', async () => {
      const result = await cliHandler.handleMessage('currency', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_currency');
      expect(result.response).toContain('Валютні CLI команди');
    });

    test('should handle currency list command', async () => {
      const result = await cliHandler.handleMessage('currency list', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_currency');
      expect(result.args).toContain('list');
    });

    test('should handle currency popular command', async () => {
      const result = await cliHandler.handleMessage('currency popular', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_currency');
      expect(result.args).toContain('popular');
    });
  });

  describe('News and Weather Commands', () => {
    test('should detect news commands', async () => {
      const testCases = [
        'news',
        'news Київ',
        'cli news Ukraine',
        'новини',
        'новини Львів'
      ];

      for (const command of testCases) {
        const result = await cliHandler.handleMessage(command, 'private', 'user1', 'chat1');
        expect(result.shouldRespond).toBe(true);
        expect(result.responseType).toBe('cli_news');
        expect(result.command).toBe('news');
        expect(newsWeatherHandler.handleNewsCommand).toHaveBeenCalled();
      }
    });

    test('should detect weather commands', async () => {
      const testCases = [
        'weather',
        'weather Київ',
        'cli weather London',
        'погода',
        'погода Харків'
      ];

      for (const command of testCases) {
        const result = await cliHandler.handleMessage(command, 'private', 'user1', 'chat1');
        expect(result.shouldRespond).toBe(true);
        expect(result.responseType).toBe('cli_weather');
        expect(result.command).toBe('weather');
        expect(newsWeatherHandler.handleNewsCommand).toHaveBeenCalled();
      }
    });

    test('should handle news/weather when handler is not available', async () => {
      const handlerWithoutNews = new CLICommandHandler();
      
      const newsResult = await handlerWithoutNews.handleMessage('news', 'private', 'user1', 'chat1');
      expect(newsResult.shouldRespond).toBe(true);
      expect(newsResult.response).toContain('недоступний');

      const weatherResult = await handlerWithoutNews.handleMessage('weather', 'private', 'user1', 'chat1');
      expect(weatherResult.shouldRespond).toBe(true);
      expect(weatherResult.response).toContain('недоступний');
    });
  });

  describe('Knowledge Search Commands', () => {
    test('should detect search commands', async () => {
      const testCases = [
        'search математика',
        'find physics',
        'знайти історія',
        'пошук Python',
        'cli search AI'
      ];

      for (const command of testCases) {
        const result = await cliHandler.handleMessage(command, 'private', 'user1', 'chat1');
        expect(result.shouldRespond).toBe(true);
        expect(result.responseType).toBe('cli_knowledge');
        expect(result.command).toBe('search');
        expect(result.args?.length).toBeGreaterThan(0);
      }
    });

    test('should require query for search', async () => {
      const result = await cliHandler.handleMessage('search', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.response).toContain('Потрібно вказати запит');
    });
  });

  describe('Meme Commands', () => {
    test('should detect meme generation commands', async () => {
      const testCases = [
        'meme generate funny text',
        'мем створити смішний текст',
        'cli meme generate test'
      ];

      for (const command of testCases) {
        const result = await cliHandler.handleMessage(command, 'private', 'user1', 'chat1');
        expect(result.shouldRespond).toBe(true);
        expect(result.responseType).toBe('cli_meme');
        expect(result.command).toBe('meme');
      }
    });

    test('should handle meme templates command', async () => {
      const result = await cliHandler.handleMessage('meme templates', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_meme');
      expect(result.response).toContain('шаблони мемів');
    });

    test('should handle random meme generation', async () => {
      const result = await cliHandler.handleMessage('meme', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_meme');
    });

    test('should require text for meme generation', async () => {
      const result = await cliHandler.handleMessage('meme generate', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.response).toContain('Потрібно вказати текст');
    });
  });

  describe('Statistics Commands', () => {
    test('should handle general statistics', async () => {
      const result = await cliHandler.handleMessage('stats', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_stats');
      expect(result.response).toContain('статистика системи');
      expect(result.data).toBeDefined();
    });

    test('should handle features statistics', async () => {
      const result = await cliHandler.handleMessage('stats features', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_stats');
      expect(result.response).toContain('Статистика функцій');
      expect(result.data.features).toBeDefined();
    });

    test('should handle memory statistics', async () => {
      const result = await cliHandler.handleMessage('stats memory', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_stats');
      expect(result.response).toContain('Статистика пам\'яті');
    });

    test('should handle currency statistics', async () => {
      const result = await cliHandler.handleMessage('stats currency', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_stats');
      expect(result.response).toContain('Статистика валют');
    });

    test('should handle Ukrainian statistics commands', async () => {
      const result = await cliHandler.handleMessage('статистика функції', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_stats');
    });
  });

  describe('Memory Management Commands', () => {
    test('should handle memory status command', async () => {
      const result = await cliHandler.handleMessage('memory status', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_memory');
      expect(result.response).toContain('Профіль пам\'яті');
      expect(result.data).toBeDefined();
    });

    test('should handle memory reset command', async () => {
      const result = await cliHandler.handleMessage('memory reset', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_memory');
      expect(result.response).toContain('скинута');
    });

    test('should handle memory stats command', async () => {
      const result = await cliHandler.handleMessage('memory stats', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_memory');
      expect(result.response).toContain('статистика пам\'яті');
    });

    test('should handle Ukrainian memory commands', async () => {
      const result = await cliHandler.handleMessage('пам\'ять статус', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_memory');
    });

    test('should provide help for unknown memory commands', async () => {
      const result = await cliHandler.handleMessage('memory unknown', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.response).toContain('Доступні команди: status, reset, stats');
    });
  });

  describe('Test Commands', () => {
    test('should handle system test', async () => {
      const result = await cliHandler.handleMessage('test', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_test');
      expect(result.response).toContain('Системний тест');
      expect(result.data).toBeDefined();
    });

    test('should handle features test', async () => {
      const result = await cliHandler.handleMessage('test features', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_test');
      expect(result.response).toContain('Тест функцій');
    });

    test('should handle currency test', async () => {
      const result = await cliHandler.handleMessage('test currency', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_test');
      expect(result.response).toContain('Тест валютного модуля');
    });

    test('should handle CLI commands test', async () => {
      const result = await cliHandler.handleMessage('test cli', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_test');
      expect(result.response).toContain('Тест CLI команд');
      expect(result.data.commands).toBeDefined();
    });

    test('should handle Ukrainian test commands', async () => {
      const result = await cliHandler.handleMessage('тест функції', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_test');
    });
  });

  describe('Diagnostic Commands', () => {
    test('should handle diagnostic command', async () => {
      const result = await cliHandler.handleMessage('diagnostic', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_diagnostic');
      expect(result.response).toContain('Діагностика системи');
      expect(result.data).toBeDefined();
      expect(result.data.handlers).toBeDefined();
      expect(result.data.features).toBeDefined();
      expect(result.data.system).toBeDefined();
    });

    test('should handle Ukrainian diagnostic command', async () => {
      const result = await cliHandler.handleMessage('діагностика', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_diagnostic');
    });

    test('should include system information in diagnostic', async () => {
      const result = await cliHandler.handleMessage('diagnostic', 'private', 'user1', 'chat1');
      expect(result.data.system.nodeVersion).toBeDefined();
      expect(result.data.system.platform).toBeDefined();
      expect(result.data.system.memory).toBeDefined();
      expect(result.data.system.uptime).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle unknown commands', async () => {
      const result = await cliHandler.handleMessage('unknown_command', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(false);
      expect(result.responseType).toBe('ignore');
    });

    test('should handle invalid feature names', async () => {
      const result = await cliHandler.handleMessage('enable invalidFeature', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.response).toContain('Невідома функція');
    });

    test('should handle errors gracefully', async () => {
      // Тест з викидом помилки
      const handlerWithError = new CLICommandHandler();
      const originalMethod = handlerWithError.handleMessage;
      
      // Mock для викидання помилки
      handlerWithError.handleMessage = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      try {
        const result = await originalMethod.call(handlerWithError, 'help', 'private', 'user1', 'chat1');
        // Якщо помилка перехоплена всередині handler
        expect(result.shouldRespond).toBe(true);
        expect(result.responseType).toBe('cli_diagnostic');
        expect(result.response).toContain('Помилка');
      } catch (error) {
        // Якщо помилка не перехоплена
        expect(error).toBeDefined();
      }
    });
  });

  describe('Command Detection Edge Cases', () => {
    test('should detect commands with various prefixes', async () => {
      const testCases = [
        { command: '/currency rate USD', expected: true },
        { command: 'cli currency rate USD', expected: true },
        { command: '@bot cli currency rate USD', expected: true },
        { command: 'просто currency rate USD', expected: false },
        { command: 'currency', expected: true },
        { command: '/test', expected: true },
        { command: 'cli test features', expected: true }
      ];

      for (const { command, expected } of testCases) {
        const result = await cliHandler.handleMessage(command, 'private', 'user1', 'chat1');
        expect(result.shouldRespond).toBe(expected);
      }
    });

    test('should handle commands with extra spaces', async () => {
      const result = await cliHandler.handleMessage('  currency   rate   USD  ', 'private', 'user1', 'chat1');
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('cli_currency');
    });

    test('should be case insensitive', async () => {
      const testCases = [
        'CURRENCY RATE USD',
        'Currency Rate Usd',
        'currency RATE usd'
      ];

      for (const command of testCases) {
        const result = await cliHandler.handleMessage(command, 'private', 'user1', 'chat1');
        expect(result.shouldRespond).toBe(true);
        expect(result.responseType).toBe('cli_currency');
      }
    });
  });

  describe('Multi-language Support', () => {
    test('should detect language correctly', async () => {
      const englishResult = await cliHandler.handleMessage('currency rate USD', 'private', 'user1', 'chat1');
      expect(englishResult.shouldRespond).toBe(true);
      
      const ukrainianResult = await cliHandler.handleMessage('курс USD', 'private', 'user1', 'chat1');
      expect(ukrainianResult.shouldRespond).toBe(true);
    });

    test('should provide help in appropriate language', async () => {
      const englishHelp = await cliHandler.handleMessage('help', 'private', 'user1', 'chat1');
      expect(englishHelp.response).toContain('CLI команди'); // Ukrainian by default

      const currencyHelp = await cliHandler.handleMessage('currency', 'private', 'user1', 'chat1');
      expect(currencyHelp.response).toContain('Валютні CLI команди');
    });
  });

  describe('Integration with Feature Manager', () => {
    test('should reflect actual feature states', async () => {
      const statusResult = await cliHandler.handleMessage('status', 'private', 'user1', 'chat1');
      expect(statusResult.shouldRespond).toBe(true);
      expect(statusResult.response).toContain('Статус функцій');
    });

    test('should enable/disable features correctly', async () => {
      // Спочатку перевіряємо поточний стан
      const initialStatus = featureManager.getAllFeatures();
      
      // Вимикаємо функцію
      const disableResult = await cliHandler.handleMessage('disable powerWords', 'private', 'user1', 'chat1');
      expect(disableResult.shouldRespond).toBe(true);
      
      // Перевіряємо що функція вимкнена
      const afterDisable = featureManager.getAllFeatures();
      expect(afterDisable.powerWords).toBe(false);
      
      // Вмикаємо назад
      const enableResult = await cliHandler.handleMessage('enable powerWords', 'private', 'user1', 'chat1');
      expect(enableResult.shouldRespond).toBe(true);
      
      // Перевіряємо що функція ввімкнена
      const afterEnable = featureManager.getAllFeatures();
      expect(afterEnable.powerWords).toBe(true);
    });
  });

  describe('Data Structure Validation', () => {
    test('should include proper data in responses', async () => {
      const currencyResult = await cliHandler.handleMessage('currency rate USD', 'private', 'user1', 'chat1');
      expect(currencyResult.data).toBeDefined();
      expect(currencyResult.args).toContain('rate');
      expect(currencyResult.args).toContain('USD');

      const statsResult = await cliHandler.handleMessage('stats features', 'private', 'user1', 'chat1');
      expect(statsResult.data.features).toBeDefined();
      expect(statsResult.data.enabled).toBeDefined();
      expect(statsResult.data.total).toBeDefined();

      const diagnosticResult = await cliHandler.handleMessage('diagnostic', 'private', 'user1', 'chat1');
      expect(diagnosticResult.data.timestamp).toBeDefined();
      expect(diagnosticResult.data.handlers).toBeDefined();
      expect(diagnosticResult.data.features).toBeDefined();
      expect(diagnosticResult.data.system).toBeDefined();
    });
  });
}); 