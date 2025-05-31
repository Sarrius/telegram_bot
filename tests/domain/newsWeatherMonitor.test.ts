// Імпортуємо axios перед мокінгом
import axios from 'axios';
import { NewsWeatherMonitor, NewsItem, WeatherData } from '../../src/domain/newsWeatherMonitor';

// Мокаємо axios для тестування
jest.mock('axios');
const mockedAxios = jest.mocked(axios);

describe('NewsWeatherMonitor', () => {
  let monitor: NewsWeatherMonitor;
  const mockNewsApiKey = 'test-news-key';
  const mockWeatherApiKey = 'test-weather-key';

  beforeEach(() => {
    monitor = new NewsWeatherMonitor(mockNewsApiKey, mockWeatherApiKey);
    jest.clearAllMocks();
  });

  describe('getUkrainianNews', () => {
    it('має отримувати та обробляти українські новини', async () => {
      const mockNewsData = {
        data: {
          articles: [
            {
              title: 'Важливі події в Україні',
              description: 'Детальний опис подій',
              url: 'https://example.com/news1',
              publishedAt: '2024-01-15T10:00:00Z',
              source: { name: 'Українська правда' }
            },
            {
              title: 'Економічні новини',
              description: 'Розвиток економіки України',
              url: 'https://example.com/news2',
              publishedAt: '2024-01-15T09:00:00Z',
              source: { name: 'УНН' }
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockNewsData);

      const news = await monitor.getUkrainianNews(24);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://newsapi.org/v2/everything',
        expect.objectContaining({
          params: expect.objectContaining({
            q: 'Ukraine OR Україна',
            language: 'uk',
            apiKey: mockNewsApiKey
          })
        })
      );

      expect(news).toHaveLength(2);
      expect(news[0].title).toBe('Важливі події в Україні');
      expect(news[0].severity).toBeDefined();
      expect(news[0].category).toBeDefined();
    });

    it('має правильно визначати критичність новин', async () => {
      const mockCriticalNews = {
        data: {
          articles: [
            {
              title: 'Надзвичайна ситуація в регіоні',
              description: 'Критична подія потребує негайної реакції',
              url: 'https://example.com/critical',
              publishedAt: '2024-01-15T10:00:00Z',
              source: { name: 'ДСНС' }
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockCriticalNews);

      const news = await monitor.getUkrainianNews(24);

      expect(news[0].severity).toBe('critical');
      expect(news[0].category).toBe('emergency');
    });

    it('має обробляти помилки при отриманні новин', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const news = await monitor.getUkrainianNews(24);

      expect(news).toEqual([]);
    });
  });

  describe('getWeatherData', () => {
    it('має отримувати дані про погоду для українських міст', async () => {
      const mockWeatherData = {
        data: {
          main: {
            temp: 15,
            humidity: 65,
            pressure: 1013
          },
          weather: [
            {
              description: 'хмарно'
            }
          ],
          wind: {
            speed: 3.5
          },
          name: 'Київ'
        }
      };

      const mockGeoData = {
        data: [
          {
            lat: 50.4501,
            lon: 30.5234
          }
        ]
      };

      const mockAlertsData = {
        data: {
          alerts: []
        }
      };

      mockedAxios.get
        .mockResolvedValueOnce(mockWeatherData)
        .mockResolvedValueOnce(mockGeoData)
        .mockResolvedValueOnce(mockAlertsData);

      const weather = await monitor.getWeatherData('Київ');

      expect(weather).toBeDefined();
      expect(weather!.temperature).toBe(15);
      expect(weather!.city).toBe('Київ');
      expect(weather!.condition).toBe('хмарно');
      expect(weather!.windSpeed).toBe(13); // 3.5 * 3.6 rounded
    });

    it('має обробляти помилки при отриманні погоди', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API error'));

      const weather = await monitor.getWeatherData('Київ');

      expect(weather).toBeNull();
    });
  });

  describe('createMorningSummary', () => {
    it('має створювати ранкову зводку з новинами та погодою', async () => {
      const mockNewsData = {
        data: {
          articles: [
            {
              title: 'Головна новина дня',
              description: 'Важлива подія в Україні',
              url: 'https://example.com/top-news',
              publishedAt: '2024-01-15T10:00:00Z',
              source: { name: 'Українська правда' }
            }
          ]
        }
      };

      const mockWeatherData = {
        data: {
          main: { temp: 10, humidity: 70, pressure: 1015 },
          weather: [{ description: 'ясно' }],
          wind: { speed: 2.0 },
          name: 'Київ'
        }
      };

      mockedAxios.get
        .mockResolvedValueOnce(mockNewsData)
        .mockResolvedValueOnce(mockWeatherData)
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: { alerts: [] } });

      const summary = await monitor.createMorningSummary('Київ');

      expect(summary).toContain('Ранкова зводка');
      expect(summary).toContain('Погода в Київ');
      expect(summary).toContain('10°C');
      expect(summary).toContain('Головна новина дня');
      expect(summary).toContain('Гарного дня!');
    });

    it('має обробляти відсутність новин або погоди', async () => {
      mockedAxios.get.mockRejectedValue(new Error('No data'));

      const summary = await monitor.createMorningSummary();

      // Перевіряємо що зводка створюється навіть без даних
      expect(summary).toContain('Ранкова зводка');
      expect(summary).toContain('Наразі немає свіжих новин');
      expect(summary).toContain('Гарного дня!');
    });
  });

  describe('checkCriticalNews', () => {
    it('має виявляти критичні новини', async () => {
      const mockCriticalNews = {
        data: {
          articles: [
            {
              title: 'Пожежа в промисловому районі',
              description: 'Евакуація населення в зв\'язку з аварією',
              url: 'https://example.com/fire',
              publishedAt: new Date().toISOString(),
              source: { name: 'ДСНС' }
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockCriticalNews);

      const criticalNews = await monitor.checkCriticalNews();

      expect(criticalNews).toHaveLength(1);
      expect(criticalNews[0].severity).toBe('critical');
    });

    it('не має повторювати вже відправлені критичні новини', async () => {
      const mockNews = {
        data: {
          articles: [
            {
              title: 'Критична подія',
              description: 'Надзвичайна ситуація',
              url: 'https://example.com/same-news',
              publishedAt: new Date().toISOString(),
              source: { name: 'Джерело' }
            }
          ]
        }
      };

      mockedAxios.get
        .mockResolvedValueOnce(mockNews)
        .mockResolvedValueOnce(mockNews);

      // Перший виклик
      const firstCheck = await monitor.checkCriticalNews();
      expect(firstCheck).toHaveLength(1);

      // Другий виклик з тією ж новиною
      const secondCheck = await monitor.checkCriticalNews();
      expect(secondCheck).toHaveLength(0);
    });
  });

  describe('formatCriticalAlert', () => {
    it('має правильно форматувати критичні сповіщення', () => {
      const newsItem: NewsItem = {
        id: 'test-id',
        title: 'Надзвичайна ситуація',
        description: 'Детальний опис події',
        url: 'https://example.com/news',
        publishedAt: new Date(),
        severity: 'critical',
        category: 'emergency',
        source: 'ДСНС'
      };

      const formatted = monitor.formatCriticalAlert(newsItem);

      expect(formatted).toContain('🚨🚨🚨 **ВАЖЛИВА НОВИНА** 🚨🚨🚨');
      expect(formatted).toContain('Надзвичайна ситуація');
      expect(formatted).toContain('Детальний опис події');
      expect(formatted).toContain('📍 Джерело: ДСНС');
    });
  });

  describe('Критичні ключові слова', () => {
    const criticalKeywords = [
      'надзвичайна ситуація',
      'аварія',
      'пожежа',
      'вибух',
      'землетрус',
      'повінь',
      'евакуація',
      'жертви',
      'катастрофа',
      'обстріл',
      'тривога'
    ];

    criticalKeywords.forEach(keyword => {
      it(`має розпізнавати "${keyword}" як критичне ключове слово`, async () => {
        const mockNews = {
          data: {
            articles: [
              {
                title: `Новина про ${keyword}`,
                description: `У новині йдеться про ${keyword}`,
                url: 'https://example.com/critical',
                publishedAt: new Date().toISOString(),
                source: { name: 'Джерело' }
              }
            ]
          }
        };

        mockedAxios.get.mockResolvedValueOnce(mockNews);

        const news = await monitor.getUkrainianNews(24);
        expect(news[0].severity).toBe('critical');
      });
    });
  });

  describe('Категоризація новин', () => {
    const categoryTests = [
      { keyword: 'погода', expectedCategory: 'weather' },
      { keyword: 'політика', expectedCategory: 'politics' },
      { keyword: 'економіка', expectedCategory: 'economy' },
      { keyword: 'аварія', expectedCategory: 'emergency' }
    ];

    categoryTests.forEach(({ keyword, expectedCategory }) => {
      it(`має правильно категоризувати новини з ключовим словом "${keyword}"`, async () => {
        const mockNews = {
          data: {
            articles: [
              {
                title: `Новина про ${keyword}`,
                description: `Детальна інформація про ${keyword}`,
                url: 'https://example.com/news',
                publishedAt: new Date().toISOString(),
                source: { name: 'Джерело' }
              }
            ]
          }
        };

        mockedAxios.get.mockResolvedValueOnce(mockNews);

        const news = await monitor.getUkrainianNews(24);
        expect(news[0].category).toBe(expectedCategory);
      });
    });
  });
}); 