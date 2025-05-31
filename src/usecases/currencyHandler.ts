// Обробник команд для курсів валют
import { CurrencyExchangeService, CurrencyData } from '../domain/currencyExchangeService';
import { CurrencyCommandsFuzzyMatcher } from '../config/vocabulary/currencyCommandsFuzzyMatcher';

export interface CurrencyResponse {
  shouldRespond: boolean;
  response: string;
  responseType: 'currency_rate' | 'currency_convert' | 'currency_list' | 'error';
}

export class CurrencyHandler {
  private currencyService: CurrencyExchangeService;
  private matcher: CurrencyCommandsFuzzyMatcher;

  constructor() {
    this.currencyService = new CurrencyExchangeService();
    this.matcher = new CurrencyCommandsFuzzyMatcher();
  }

  /**
   * Обробити повідомлення користувача
   */
  async handleMessage(text: string): Promise<CurrencyResponse> {
    if (!text || text.trim().length === 0) {
      return {
        shouldRespond: false,
        response: '',
        responseType: 'error'
      };
    }

    // Використовуємо новий FuzzyMatcher для розпізнавання команд
    const command = this.matcher.findCurrencyCommand(text);
    
    if (!command) {
      return {
        shouldRespond: false,
        response: '',
        responseType: 'error'
      };
    }

    try {
      switch (command.type) {
        case 'rate_query':
          if (command.parameters?.currency) {
            return await this.handleCurrencyRateQuery(command.parameters.currency);
          }
          break;
          
        case 'conversion':
          if (command.parameters?.amount && command.parameters?.fromCurrency) {
            return await this.handleCurrencyConversion({
              amount: command.parameters.amount,
              fromCode: command.parameters.fromCurrency,
              toCode: command.parameters.toCurrency || 'UAH'
            });
          }
          break;
          
        case 'popular':
          return await this.handlePopularCurrenciesQuery();
          
        case 'list':
          return await this.handleCurrencyListQuery();
      }
    } catch (error) {
      console.error('Помилка обробки валютної команди:', error);
      return {
        shouldRespond: true,
        response: '❌ Виникла помилка при обробці запиту. Спробуйте пізніше.',
        responseType: 'error'
      };
    }
    return {
      shouldRespond: false,
      response: '',
      responseType: 'error'
    };
  }

  /**
   * Обробити запит курсу конкретної валюти
   */
  private async handleCurrencyRateQuery(currencyCode: string): Promise<CurrencyResponse> {
    try {
      const currencyData = await this.currencyService.getCurrencyRate(currencyCode);
      
      if (!currencyData) {
        return {
          shouldRespond: true,
          response: `❌ Не вдалося знайти курс для валюти "${currencyCode}". Спробуйте використати стандартний код валюти (наприклад, USD, EUR).`,
          responseType: 'error'
        };
      }

      const formattedRate = currencyData.rate.toFixed(4);
      const supportedCurrency = this.currencyService.getSupportedCurrencies()
        .find(c => c.code === currencyData.code);
      
      const symbol = supportedCurrency?.symbol || currencyData.code;
      
      return {
        shouldRespond: true,
        response: `💱 **Курс ${currencyData.name}**\n\n` +
                 `${symbol} 1 ${currencyData.code} = ${formattedRate} ₴\n` +
                 `📅 Дата: ${currencyData.date}\n\n` +
                 `🏦 _Офіційний курс НБУ_`,
        responseType: 'currency_rate'
      };
    } catch (error) {
      console.error('Помилка отримання курсу валюти:', error);
      return {
        shouldRespond: true,
        response: '❌ Виникла помилка при отриманні курсу валюти. Спробуйте пізніше.',
        responseType: 'error'
      };
    }
  }

