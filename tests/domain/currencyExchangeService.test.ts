// Тести для CurrencyExchangeService
import { CurrencyExchangeService, CurrencyData, ExchangeRate } from '../../src/domain/currencyExchangeService';

// Mock fetch для тестування
global.fetch = jest.fn();

describe('CurrencyExchangeService', () => {
  let service: CurrencyExchangeService;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    service = new CurrencyExchangeService();
    mockFetch.mockClear();
    service.clearCache(); // Очищуємо кеш перед кожним тестом
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getCurrencyRate', () => {
    const mockExchangeRateData: ExchangeRate[] = [{
      r030: 840,
      txt: 'Долар США',
      rate: 41.5261,
      cc: 'USD',
      exchangedate: '02.06.2025'
    }];

    it('повинен успішно отримати курс валюти', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockExchangeRateData,
      } as Response);

      const result = await service.getCurrencyRate('USD');

      expect(result).toEqual({
        code: 'USD',
        name: 'Долар США',
        rate: 41.5261,
        date: '02.06.2025'
      });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json'
      );
    });

    it('повинен повернути null при помилці HTTP', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const result = await service.getCurrencyRate('INVALID');

      expect(result).toBeNull();
    });

    it('повинен повернути null якщо валюта не знайдена', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      const result = await service.getCurrencyRate('UNKNOWN');

      expect(result).toBeNull();
    });

    it('повинен повернути null при помилці мережі', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.getCurrencyRate('USD');

      expect(result).toBeNull();
    });

    it('повинен використовувати кеш для повторних запитів', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockExchangeRateData,
      } as Response);

      // Перший запит
      const result1 = await service.getCurrencyRate('USD');
      // Другий запит
      const result2 = await service.getCurrencyRate('USD');

      expect(result1).toEqual(result2);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Тільки один запит до API
    });

    it('повинен обновити кеш після закінчення таймауту', async () => {
      // Мокаємо Date.now для контролю часу
      const originalDateNow = Date.now;
      let currentTime = 1000000;
      Date.now = jest.fn(() => currentTime);

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockExchangeRateData,
      } as Response);

      // Перший запит
      await service.getCurrencyRate('USD');
      
      // Проміжуємо час на більше ніж cacheTimeout (30 хвилин = 1800000 мс)
      currentTime += 1800001;
      
      // Другий запит після таймауту
      await service.getCurrencyRate('USD');

      expect(mockFetch).toHaveBeenCalledTimes(2);

      // Відновлюємо оригінальний Date.now
      Date.now = originalDateNow;
    });
  });

  describe('getAllCurrencyRates', () => {
    const mockAllRatesData: ExchangeRate[] = [
      {
        r030: 840,
        txt: 'Долар США',
        rate: 41.5261,
        cc: 'USD',
        exchangedate: '02.06.2025'
      },
      {
        r030: 978,
        txt: 'Євро',
        rate: 47.0740,
        cc: 'EUR',
        exchangedate: '02.06.2025'
      }
    ];

    it('повинен отримати всі курси валют', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAllRatesData,
      } as Response);

      const result = await service.getAllCurrencyRates();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        code: 'USD',
        name: 'Долар США',
        rate: 41.5261,
        date: '02.06.2025'
      });
      expect(result[1]).toEqual({
        code: 'EUR',
        name: 'Євро',
        rate: 47.0740,
        date: '02.06.2025'
      });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json'
      );
    });

    it('повинен повернути порожній масив при помилці', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.getAllCurrencyRates();

      expect(result).toEqual([]);
    });
  });

  describe('getPopularCurrencies', () => {
    it('повинен отримати популярні валюти', async () => {
      const mockUSDData: ExchangeRate[] = [{
        r030: 840,
        txt: 'Долар США',
        rate: 41.5261,
        cc: 'USD',
        exchangedate: '02.06.2025'
      }];

      const mockEURData: ExchangeRate[] = [{
        r030: 978,
        txt: 'Євро',
        rate: 47.0740,
        cc: 'EUR',
        exchangedate: '02.06.2025'
      }];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUSDData,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockEURData,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [], // GBP не знайдено
        } as Response);

      const result = await service.getPopularCurrencies();

      expect(result).toHaveLength(2); // USD та EUR
      expect(result[0].code).toBe('USD');
      expect(result[1].code).toBe('EUR');
    });

    it('повинен обробити випадок коли жодна валюта не знайдена', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      const result = await service.getPopularCurrencies();

      expect(result).toEqual([]);
    });
  });

  describe('convertCurrency', () => {
    const mockUSDData: ExchangeRate[] = [{
      r030: 840,
      txt: 'Долар США',
      rate: 41.5261,
      cc: 'USD',
      exchangedate: '02.06.2025'
    }];

    const mockEURData: ExchangeRate[] = [{
      r030: 978,
      txt: 'Євро',
      rate: 47.0740,
      cc: 'EUR',
      exchangedate: '02.06.2025'
    }];

    it('повинен конвертувати валюту в гривні', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUSDData,
      } as Response);

      const result = await service.convertCurrency(100, 'USD');

      expect(result).toEqual({
        amount: 100,
        result: 4152.61,
        fromCurrency: {
          code: 'USD',
          name: 'Долар США',
          rate: 41.5261,
          date: '02.06.2025'
        }
      });
    });

    it('повинен конвертувати валюту через гривні', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUSDData,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockEURData,
        } as Response);

      const result = await service.convertCurrency(100, 'USD', 'EUR');

      expect(result?.amount).toBe(100);
      expect(result?.result).toBeCloseTo(88.21, 2); // 100 * 41.5261 / 47.0740
      expect(result?.fromCurrency).toEqual({
        code: 'USD',
        name: 'Долар США',
        rate: 41.5261,
        date: '02.06.2025'
      });
      expect(result?.toCurrency).toEqual({
        code: 'EUR',
        name: 'Євро',
        rate: 47.0740,
        date: '02.06.2025'
      });
    });

    it('повинен повернути null якщо початкова валюта не знайдена', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      const result = await service.convertCurrency(100, 'INVALID');

      expect(result).toBeNull();
    });

    it('повинен повернути null якщо цільова валюта не знайдена', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUSDData,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        } as Response);

      const result = await service.convertCurrency(100, 'USD', 'INVALID');

      expect(result).toBeNull();
    });
  });

  describe('getSupportedCurrencies', () => {
    it('повинен повернути список підтримуваних валют', () => {
      const supported = service.getSupportedCurrencies();

      expect(supported).toContainEqual(
        expect.objectContaining({
          code: 'USD',
          name: 'Долар США',
          symbol: '$'
        })
      );
      expect(supported).toContainEqual(
        expect.objectContaining({
          code: 'EUR',
          name: 'Євро',
          symbol: '€'
        })
      );
      expect(supported.length).toBeGreaterThan(5);
    });

    it('всі валюти повинні мати необхідні поля', () => {
      const supported = service.getSupportedCurrencies();

      supported.forEach(currency => {
        expect(currency).toHaveProperty('code');
        expect(currency).toHaveProperty('name');
        expect(currency).toHaveProperty('symbol');
        expect(typeof currency.code).toBe('string');
        expect(typeof currency.name).toBe('string');
        expect(typeof currency.symbol).toBe('string');
      });
    });
  });

  describe('clearCache', () => {
    it('повинен очистити кеш', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [{
          r030: 840,
          txt: 'Долар США',
          rate: 41.5261,
          cc: 'USD',
          exchangedate: '02.06.2025'
        }],
      } as Response);

      // Робимо запит для заповнення кешу
      await service.getCurrencyRate('USD');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Очищуємо кеш
      service.clearCache();

      // Робимо ще один запит - повинен зробити новий запит до API
      await service.getCurrencyRate('USD');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('інтеграційні тести з різними сценаріями', () => {
    it('повинен обробити великі числа при конвертації', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{
          r030: 840,
          txt: 'Долар США',
          rate: 41.5261,
          cc: 'USD',
          exchangedate: '02.06.2025'
        }],
      } as Response);

      const result = await service.convertCurrency(1000000, 'USD');

      expect(result?.result).toBe(41526100);
    });

    it('повинен обробити дрібні числа при конвертації', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{
          r030: 840,
          txt: 'Долар США',
          rate: 41.5261,
          cc: 'USD',
          exchangedate: '02.06.2025'
        }],
      } as Response);

      const result = await service.convertCurrency(0.01, 'USD');

      expect(result?.result).toBeCloseTo(0.415261, 6);
    });

    it('повинен працювати з різними кодами валют', async () => {
      const currencies = ['USD', 'EUR', 'GBP', 'PLN', 'CHF'];
      
      mockFetch.mockImplementation((url) => {
        const urlStr = url as string;
        if (urlStr.includes('USD')) {
          return Promise.resolve({
            ok: true,
            json: async () => [{ r030: 840, txt: 'Долар США', rate: 41.5261, cc: 'USD', exchangedate: '02.06.2025' }],
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        } as Response);
      });

      for (const currency of currencies) {
        const result = await service.getCurrencyRate(currency);
        if (currency === 'USD') {
          expect(result).not.toBeNull();
        }
      }
    });
  });
}); 