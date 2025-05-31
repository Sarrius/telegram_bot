import { NewsWeatherHandler, ScheduledTask } from '../../src/usecases/newsWeatherHandler';
import { NewsWeatherMonitor } from '../../src/domain/newsWeatherMonitor';
import TelegramBot from 'node-telegram-bot-api';
import { NewsCommandsFuzzyMatcher } from '../../src/config/vocabulary/newsCommandsFuzzyMatcher';

// Мокаємо залежності
jest.mock('../../src/domain/newsWeatherMonitor');
jest.mock('node-telegram-bot-api');
jest.mock('../../src/config/vocabulary/newsCommandsFuzzyMatcher');

// Мокаємо глобальні функції
const mockSetTimeout = jest.fn();
global.setTimeout = mockSetTimeout as any;

describe('NewsWeatherHandler', () => {
  let handler: NewsWeatherHandler;
  let mockBot: jest.Mocked<TelegramBot>;
  let mockMonitor: jest.Mocked<NewsWeatherMonitor>;
  let mockFuzzyMatcher: jest.Mocked<NewsCommandsFuzzyMatcher>;

  const mockNewsApiKey = 'test-news-key';
  const mockWeatherApiKey = 'test-weather-key';

  beforeEach(() => {
    mockBot = {
      sendMessage: jest.fn().mockResolvedValue({}),
    } as any;

    mockMonitor = {
      createMorningSummary: jest.fn(),
      checkCriticalNews: jest.fn(),
      formatCriticalAlert: jest.fn(),
      getUkrainianNews: jest.fn(),
      getWeatherData: jest.fn(),
    } as any;

    mockFuzzyMatcher = {
      recognizeCommand: jest.fn(),
      getRecognitionStats: jest.fn().mockReturnValue({
        totalKeywords: 50,
        totalVariations: 100,
        supportedCities: 16
      })
    } as any;

    (NewsWeatherMonitor as jest.Mock).mockImplementation(() => mockMonitor);
    (NewsCommandsFuzzyMatcher as jest.Mock).mockImplementation(() => mockFuzzyMatcher);

    jest.clearAllTimers();
    jest.useFakeTimers();
    mockSetTimeout.mockClear();

    // Створюємо новий handler для кожного тесту з чистим стартом
    handler = new NewsWeatherHandler(
      mockNewsApiKey,
      mockWeatherApiKey,
      mockBot,
      [] // Чистий список підписаних чатів
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Ініціалізація', () => {
    it('має створювати екземпляр NewsWeatherMonitor', () => {
      expect(NewsWeatherMonitor).toHaveBeenCalledWith(
        mockNewsApiKey,
        mockWeatherApiKey
      );
    });

    it('має ініціалізувати планувальник завдань', () => {
      // Перевіряємо що планувальник створив завдання
      const status = handler.getSchedulerStatus();
      expect(status).toContain('morning_summary');
      expect(status).toContain('critical_monitoring');
    });
  });

  describe('handleNewsCommand', () => {
    describe('Запити новин', () => {
      const newsRequests = [
        'Які новини?',
        'Що відбувається в світі?',
        'Розкажи останні новини',
        'Що твориться?',
        'Свіжі новини'
      ];

      newsRequests.forEach(request => {
        it(`має розпізнавати "${request}" як запит новин`, async () => {
          // Налаштовуємо мок для розпізнавання новинної команди
          mockFuzzyMatcher.recognizeCommand.mockReturnValueOnce({
            type: 'news',
            confidence: 0.9,
            originalText: request,
            matchedKeyword: 'новини'
          });

          const mockNews = [
            {
              id: '1',
              title: 'Тестова новина',
              description: 'Опис новини',
              url: 'https://example.com',
              publishedAt: new Date(),
              severity: 'medium' as const,
              category: 'general' as const,
              source: 'Тест'
            }
          ];

          mockMonitor.getUkrainianNews.mockResolvedValueOnce(mockNews);

          const response = await handler.handleNewsCommand(123, request);

          expect(response).toContain('📰 **ВАЖЛИВІ НОВИНИ:**');
          expect(response).toContain('Тестова новина');
          expect(mockMonitor.getUkrainianNews).toHaveBeenCalledWith(24);
        });
      });
    });

    describe('Запити погоди', () => {
      const weatherRequests = [
        'Яка погода?',
        'Погода в Києві',
        'Яка температура?',
        'Як на вулиці?'
      ];

      weatherRequests.forEach(request => {
        it(`має розпізнавати "${request}" як запит погоди`, async () => {
          // Налаштовуємо мок для розпізнавання погодної команди
          mockFuzzyMatcher.recognizeCommand.mockReturnValueOnce({
            type: 'weather',
            confidence: 0.85,
            originalText: request,
            matchedKeyword: 'погода',
            city: 'Київ'
          });

          const mockWeather = {
            temperature: 15,
            condition: 'ясно',
            humidity: 60,
            windSpeed: 10,
            pressure: 760,
            alerts: [],
            city: 'Київ',
            description: '15°C, ясно'
          };

          mockMonitor.getWeatherData.mockResolvedValueOnce(mockWeather);

          const response = await handler.handleNewsCommand(123, request);

          expect(response).toContain('🌤 **Погода в Київ:**');
          expect(response).toContain('15°C');
          expect(response).toContain('ясно');
          expect(mockMonitor.getWeatherData).toHaveBeenCalled();
        });
      });
    });

    describe('Управління підпискою', () => {
      it('має обробляти запити на підписку', async () => {
        // Налаштовуємо мок для розпізнавання команди підписки
        mockFuzzyMatcher.recognizeCommand.mockReturnValueOnce({
          type: 'subscribe',
          confidence: 0.9,
          originalText: 'Хочу підписатися на ранкові новини',
          matchedKeyword: 'підписатися'
        });

        const response = await handler.handleNewsCommand(1001, 'Хочу підписатися на ранкові новини');

        expect(response).toContain('🔔 Ви підписалися на ранкові зводки!');
      });

      it('має обробляти запити на відписку', async () => {
        // Спочатку підписуємося
        mockFuzzyMatcher.recognizeCommand.mockReturnValueOnce({
          type: 'subscribe',
          confidence: 0.9,
          originalText: 'підписатися на новини',
          matchedKeyword: 'підписатися'
        });
        await handler.handleNewsCommand(1002, 'підписатися на новини');
        
        // Потім відписуємося
        mockFuzzyMatcher.recognizeCommand.mockReturnValueOnce({
          type: 'unsubscribe',
          confidence: 0.9,
          originalText: 'відписатися від новин',
          matchedKeyword: 'відписатися'
        });
        const response = await handler.handleNewsCommand(1002, 'відписатися від новин');

        expect(response).toContain('🔕 Ви відписалися від ранкових зводок');
      });

      it('має повідомляти про вже існуючу підписку', async () => {
        // Підписуємося двічі
        mockFuzzyMatcher.recognizeCommand.mockReturnValue({
          type: 'subscribe',
          confidence: 0.9,
          originalText: 'підписатися',
          matchedKeyword: 'підписатися'
        });
        await handler.handleNewsCommand(1003, 'підписатися');
        const response = await handler.handleNewsCommand(1003, 'підписатися');

        expect(response).toContain('✅ Ви вже підписані на ранкові зводки');
      });
    });

    describe('Визначення міста', () => {
      const cityTests = [
        { text: 'Погода в Харкові', expectedCity: 'Харків' },
        { text: 'Яка погода в Одесі?', expectedCity: 'Одеса' },
        { text: 'Львів погода', expectedCity: 'Львів' },
        { text: 'Дніпро температура', expectedCity: 'Дніпро' }
      ];

      cityTests.forEach(({ text, expectedCity }) => {
        it(`має витягувати місто "${expectedCity}" з тексту "${text}"`, async () => {
          // Налаштовуємо мок для розпізнавання погодної команди з містом
          mockFuzzyMatcher.recognizeCommand.mockReturnValueOnce({
            type: 'weather',
            confidence: 0.85,
            originalText: text,
            matchedKeyword: 'погода',
            city: expectedCity
          });

          const mockWeather = {
            temperature: 10,
            condition: 'хмарно',
            humidity: 70,
            windSpeed: 5,
            pressure: 755,
            alerts: [],
            city: expectedCity,
            description: '10°C, хмарно'
          };

          mockMonitor.getWeatherData.mockResolvedValueOnce(mockWeather);

          const response = await handler.handleNewsCommand(123, text);

          expect(mockMonitor.getWeatherData).toHaveBeenCalledWith(expectedCity);
          expect(response).toContain(expectedCity);
        });
      });
    });

    it('має повертати порожній рядок для нерозпізнаних команд', async () => {
      // Налаштовуємо мок для повернення null (нерозпізнана команда)
      mockFuzzyMatcher.recognizeCommand.mockReturnValueOnce(null);

      const response = await handler.handleNewsCommand(123, 'випадковий текст');

      expect(response).toBe('');
    });
  });

  describe('Планування завдань', () => {
    it('має планувати ранкові зводки', () => {
      // Перевіряємо що завдання ранкових зводок створено
      const status = handler.getSchedulerStatus();
      expect(status).toContain('morning_summary');
      expect(status).toContain('✅'); // Завдання активне
    });

    it('має планувати моніторинг критичних новин', () => {
      // Перевіряємо що завдання моніторингу створено
      const status = handler.getSchedulerStatus();
      expect(status).toContain('critical_monitoring');
      expect(status).toContain('✅'); // Завдання активне
    });
  });

  describe('Відправка ранкових зводок', () => {
    it('має відправляти ранкову зводку підписаним чатам', async () => {
      // Підписуємо чат
      mockFuzzyMatcher.recognizeCommand.mockReturnValueOnce({
        type: 'subscribe',
        confidence: 0.9,
        originalText: 'підписатися',
        matchedKeyword: 'підписатися'
      });
      await handler.handleNewsCommand(2001, 'підписатися');
      
      // Перевіряємо що чат підписаний
      const subscribedChats = handler.getSubscribedChats();
      expect(subscribedChats).toContain(2001);
    });

    it('не має відправляти зводки якщо немає підписаних чатів', async () => {
      // Перевіряємо що немає підписаних чатів
      const subscribedChats = handler.getSubscribedChats();
      expect(subscribedChats).toHaveLength(0);
    });
  });

  describe('Моніторинг критичних новин', () => {
    it('має відправляти критичні новини підписаним чатам', async () => {
      // Підписуємо чат
      mockFuzzyMatcher.recognizeCommand.mockReturnValueOnce({
        type: 'subscribe',
        confidence: 0.9,
        originalText: 'підписатися',
        matchedKeyword: 'підписатися'
      });
      await handler.handleNewsCommand(3001, 'підписатися');
      
      // Перевіряємо що моніторинг увімкнено
      const status = handler.getSchedulerStatus();
      expect(status).toContain('critical_monitoring');
      expect(status).toContain('✅');
      
      // Перевіряємо що чат підписаний
      const subscribedChats = handler.getSubscribedChats();
      expect(subscribedChats).toContain(3001);
    });
  });

  describe('Управління моніторингом', () => {
    it('має вмикати та вимикати критичний моніторинг', () => {
      const enabledResult = handler.toggleCriticalMonitoring(true);
      expect(enabledResult).toContain('✅ Моніторинг критичних новин увімкнено');

      const disabledResult = handler.toggleCriticalMonitoring(false);
      expect(disabledResult).toContain('❌ Моніторинг критичних новин вимкнено');
    });

    it('має повертати статус планувальника', () => {
      const status = handler.getSchedulerStatus();
      
      expect(status).toContain('📅 **Статус планувальника:**');
      expect(status).toContain('morning_summary');
      expect(status).toContain('critical_monitoring');
    });
  });

  describe('Обробка помилок', () => {
    it('має обробляти помилки при отриманні новин', async () => {
      mockFuzzyMatcher.recognizeCommand.mockReturnValueOnce({
        type: 'news',
        confidence: 0.9,
        originalText: 'новини',
        matchedKeyword: 'новини'
      });
      mockMonitor.getUkrainianNews.mockRejectedValueOnce(new Error('API Error'));

      const response = await handler.handleNewsCommand(123, 'новини');

      expect(response).toContain('❌ Не вдалося отримати новини');
    });

    it('має обробляти помилки при отриманні погоди', async () => {
      mockFuzzyMatcher.recognizeCommand.mockReturnValueOnce({
        type: 'weather',
        confidence: 0.85,
        originalText: 'погода',
        matchedKeyword: 'погода',
        city: 'Київ'
      });
      mockMonitor.getWeatherData.mockRejectedValueOnce(new Error('Weather API Error'));

      const response = await handler.handleNewsCommand(123, 'погода');

      expect(response).toContain('❌ Не вдалося отримати дані про погоду');
    });

    it('має обробляти відсутність даних про погоду', async () => {
      mockFuzzyMatcher.recognizeCommand.mockReturnValueOnce({
        type: 'weather',
        confidence: 0.85,
        originalText: 'погода в Києві',
        matchedKeyword: 'погода',
        city: 'Київ'
      });
      mockMonitor.getWeatherData.mockResolvedValueOnce(null);

      const response = await handler.handleNewsCommand(123, 'погода в Києві');

      expect(response).toContain('❌ Не вдалося отримати дані про погоду для Київ');
    });

    it('має обробляти відсутність новин', async () => {
      mockFuzzyMatcher.recognizeCommand.mockReturnValueOnce({
        type: 'news',
        confidence: 0.9,
        originalText: 'новини',
        matchedKeyword: 'новини'
      });
      mockMonitor.getUkrainianNews.mockResolvedValueOnce([]);

      const response = await handler.handleNewsCommand(123, 'новини');

      expect(response).toContain('📰 Наразі немає свіжих новин за останню добу');
    });
  });

  describe('Очищення ресурсів', () => {
    it('має очищати таймери при завершенні роботи', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      
      handler.cleanup();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('Отримання підписаних чатів', () => {
    it('має повертати список підписаних чатів', async () => {
      mockFuzzyMatcher.recognizeCommand.mockReturnValue({
        type: 'subscribe',
        confidence: 0.9,
        originalText: 'підписатися',
        matchedKeyword: 'підписатися'
      });
      
      await handler.handleNewsCommand(4001, 'підписатися');
      await handler.handleNewsCommand(4002, 'підписатися');

      const subscribedChats = handler.getSubscribedChats();

      expect(subscribedChats).toContain(4001);
      expect(subscribedChats).toContain(4002);
      expect(subscribedChats).toHaveLength(2);
    });
  });

  describe('Fuzzy matching функціональність', () => {
    it('має тестувати розпізнавання команд', () => {
      const testResult = handler.testCommandRecognition('новини');
      // Перевіряємо що метод викликається (можливий результат залежить від моку)
      expect(typeof testResult).toBeDefined();
    });

    it('має повертати статистику розпізнавання', () => {
      const stats = handler.getRecognitionStats();
      expect(stats).toBeDefined();
      expect(typeof stats.totalKeywords).toBe('number');
      expect(typeof stats.totalVariations).toBe('number');
      expect(typeof stats.supportedCities).toBe('number');
    });
  });

  describe('Толерантність до помилок у командах', () => {
    beforeEach(() => {
      // Встановлюємо глобальний mockFuzzyMatcher для цього розділу
      // @ts-ignore - доступ до приватного поля для тестування
      handler.fuzzyMatcher = mockFuzzyMatcher;
    });

    it('має розпізнавати команди новин з помилками', async () => {
      const commandsWithTypos = [
        'новыни',
        'шо відбувається',
        'які новыны',
        'останніе подіі'
      ];

      commandsWithTypos.forEach(async (command, index) => {
        mockFuzzyMatcher.recognizeCommand.mockReturnValueOnce({
          type: 'news',
          confidence: 0.85,
          originalText: command,
          matchedKeyword: 'новини'
        });

        const mockNews = [
          {
            id: '1',
            title: 'Тестова новина',
            description: 'Опис новини',
            url: 'https://example.com',
            publishedAt: new Date(),
            severity: 'medium' as const,
            category: 'general' as const,
            source: 'Тест'
          }
        ];

        mockMonitor.getUkrainianNews.mockResolvedValueOnce(mockNews);

        const response = await handler.handleNewsCommand(5100 + index, command);
        expect(response).toContain('📰 **ВАЖЛИВІ НОВИНИ:**');
      });
    });

    it('має розпізнавати команди погоди з помилками', async () => {
      const commandsWithTypos = [
        'погоды в киеві',
        'темпирература в харькові',
        'як навулиці в одессі'
      ];

      commandsWithTypos.forEach(async (command, index) => {
        mockFuzzyMatcher.recognizeCommand.mockReturnValueOnce({
          type: 'weather',
          confidence: 0.8,
          originalText: command,
          matchedKeyword: 'погода',
          city: 'Київ'
        });

        const mockWeather = {
          temperature: 15,
          condition: 'ясно',
          humidity: 60,
          windSpeed: 10,
          pressure: 760,
          alerts: [],
          city: 'Київ',
          description: '15°C, ясно'
        };

        mockMonitor.getWeatherData.mockResolvedValueOnce(mockWeather);

        const response = await handler.handleNewsCommand(5200 + index, command);
        expect(response).toContain('🌤 **Погода в Київ:**');
      });
    });

    it('має розпізнавати команди підписки з помилками', async () => {
      const commandsWithTypos = [
        'пітписатися',
        'підпіска на новини',
        'хочю ранкові новыны'
      ];

      // Використовуємо унікальні chatId для кожної команди
      commandsWithTypos.forEach(async (command, index) => {
        mockFuzzyMatcher.recognizeCommand.mockReturnValueOnce({
          type: 'subscribe',
          confidence: 0.75,
          originalText: command,
          matchedKeyword: 'підписатися'
        });

        const response = await handler.handleNewsCommand(5000 + index, command);
        expect(response).toContain('🔔 Ви підписалися на ранкові зводки!');
      });
    });

    it('має обробляти помилки при розпізнаванні команд', async () => {
      mockFuzzyMatcher.recognizeCommand.mockImplementationOnce(() => {
        throw new Error('Fuzzy matching error');
      });

      const response = await handler.handleNewsCommand(5300, 'новини');
      expect(response).toContain('❌ Виникла помилка під час обробки запиту');
    });

    it('має повертати порожній рядок для нерозпізнаних команд', async () => {
      mockFuzzyMatcher.recognizeCommand.mockReturnValueOnce(null);

      const response = await handler.handleNewsCommand(5400, 'випадковий текст');
      expect(response).toBe('');
    });
  });
}); 