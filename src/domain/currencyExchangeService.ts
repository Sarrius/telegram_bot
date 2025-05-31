// Сервіс для отримання курсів валют з НБУ
export interface ExchangeRate {
  r030: number;
  txt: string;
  rate: number;
  cc: string;
  exchangedate: string;
}

export interface CurrencyData {
  code: string;
  name: string;
  rate: number;
  date: string;
}

export class CurrencyExchangeService {
  private readonly baseUrl = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange';
  private cachedRates: Map<string, { data: CurrencyData; timestamp: number }> = new Map();
  private readonly cacheTimeout = 30 * 60 * 1000; // 30 хвилин

  /**
   * Отримати курс конкретної валюти
   */
  async getCurrencyRate(currencyCode: string): Promise<CurrencyData | null> {
    const cacheKey = currencyCode.toUpperCase();
    
    // Перевіряємо кеш
    const cached = this.cachedRates.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.baseUrl}?valcode=${currencyCode}&json`);
      
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        return null;
      }

      const data: ExchangeRate[] = await response.json();
      
      if (data.length === 0) {
        return null;
      }

      const rate = data[0];
      const currencyData: CurrencyData = {
        code: rate.cc,
        name: rate.txt,
        rate: rate.rate,
        date: rate.exchangedate
      };

      // Зберігаємо в кеш
      this.cachedRates.set(cacheKey, {
        data: currencyData,
        timestamp: Date.now()
      });

      return currencyData;
    } catch (error) {
      console.error('Помилка отримання курсу валюти:', error);
      return null;
    }
  }

  /**
   * Отримати всі курси валют
   */
  async getAllCurrencyRates(): Promise<CurrencyData[]> {
    try {
      const response = await fetch(`${this.baseUrl}?json`);
      
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        return [];
      }

      const data: ExchangeRate[] = await response.json();
      
      return data.map(rate => ({
        code: rate.cc,
        name: rate.txt,
        rate: rate.rate,
        date: rate.exchangedate
      }));
    } catch (error) {
      console.error('Помилка отримання курсів валют:', error);
      return [];
    }
  }

  /**
   * Отримати курси популярних валют
   */
  async getPopularCurrencies(): Promise<CurrencyData[]> {
    const popularCodes = ['USD', 'EUR', 'GBP', 'PLN', 'CHF'];
    const results: CurrencyData[] = [];

    for (const code of popularCodes) {
      const rate = await this.getCurrencyRate(code);
      if (rate) {
        results.push(rate);
      }
    }

    return results;
  }

  /**
   * Конвертувати валюту
   */
  async convertCurrency(amount: number, fromCode: string, toCode: string = 'UAH'): Promise<{
    amount: number;
    result: number;
    fromCurrency: CurrencyData;
    toCurrency?: CurrencyData;
  } | null> {
    const fromCurrency = await this.getCurrencyRate(fromCode);
    
    if (!fromCurrency) {
      return null;
    }

    if (toCode === 'UAH') {
      // Конвертація в гривні
      return {
        amount,
        result: amount * fromCurrency.rate,
        fromCurrency
      };
    } else {
      // Конвертація через гривні
      const toCurrency = await this.getCurrencyRate(toCode);
      if (!toCurrency) {
        return null;
      }

      const uahAmount = amount * fromCurrency.rate;
      const result = uahAmount / toCurrency.rate;

      return {
        amount,
        result,
        fromCurrency,
        toCurrency
      };
    }
  }

  /**
   * Очистити кеш
   */
  clearCache(): void {
    this.cachedRates.clear();
  }

  /**
   * Отримати підтримувані валюти з українськими назвами
   */
  getSupportedCurrencies(): Array<{ code: string; name: string; symbol: string }> {
    return [
      { code: 'USD', name: 'Долар США', symbol: '$' },
      { code: 'EUR', name: 'Євро', symbol: '€' },
      { code: 'GBP', name: 'Фунт стерлінгів', symbol: '£' },
      { code: 'PLN', name: 'Польський злотий', symbol: 'zł' },
      { code: 'CHF', name: 'Швейцарський франк', symbol: 'CHF' },
      { code: 'CAD', name: 'Канадський долар', symbol: 'C$' },
      { code: 'AUD', name: 'Австралійський долар', symbol: 'A$' },
      { code: 'JPY', name: 'Японська єна', symbol: '¥' },
      { code: 'CNY', name: 'Китайський юань', symbol: '¥' },
      { code: 'CZK', name: 'Чеська крона', symbol: 'Kč' },
      { code: 'SEK', name: 'Шведська крона', symbol: 'kr' },
      { code: 'NOK', name: 'Норвезька крона', symbol: 'kr' },
      { code: 'DKK', name: 'Данська крона', symbol: 'kr' }
    ];
  }
} 