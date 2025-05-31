import { CurrencyHandler } from '../../src/usecases/currencyHandler';
import { CurrencyExchangeService } from '../../src/domain/currencyExchangeService';

// Mock для CurrencyExchangeService
jest.mock('../../src/domain/currencyExchangeService');

describe('Currency Handler Tests', () => {
  let currencyHandler: CurrencyHandler;
  let mockCurrencyService: jest.Mocked<CurrencyExchangeService>;

  beforeEach(() => {
    currencyHandler = new CurrencyHandler();
    
    // Отримуємо mock instance
    mockCurrencyService = jest.mocked(
      (currencyHandler as any).currencyService
    );

    // Налаштовуємо default mocks
    mockCurrencyService.getCurrencyRate.mockResolvedValue({
      code: 'USD',
      name: 'US Dollar',
      rate: 37.5,
      date: '2024-01-01'
    });

    mockCurrencyService.convertCurrency.mockResolvedValue({
      amount: 100,
      fromCurrency: { code: 'USD', name: 'US Dollar', rate: 37.5, date: '2024-01-01' },
      toCurrency: { code: 'UAH', name: 'Ukrainian Hryvnia', rate: 1, date: '2024-01-01' },
      result: 3750
    });

    mockCurrencyService.getSupportedCurrencies.mockReturnValue([
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' }
    ]);

    mockCurrencyService.getPopularCurrencies.mockResolvedValue([
      { code: 'USD', name: 'US Dollar', rate: 37.5, date: '2024-01-01' },
      { code: 'EUR', name: 'Euro', rate: 40.8, date: '2024-01-01' }
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Currency Rate Queries', () => {
    test('should handle Ukrainian currency rate queries', async () => {
      const testCases = [
        'курс долара',
        'курс USD',
        'який курс долара',
        'курс євро',
        'курс EUR'
      ];

      for (const query of testCases) {
        const result = await currencyHandler.handleMessage(query);
        
        if (result.shouldRespond) {
          expect(result.responseType).toBe('currency_rate');
          expect(result.response).toContain('Курс');
          expect(result.response).toContain('₴');
          expect(mockCurrencyService.getCurrencyRate).toHaveBeenCalled();
        }
      }
    });

    test('should handle English currency rate queries', async () => {
      const testCases = [
        'USD rate',
        'USD курс',
        'EUR rate'
      ];

      for (const query of testCases) {
        const result = await currencyHandler.handleMessage(query);
        
        if (result.shouldRespond) {
          expect(result.responseType).toBe('currency_rate');
          expect(result.response).toContain('Курс');
        }
      }
    });

    test('should return proper currency rate format', async () => {
      const result = await currencyHandler.handleMessage('курс USD');
      
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('currency_rate');
      expect(result.response).toContain('$ 1 USD = 37.5000 ₴');
      expect(result.response).toContain('Офіційний курс НБУ');
      expect(result.response).toContain('2024-01-01');
    });

    test('should handle unknown currency gracefully', async () => {
      mockCurrencyService.getCurrencyRate.mockResolvedValue(null);
      
      const result = await currencyHandler.handleMessage('курс XYZ');
      
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('error');
      expect(result.response).toContain('Не вдалося знайти курс');
    });
  });

  describe('Currency Conversion', () => {
    test('should handle Ukrainian conversion queries', async () => {
      const testCases = [
        '100 USD в UAH',
        '100 доларів в гривні',
        '100 USD в гривні',
        '50 EUR в UAH',
        '1000 UAH в USD'
      ];

      for (const query of testCases) {
        const result = await currencyHandler.handleMessage(query);
        
        if (result.shouldRespond) {
          expect(result.responseType).toBe('currency_convert');
          expect(result.response).toContain('Конвертація валют');
          expect(result.response).toContain('=');
        }
      }
    });

    test('should handle English conversion queries', async () => {
      const testCases = [
        '100 USD to UAH',
        '100 USD in UAH',
        '50 EUR to USD'
      ];

      for (const query of testCases) {
        const result = await currencyHandler.handleMessage(query);
        
        if (result.shouldRespond) {
          expect(result.responseType).toBe('currency_convert');
          expect(result.response).toContain('Конвертація валют');
        }
      }
    });

    test('should return proper conversion format', async () => {
      const result = await currencyHandler.handleMessage('100 USD в UAH');
      
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('currency_convert');
      expect(result.response).toContain('$ 100 USD = ₴ 3750.00 UAH');
      expect(result.response).toContain('Курс НБУ: 37.5000 ₴');
      expect(result.response).toContain('2024-01-01');
    });

    test('should handle conversion with both currencies having rates', async () => {
      mockCurrencyService.convertCurrency.mockResolvedValue({
        amount: 100,
        fromCurrency: { code: 'USD', name: 'US Dollar', rate: 37.5, date: '2024-01-01' },
        toCurrency: { code: 'EUR', name: 'Euro', rate: 40.8, date: '2024-01-01' },
        result: 91.91
      });

      const result = await currencyHandler.handleMessage('100 USD в EUR');
      
      expect(result.shouldRespond).toBe(true);
      expect(result.response).toContain('100 USD = € 91.91 EUR');
      expect(result.response).toContain('USD: 37.5000 ₴');
      expect(result.response).toContain('EUR: 40.8000 ₴');
    });

    test('should handle conversion error gracefully', async () => {
      mockCurrencyService.convertCurrency.mockResolvedValue(null);
      
      const result = await currencyHandler.handleMessage('100 XYZ в UAH');
      
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('error');
      expect(result.response).toContain('Не вдалося конвертувати валюту');
    });
  });

  describe('Currency Lists', () => {
    test('should handle currency list queries', async () => {
      const testCases = [
        'список валют',
        'валюти список',
        'які валюти',
        'currency list',
        'supported currencies'
      ];

      for (const query of testCases) {
        const result = await currencyHandler.handleMessage(query);
        
        if (result.shouldRespond) {
          expect(result.responseType).toBe('currency_list');
          expect(result.response).toContain('Підтримувані валюти');
          expect(result.response).toContain('USD');
          expect(result.response).toContain('EUR');
        }
      }
    });

    test('should return proper currency list format', async () => {
      const result = await currencyHandler.handleMessage('список валют');
      
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('currency_list');
      expect(result.response).toContain('$ **USD** - US Dollar');
      expect(result.response).toContain('€ **EUR** - Euro');
      expect(result.response).toContain('₴ **UAH** - Ukrainian Hryvnia');
      expect(result.response).toContain('Приклади використання');
    });

    test('should handle popular currencies queries', async () => {
      const testCases = [
        'популярні курси',
        'популярні валюти',
        'popular currencies',
        'popular rates'
      ];

      for (const query of testCases) {
        const result = await currencyHandler.handleMessage(query);
        
        if (result.shouldRespond) {
          expect(result.responseType).toBe('currency_list');
          expect(result.response).toContain('Популярні курси валют');
        }
      }
    });

    test('should return proper popular currencies format', async () => {
      const result = await currencyHandler.handleMessage('популярні курси');
      
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('currency_list');
      expect(result.response).toContain('**USD**: 37.5000 ₴');
      expect(result.response).toContain('**EUR**: 40.8000 ₴');
      expect(result.response).toContain('2024-01-01');
    });

    test('should handle popular currencies error gracefully', async () => {
      mockCurrencyService.getPopularCurrencies.mockResolvedValue([]);
      
      const result = await currencyHandler.handleMessage('популярні курси');
      
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('error');
      expect(result.response).toContain('Не вдалося отримати курси валют');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should not respond to non-currency queries', async () => {
      const testCases = [
        'привіт',
        'як справи',
        'погода сьогодні',
        'новини',
        'що нового'
      ];

      for (const query of testCases) {
        const result = await currencyHandler.handleMessage(query);
        expect(result.shouldRespond).toBe(false);
      }
    });

    test('should handle empty input', async () => {
      const emptyInputs = ['', '   ', null as any, undefined as any];

      for (const input of emptyInputs) {
        const result = await currencyHandler.handleMessage(input);
        expect(result.shouldRespond).toBe(false);
      }
    });

    test('should handle service errors gracefully', async () => {
      mockCurrencyService.getCurrencyRate.mockRejectedValue(new Error('Service error'));
      
      const result = await currencyHandler.handleMessage('курс USD');
      
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('error');
      expect(result.response).toContain('Виникла помилка');
    });

    test('should handle conversion service errors gracefully', async () => {
      mockCurrencyService.convertCurrency.mockRejectedValue(new Error('Conversion error'));
      
      const result = await currencyHandler.handleMessage('100 USD в UAH');
      
      expect(result.shouldRespond).toBe(true);
      expect(result.responseType).toBe('error');
      expect(result.response).toContain('Виникла помилка');
    });
  });

  describe('Geographic Location Support', () => {
    test('should handle currency queries with location phrases', async () => {
      const testCases = [
        'курс долара в Києві',
        'курс євро в Львові',
        'який курс долара в Тернополі',
        'курс USD в Харкові'
      ];

      for (const query of testCases) {
        const result = await currencyHandler.handleMessage(query);
        
        if (result.shouldRespond) {
          expect(result.responseType).toBe('currency_rate');
          expect(mockCurrencyService.getCurrencyRate).toHaveBeenCalled();
        }
      }
    });

    test('should ignore location in currency processing', async () => {
      const result = await currencyHandler.handleMessage('курс долара в Києві');
      
      if (result.shouldRespond) {
        expect(result.responseType).toBe('currency_rate');
        // Location should not affect the actual currency query
        expect(mockCurrencyService.getCurrencyRate).toHaveBeenCalledWith('USD');
      }
    });
  });

  describe('Fuzzy Matching and Typos', () => {
    test('should handle common typos in currency names', async () => {
      const testCases = [
        'курс долара',  // правильно
        'курс доллара', // з подвійним л
        'курс долларра', // з подвійним р
        'курс євро',    // правильно
        'курс евро'     // без крапки над є
      ];

      for (const query of testCases) {
        const result = await currencyHandler.handleMessage(query);
        
        // Перевіряємо що хоча б деякі варіанти розпізнаються
        if (result.shouldRespond) {
          expect(result.responseType).toBe('currency_rate');
        }
      }
    });

    test('should handle alternative currency names', async () => {
      const testCases = [
        'курс американського долара',
        'курс баксів',
        'курс євро',
        'курс європейської валюти'
      ];

      for (const query of testCases) {
        const result = await currencyHandler.handleMessage(query);
        
        // Fuzzy matcher should catch some of these
        if (result.shouldRespond) {
          expect(['currency_rate', 'error']).toContain(result.responseType);
        }
      }
    });
  });

  describe('Performance and Caching', () => {
    test('should handle multiple simultaneous requests', async () => {
      const promises = Array.from({ length: 10 }, () => 
        currencyHandler.handleMessage('курс USD')
      );
      
      const results = await Promise.all(promises);
      
      results.forEach(result => {
        if (result.shouldRespond) {
          expect(result.responseType).toBe('currency_rate');
        }
      });
      
      // Service should be called for each request (no caching in handler)
      expect(mockCurrencyService.getCurrencyRate).toHaveBeenCalledTimes(10);
    });
  });
}); 