  /**
   * Обробити конвертацію валют
   */
  private async handleCurrencyConversion(conversionData: {
    amount: number;
    fromCode: string;
    toCode?: string;
  }): Promise<CurrencyResponse> {
    try {
      const result = await this.currencyService.convertCurrency(
        conversionData.amount,
        conversionData.fromCode,
        conversionData.toCode || 'UAH'
      );

      if (!result) {
        return {
          shouldRespond: true,
          response: `❌ Не вдалося конвертувати валюту. Перевірте правильність кодів валют.`,
          responseType: 'error'
        };
      }

      const fromSymbol = this.getCurrencySymbol(result.fromCurrency.code);
      const toSymbol = result.toCurrency ? 
        this.getCurrencySymbol(result.toCurrency.code) : '₴';
      
      const formattedResult = result.result.toFixed(2);
      
      let response = `💸 **Конвертація валют**\n\n` +
                    `${fromSymbol} ${result.amount} ${result.fromCurrency.code} = ` +
                    `${toSymbol} ${formattedResult} ${result.toCurrency?.code || 'UAH'}\n\n`;

      if (result.toCurrency) {
        response += `📊 Курси НБУ:\n` +
                   `• ${result.fromCurrency.code}: ${result.fromCurrency.rate.toFixed(4)} ₴\n` +
                   `• ${result.toCurrency.code}: ${result.toCurrency.rate.toFixed(4)} ₴\n\n`;
      } else {
        response += `📊 Курс НБУ: ${result.fromCurrency.rate.toFixed(4)} ₴\n\n`;
      }

      response += `📅 Дата: ${result.fromCurrency.date}`;

      return {
        shouldRespond: true,
        response,
        responseType: 'currency_convert'
      };
    } catch (error) {
      console.error('Помилка конвертації валюти:', error);
      return {
        shouldRespond: true,
        response: '❌ Виникла помилка при конвертації валюти. Спробуйте пізніше.',
        responseType: 'error'
      };
    }
  }

  /**
   * Обробити запит списку валют
   */
  private async handleCurrencyListQuery(): Promise<CurrencyResponse> {
    const supportedCurrencies = this.currencyService.getSupportedCurrencies();
    
    let response = `📋 **Підтримувані валюти:**\n\n`;
    
    supportedCurrencies.forEach(currency => {
      response += `${currency.symbol} **${currency.code}** - ${currency.name}\n`;
    });

    response += `\n💡 **Приклади використання:**\n` +
               `• "курс долара" або "USD"\n` +
               `• "100 USD в UAH"\n` +
               `• "50 EUR в USD"\n` +
               `• "популярні курси"`;

    return {
      shouldRespond: true,
      response,
      responseType: 'currency_list'
    };
  }

  /**
   * Обробити запит популярних курсів
   */
  private async handlePopularCurrenciesQuery(): Promise<CurrencyResponse> {
    try {
      const popularCurrencies = await this.currencyService.getPopularCurrencies();
      
      if (popularCurrencies.length === 0) {
        return {
          shouldRespond: true,
          response: '❌ Не вдалося отримати курси валют. Спробуйте пізніше.',
          responseType: 'error'
        };
      }

      let response = `💰 **Популярні курси валют**\n\n`;
      
      popularCurrencies.forEach(currency => {
        const symbol = this.getCurrencySymbol(currency.code);
        const formattedRate = currency.rate.toFixed(4);
        response += `${symbol} **${currency.code}**: ${formattedRate} ₴\n`;
      });

      response += `\n📅 Дата: ${popularCurrencies[0].date}\n` +
                 `🏦 _Офіційні курси НБУ_`;

      return {
        shouldRespond: true,
        response,
        responseType: 'currency_rate'
      };
    } catch (error) {
      console.error('Помилка отримання популярних курсів:', error);
      return {
        shouldRespond: true,
        response: '❌ Виникла помилка при отриманні курсів валют. Спробуйте пізніше.',
        responseType: 'error'
      };
    }
  }

  /**
   * Отримати символ валюти
   */
  private getCurrencySymbol(code: string): string {
    const currency = this.currencyService.getSupportedCurrencies()
      .find(c => c.code === code);
    return currency?.symbol || code;
  }
} 