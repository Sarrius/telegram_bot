// Тести для CurrencyHandler
import { CurrencyHandler, CurrencyResponse } from '../../src/usecases/currencyHandler';
import { CurrencyExchangeService } from '../../src/domain/currencyExchangeService';

// Mock CurrencyExchangeService
jest.mock('../../src/domain/currencyExchangeService');

describe('CurrencyHandler', () => {
  let handler: CurrencyHandler;
  let mockService: jest.Mocked<CurrencyExchangeService>;

  beforeEach(() => {
    mockService = new CurrencyExchangeService() as jest.Mocked<CurrencyExchangeService>;
    handler = new CurrencyHandler();
    // Заміняємо сервіс у хендлері на мок
    (handler as any).currencyService = mockService;
    
    // Мокаємо getSupportedCurrencies
    mockService.getSupportedCurrencies.mockReturnValue([
      { code: 'USD', name: 'Долар США', symbol: '$' },
      { code: 'EUR', name: 'Євро', symbol: '€' },
      { code: 'GBP', name: 'Фунт стерлінгів', symbol: '£' },
      { code: 'PLN', name: 'Польський злотий', symbol: 'zł' },
      { code: 'CHF', name: 'Швейцарський франк', symbol: 'CHF' }
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleMessage', () => {
    const mockUSDRate = {
      code: 'USD',
      name: 'Долар США',
      rate: 41.5261,
      date: '02.06.2025'
    };

    const mockEURRate = {
      code: 'EUR',
      name: 'Євро',
      rate: 47.0740,
      date: '02.06.2025'
    };

    const mockPopularRates = [
      mockUSDRate,
      mockEURRate,
      {
        code: 'GBP',
        name: 'Фунт стерлінгів',
        rate: 54.2100,
        date: '02.06.2025'
      }
    ];

    describe('запити курсів валют', () => {
      it('повинен обробити запит курсу долара (українською)', async () => {
        mockService.getCurrencyRate.mockResolvedValueOnce(mockUSDRate);

        const result = await handler.handleMessage('курс долара');

        expect(result.shouldRespond).toBe(true);
        expect(result.responseType).toBe('currency_rate');
        expect(result.response).toContain('Долар США');
        expect(result.response).toContain('41.5261 ₴');
        expect(result.response).toContain('02.06.2025');
        expect(mockService.getCurrencyRate).toHaveBeenCalledWith('USD');
      });

      it('повинен обробити запит курсу євро (українською)', async () => {
        mockService.getCurrencyRate.mockResolvedValueOnce(mockEURRate);

        const result = await handler.handleMessage('курс євро');

        expect(result.shouldRespond).toBe(true);
        expect(result.responseType).toBe('currency_rate');
        expect(result.response).toContain('Євро');
        expect(result.response).toContain('47.0740 ₴');
        expect(mockService.getCurrencyRate).toHaveBeenCalledWith('EUR');
      });

      it('повинен обробити прямий запит коду валюти', async () => {
        mockService.getCurrencyRate.mockResolvedValueOnce(mockUSDRate);

        const result = await handler.handleMessage('USD');

        expect(result.shouldRespond).toBe(true);
        expect(result.responseType).toBe('currency_rate');
        expect(result.response).toContain('Долар США');
        expect(mockService.getCurrencyRate).toHaveBeenCalledWith('USD');
      });

      it('повинен обробити запит з різними варіантами назв', async () => {
        mockService.getCurrencyRate.mockResolvedValue(mockUSDRate);

        const queries = [
          'курс доллара',
          'курс долара США', 
          'доллар курс',
          'USD курс',
          'скільки коштує долар',
          'ціна долара'
        ];

        for (const query of queries) {
          const result = await handler.handleMessage(query);
          expect(result.shouldRespond).toBe(true);
          expect(result.responseType).toBe('currency_rate');
        }
      });

      it('повинен обробити помилку отримання курсу', async () => {
        mockService.getCurrencyRate.mockResolvedValueOnce(null);

        const result = await handler.handleMessage('курс долара');

        expect(result.shouldRespond).toBe(true);
        expect(result.responseType).toBe('error');
        expect(result.response).toContain('Не вдалося знайти курс');
        expect(result.response).toContain('USD');
      });
    });

    describe('конвертація валют', () => {
      const mockConversion = {
        amount: 100,
        result: 4152.61,
        fromCurrency: mockUSDRate
      };

      const mockCrossCurrencyConversion = {
        amount: 100,
        result: 88.19,
        fromCurrency: mockUSDRate,
        toCurrency: mockEURRate
      };

      it('повинен конвертувати валюту в гривні', async () => {
        mockService.convertCurrency.mockResolvedValueOnce(mockConversion);

        const result = await handler.handleMessage('100 USD в UAH');

        expect(result.shouldRespond).toBe(true);
        expect(result.responseType).toBe('currency_convert');
        expect(result.response).toContain('Конвертація валют');
        expect(result.response).toContain('100 USD');
        expect(result.response).toContain('4152.61');
        expect(mockService.convertCurrency).toHaveBeenCalledWith(100, 'USD', 'UAH');
      });

      it('повинен конвертувати між валютами', async () => {
        mockService.convertCurrency.mockResolvedValueOnce(mockCrossCurrencyConversion);

        const result = await handler.handleMessage('100 USD в EUR');

        expect(result.shouldRespond).toBe(true);
        expect(result.responseType).toBe('currency_convert');
        expect(result.response).toContain('100 USD');
        expect(result.response).toContain('88.19 EUR');
        expect(mockService.convertCurrency).toHaveBeenCalledWith(100, 'USD', 'EUR');
      });

      it('повинен обробити різні формати конвертації', async () => {
        mockService.convertCurrency.mockResolvedValue(mockConversion);

        const queries = [
          '100 USD в гривні',
          '100 доларів в UAH',
          'конвертувати 100 USD в гривні',
          'скільки буде 100 доларів в гривнях'
        ];

        for (const query of queries) {
          const result = await handler.handleMessage(query);
          expect(result.shouldRespond).toBe(true);
          expect(result.responseType).toBe('currency_convert');
        }
      });

      it('повинен обробити дрібні числа', async () => {
        const smallAmountConversion = {
          amount: 0.5,
          result: 20.76,
          fromCurrency: mockUSDRate
        };
        mockService.convertCurrency.mockResolvedValueOnce(smallAmountConversion);

        const result = await handler.handleMessage('0.5 USD в UAH');

        expect(result.shouldRespond).toBe(true);
        expect(result.response).toContain('0.5 USD');
        expect(result.response).toContain('20.76');
      });

      it('повинен обробити великі числа', async () => {
        const largeAmountConversion = {
          amount: 1000000,
          result: 41526100,
          fromCurrency: mockUSDRate
        };
        mockService.convertCurrency.mockResolvedValueOnce(largeAmountConversion);

        const result = await handler.handleMessage('1000000 USD в UAH');

        expect(result.shouldRespond).toBe(true);
        expect(result.response).toContain('1000000 USD');
        expect(result.response).toContain('41526100');
      });

      it('повинен обробити помилку конвертації', async () => {
        mockService.convertCurrency.mockResolvedValueOnce(null);

        const result = await handler.handleMessage('100 INVALID в UAH');

        expect(result.shouldRespond).toBe(true);
        expect(result.responseType).toBe('error');
        expect(result.response).toContain('Не вдалося конвертувати');
      });
    });

    describe('популярні курси', () => {
      it('повинен показати популярні курси', async () => {
        mockService.getPopularCurrencies.mockResolvedValueOnce(mockPopularRates);

        const result = await handler.handleMessage('популярні курси');

        expect(result.shouldRespond).toBe(true);
        expect(result.responseType).toBe('currency_rate');
        expect(result.response).toContain('Популярні курси валют');
        expect(result.response).toContain('USD');
        expect(result.response).toContain('41.5261 ₴');
        expect(result.response).toContain('EUR');
        expect(result.response).toContain('47.0740 ₴');
        expect(result.response).toContain('GBP');
        expect(result.response).toContain('54.2100 ₴');
      });

      it('повинен обробити різні варіанти запиту популярних курсів', async () => {
        mockService.getPopularCurrencies.mockResolvedValue(mockPopularRates);

        const queries = [
          'курси валют',
          'показати курси',
          'основні курси',
          'валютні курси',
          'курси популярних валют'
        ];

        for (const query of queries) {
          const result = await handler.handleMessage(query);
          expect(result.shouldRespond).toBe(true);
          expect(result.responseType).toBe('currency_rate');
        }
      });

      it('повинен обробити порожній список популярних курсів', async () => {
        mockService.getPopularCurrencies.mockResolvedValueOnce([]);

        const result = await handler.handleMessage('популярні курси');

        expect(result.shouldRespond).toBe(true);
        expect(result.responseType).toBe('error');
        expect(result.response).toContain('Не вдалося отримати курси валют');
      });
    });

    describe('список валют', () => {
      const mockSupportedCurrencies = [
        { code: 'USD', name: 'Долар США', symbol: '$' },
        { code: 'EUR', name: 'Євро', symbol: '€' },
        { code: 'GBP', name: 'Фунт стерлінгів', symbol: '£' }
      ];

      it('повинен показати список підтримуваних валют', async () => {
        mockService.getSupportedCurrencies.mockReturnValueOnce(mockSupportedCurrencies);

        const result = await handler.handleMessage('список валют');

        expect(result.shouldRespond).toBe(true);
        expect(result.responseType).toBe('currency_list');
        expect(result.response).toContain('Підтримувані валюти');
        expect(result.response).toContain('$ **USD** - Долар США');
        expect(result.response).toContain('€ **EUR** - Євро');
        expect(result.response).toContain('£ **GBP** - Фунт стерлінгів');
      });

      it('повинен обробити різні варіанти запиту списку', async () => {
        mockService.getSupportedCurrencies.mockReturnValue(mockSupportedCurrencies);

        const queries = [
          'які валюти підтримуються',
          'доступні валюти',
          'показати валюти',
          'валюти список'
        ];

        for (const query of queries) {
          const result = await handler.handleMessage(query);
          expect(result.shouldRespond).toBe(true);
          expect(result.responseType).toBe('currency_list');
        }
      });
    });

    describe('не валютні запити', () => {
      it('повинен не розпізнати звичайні повідомлення', async () => {
        const nonCurrencyMessages = [
          'Привіт, як справи?',
          'Hello world',
          'Що нового?',
          'Добрий день',
          'Як погода?',
          'Новини України'
        ];

        for (const message of nonCurrencyMessages) {
          const result = await handler.handleMessage(message);
          expect(result.shouldRespond).toBe(false);
          expect(result.response).toBe('');
        }
      });

      it('повинен не розпізнати повідомлення з числами але без валют', async () => {
        const nonCurrencyMessages = [
          'У мене 100 друзів',
          'Сьогодні 25 грудня',
          'Купив 5 яблук',
          'Температура 20 градусів'
        ];

        for (const message of nonCurrencyMessages) {
          const result = await handler.handleMessage(message);
          expect(result.shouldRespond).toBe(false);
        }
      });
    });

    describe('крайові випадки', () => {
      it('повинен обробити порожнє повідомлення', async () => {
        const result = await handler.handleMessage('');
        expect(result.shouldRespond).toBe(false);
        expect(result.response).toBe('');
      });

      it('повинен обробити повідомлення тільки з пробілами', async () => {
        const result = await handler.handleMessage('   ');
        expect(result.shouldRespond).toBe(false);
        expect(result.response).toBe('');
      });

      it('повинен обробити дуже довге повідомлення', async () => {
        const longMessage = 'курс долара ' + 'дуже довгий текст '.repeat(100);
        mockService.getCurrencyRate.mockResolvedValueOnce(mockUSDRate);

        const result = await handler.handleMessage(longMessage);
        expect(result.shouldRespond).toBe(true);
      });

      it('повинен обробити повідомлення з спеціальними символами', async () => {
        mockService.getCurrencyRate.mockResolvedValueOnce(mockUSDRate);

        const result = await handler.handleMessage('курс долара???!!!');
        expect(result.shouldRespond).toBe(true);
        expect(result.responseType).toBe('currency_rate');
      });
    });
  });



  describe('інтеграційні тести', () => {
          it('повинен обробити послідовність різних запитів', async () => {
        const mockUSDRate = {
          code: 'USD',
          name: 'Долар США',
          rate: 41.5261,
          date: '02.06.2025'
        };

        const mockPopularRates = [
          mockUSDRate,
          {
            code: 'EUR',
            name: 'Євро',
            rate: 47.0740,
            date: '02.06.2025'
          }
        ];

        const mockSupportedCurrencies = [
          { code: 'USD', name: 'Долар США', symbol: '$' },
          { code: 'EUR', name: 'Євро', symbol: '€' }
        ];

        // Налаштовуємо моки
        mockService.getCurrencyRate.mockResolvedValue(mockUSDRate);
        mockService.convertCurrency.mockResolvedValue({
          amount: 100,
          result: 4152.61,
          fromCurrency: mockUSDRate
        });
        mockService.getPopularCurrencies.mockResolvedValue(mockPopularRates);
        mockService.getSupportedCurrencies.mockReturnValue(mockSupportedCurrencies);

      // Тестуємо різні типи запитів
      const results = await Promise.all([
        handler.handleMessage('курс долара'),
        handler.handleMessage('100 USD в UAH'),
        handler.handleMessage('популярні курси'),
        handler.handleMessage('список валют')
      ]);

      expect(results[0].responseType).toBe('currency_rate');
      expect(results[1].responseType).toBe('currency_convert');
      expect(results[2].responseType).toBe('currency_rate');
      expect(results[3].responseType).toBe('currency_list');

      // Всі повинні бути розпізнані як валютні запити
      results.forEach(result => {
        expect(result.shouldRespond).toBe(true);
        expect(result.response.length).toBeGreaterThan(0);
      });
    });
  });
}); 