// Fuzzy matcher для команд курсів валют
export interface CurrencyCommandMatch {
  command: string;
  confidence: number;
  type: 'rate_query' | 'conversion' | 'list' | 'popular' | 'help';
  parameters?: {
    currency?: string;
    amount?: number;
    fromCurrency?: string | null;
    toCurrency?: string | null;
  };
}

export class CurrencyCommandsFuzzyMatcher {
  // Мапінг валют з варіантами назв
  private readonly currencyMappings = new Map<string, string>([
    // USD варіанти
    ['долар', 'USD'], ['доллар', 'USD'], ['долара', 'USD'], ['доллара', 'USD'],
    ['долару', 'USD'], ['доллару', 'USD'], ['доларів', 'USD'], ['долларів', 'USD'],
    ['usd', 'USD'], ['долар сша', 'USD'], ['долара сша', 'USD'], ['доллара сша', 'USD'], 
    ['американський долар', 'USD'],
    
    // EUR варіанти
    ['євро', 'EUR'], ['евро', 'EUR'], ['євра', 'EUR'], ['евра', 'EUR'], 
    ['eur', 'EUR'], ['європейська валюта', 'EUR'],
    
    // GBP варіанти
    ['фунт', 'GBP'], ['фунта', 'GBP'], ['фунту', 'GBP'], ['фунтів', 'GBP'], ['gbp', 'GBP'],
    ['британський фунт', 'GBP'], ['фунт стерлінг', 'GBP'], ['фунт стерлінгів', 'GBP'],
    
    // PLN варіанти
    ['злот', 'PLN'], ['злотий', 'PLN'], ['злотого', 'PLN'], ['злотому', 'PLN'], ['злотих', 'PLN'], ['pln', 'PLN'],
    ['польський злотий', 'PLN'], ['польський злотого', 'PLN'],
    
    // CHF варіанти
    ['франк', 'CHF'], ['франка', 'CHF'], ['франку', 'CHF'], ['франків', 'CHF'], ['chf', 'CHF'],
    ['швейцарський франк', 'CHF'], ['швейцарський франка', 'CHF'],
    
    // Інші валюти
    ['канадський долар', 'CAD'], ['cad', 'CAD'],
    ['австралійський долар', 'AUD'], ['aud', 'AUD'],
    ['японська йена', 'JPY'], ['jpy', 'JPY'], ['йена', 'JPY'],
    ['китайський юань', 'CNY'], ['cny', 'CNY'], ['юань', 'CNY'],
    ['чеська крона', 'CZK'], ['czk', 'CZK'], ['крона', 'CZK'],
    ['данська крона', 'DKK'], ['dkk', 'DKK'],
    ['норвезька крона', 'NOK'], ['nok', 'NOK'],
    ['шведська крона', 'SEK'], ['sek', 'SEK'],
    ['турецька ліра', 'TRY'], ['try', 'TRY'], ['ліра', 'TRY'],
    ['угорський форінт', 'HUF'], ['huf', 'HUF'], ['форінт', 'HUF'],
    ['румунський лей', 'RON'], ['ron', 'RON'], ['лей', 'RON'],
    ['болгарський лев', 'BGN'], ['bgn', 'BGN'], ['лев', 'BGN'],
    
    // UAH варіанти
    ['гривня', 'UAH'], ['гривні', 'UAH'], ['гривень', 'UAH'], ['гривнях', 'UAH'],
    ['uah', 'UAH'], ['hrn', 'UAH'], ['грн', 'UAH'], ['гривн', 'UAH']
  ]);

  // Коди валют для швидкого розпізнавання
  private readonly currencyCodes = [
    'USD', 'EUR', 'GBP', 'PLN', 'CHF', 'CAD', 'AUD', 'JPY', 'CNY',
    'CZK', 'SEK', 'NOK', 'DKK', 'TRY', 'HUF', 'RON', 'BGN', 'UAH'
  ];

  // Шаблони для розпізнавання запитів курсів
  private readonly ratePatterns = [
    /курс\s+(долар|доллар|євро|евро|фунт|злот|франк)/i,
    /курс\s+(usd|eur|gbp|pln|chf|cad|aud|jpy|cny|czk|sek|nok|dkk|try|huf|ron|bgn)/i,
    /(долар|доллар|євро|евро|фунт|злот|франк)\s+курс/i,
    /(usd|eur|gbp|pln|chf|cad|aud|jpy|cny|czk|sek|nok|dkk|try|huf|ron|bgn)\s+курс/i,
    /скільки\s+(коштує|стоїть)\s+(долар|доллар|євро|евро|фунт|злот|франк)/i,
    /(ціна|вартість)\s+(долар|доллар|долара|доллара|євро|евро|фунт|фунта|злот|злотого|франк|франка)/i,
    // Додаткові варіанти
    /скільки\s+(коштує\s+|стоїть\s+)?(долар|доллар|євро|евро|фунт|злот|франк)/i,
    /(курс|показати\s+курс|дати\s+курс)\s+(долара\s+сша|доллара\s+сша)/i,
    /курс\s+(польськ|швейцарськ|британськ).*(злот|франк|фунт)/i,
    /(польський\s+злот|швейцарський\s+франк|британський\s+фунт)(\s+курс)?/i,
    // Прямі запити без слова "курс"
    /(швейцарський\s+франк|польський\s+злот|британський\s+фунт|австралійський\s+долар|канадський\s+долар)/i
  ];

  // Шаблони для розпізнавання конвертації
  private readonly conversionPatterns = [
    // Основні паттерни з кодами валют
    /(\d+(?:\.\d+)?)\s+(usd|eur|gbp|pln|chf|cad|aud|jpy|cny|czk|sek|nok|dkk|try|huf|ron|bgn)\s+(?:в|у|to)\s+(uah|usd|eur|gbp|pln|chf|гривн|гривні|гривень|гривнях)/i,
    
    // Українські назви валют з конвертацією
    /(\d+(?:\.\d+)?)\s+(долар|доллар|долара|доллара|доларів|долларів)\s+(?:в|у)\s+(гривн|гривні|гривень|гривнях|uah)/i,
    /(\d+(?:\.\d+)?)\s+(євро|евро|євра|евра)\s+(?:в|у)\s+(гривн|гривні|гривень|гривнях|uah)/i,
    /(\d+(?:\.\d+)?)\s+(фунт|фунта|фунтів)\s+(?:в|у)\s+(гривн|гривні|гривень|гривнях|uah)/i,
    /(\d+(?:\.\d+)?)\s+(злот|злотий|злотого|злотих)\s+(?:в|у)\s+(гривн|гривні|гривень|гривнях|uah)/i,
    /(\d+(?:\.\d+)?)\s+(франк|франка|франків)\s+(?:в|у)\s+(гривн|гривні|гривень|гривнях|uah)/i,
    
    // Міжвалютна конвертація (українські назви)
    /(\d+(?:\.\d+)?)\s+(долар|доллар|долара|доллара|доларів|долларів)\s+(?:в|у)\s+(євро|евро|eur)/i,
    /(\d+(?:\.\d+)?)\s+(євро|евро|євра|евра)\s+(?:в|у)\s+(долар|доллар|usd)/i,
    
    // Міжвалютна конвертація (коди)
    /(\d+(?:\.\d+)?)\s+(usd|eur|gbp|pln|chf)\s+(?:в|у|to)\s+(usd|eur|gbp|pln|chf)/i,
    
    // Команди конвертації
    /конвертувати\s+(\d+(?:\.\d+)?)\s+(usd|eur|gbp|pln|chf|долар|доллар|євро|евро|фунт|злот|франк)/i,
    /скільки\s+буде\s+(\d+(?:\.\d+)?)\s+(usd|eur|gbp|pln|chf|долар|доллар|євро|евро|фунт|злот|франк)/i,
    /скільки\s+буде\s+(\d+(?:\.\d+)?)\s+(долар|доллар|долара|доллара|доларів|долларів)\s+(в\s+гривн|в\s+гривні|в\s+гривнях)/i,
    /скільки\s+буде\s+(\d+(?:\.\d+)?)\s+(євро|евро|євра|евра)\s+(в\s+гривн|в\s+гривні|в\s+гривнях)/i,
    
    // Загальний паттерн для будь-яких кодів валют (для обробки помилок)
    /(\d+(?:\.\d+)?)\s+([A-Z]{3,10})\s+(?:в|у|to)\s+([A-Z]{3,10}|uah|гривн|гривні|гривень|гривнях)/i
  ];

  // Шаблони для популярних курсів
  private readonly popularPatterns = [
    /популярні\s+курси/i,
    /курси\s+валют/i,
    /основні\s+курси/i,
    /валютні\s+курси/i,
    /показати\s+курси/i,
    /всі\s+курси/i,
    /усі\s+курси/i,
    /курси\s+популярних\s+валют/i
  ];

  // Шаблони для списку валют
  private readonly listPatterns = [
    /список\s+валют/i,
    /які\s+валюти/i,
    /підтримувані\s+валюти/i,
    /доступні\s+валюти/i,
    /валюти\s+список/i,
    /показати\s+валюти/i,
    /валюти\s+доступні/i,
    /у\s+вас\s+валюти/i
  ];

  /**
   * Знайти валютну команду
   */
  findCurrencyCommand(query: string, threshold: number = 0.6): CurrencyCommandMatch | null {
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) return null;

    // 1. Перевірка прямих кодів валют
    const directCodeMatch = this.checkDirectCurrencyCode(normalizedQuery);
    if (directCodeMatch) {
      return directCodeMatch;
    }

    // 2. Перевірка конвертації
    const conversionMatch = this.checkConversionPattern(normalizedQuery);
    if (conversionMatch) {
      return conversionMatch;
    }

    // 3. Перевірка популярних курсів
    const popularMatch = this.checkPopularPattern(normalizedQuery);
    if (popularMatch) {
      return popularMatch;
    }

    // 4. Перевірка списку валют
    const listMatch = this.checkListPattern(normalizedQuery);
    if (listMatch) {
      return listMatch;
    }

    // 5. Перевірка запитів курсів
    const rateMatch = this.checkRatePattern(normalizedQuery);
    if (rateMatch) {
      return rateMatch;
    }

    return null;
  }

  /**
   * Перевірити прямий код валюти
   */
  private checkDirectCurrencyCode(query: string): CurrencyCommandMatch | null {
    const upperQuery = query.toUpperCase();
    if (this.currencyCodes.includes(upperQuery)) {
      return {
        command: `currency_rate_${upperQuery.toLowerCase()}`,
        confidence: 1.0,
        type: 'rate_query',
        parameters: {
          currency: upperQuery
        }
      };
    }
    return null;
  }

  /**
   * Перевірити шаблон конвертації
   */
  private checkConversionPattern(query: string): CurrencyCommandMatch | null {
    for (const pattern of this.conversionPatterns) {
      const match = query.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        let fromCurrency: string | null = null;
        let toCurrency: string | null = null;

        // Обробляємо різні типи патернів
        if (match.length >= 4 && match[3]) {
          // Паттерни з 3 групами: amount, fromCurrency, toCurrency
          fromCurrency = this.mapCurrency(match[2]);
          const mappedToCurrency = this.mapCurrency(match[3]);
          toCurrency = mappedToCurrency || 'UAH';
        } else if (match.length >= 3 && match[2]) {
          // Паттерни з 2 групами: amount, fromCurrency (toCurrency = UAH за замовчуванням)
          fromCurrency = this.mapCurrency(match[2]);
          toCurrency = 'UAH';
        }

        if (fromCurrency && amount > 0) {
          return {
            command: 'currency_conversion',
            confidence: 0.9,
            type: 'conversion',
            parameters: {
              amount,
              fromCurrency,
              toCurrency
            }
          };
        }
      }
    }
    return null;
  }

  /**
   * Перевірити шаблон популярних курсів
   */
  private checkPopularPattern(query: string): CurrencyCommandMatch | null {
    for (const pattern of this.popularPatterns) {
      if (pattern.test(query)) {
        return {
          command: 'popular_currencies',
          confidence: 0.85,
          type: 'popular'
        };
      }
    }
    return null;
  }

  /**
   * Перевірити шаблон списку валют
   */
  private checkListPattern(query: string): CurrencyCommandMatch | null {
    for (const pattern of this.listPatterns) {
      if (pattern.test(query)) {
        return {
          command: 'currency_list',
          confidence: 0.85,
          type: 'list'
        };
      }
    }
    return null;
  }

  /**
   * Перевірити шаблон запиту курсу
   */
  private checkRatePattern(query: string): CurrencyCommandMatch | null {
    for (const pattern of this.ratePatterns) {
      const match = query.match(pattern);
      if (match) {
        // Знаходимо валюту в матчі - перевіряємо всі групи
        let currency: string | null = null;
        let currencyFromMatch: string = '';
        
        // Перевіряємо всі групи у зворотному порядку (валюта зазвичай останньою)
        for (let i = match.length - 1; i >= 1; i--) {
          if (match[i]) {
            const mappedCurrency = this.mapCurrency(match[i]);
            if (mappedCurrency) {
              currency = mappedCurrency;
              currencyFromMatch = match[i];
              break;
            }
          }
        }
        
        if (currency) {
          // Визначаємо впевненість на основі типу збігу
          let confidence = 0.8;
          if (this.currencyCodes.includes(currencyFromMatch.toUpperCase())) {
            confidence = 0.95; // Прямий код валюти
          } else {
            confidence = 0.9; // Точний збіг з патерном
          }
          
          return {
            command: `currency_rate_${currency.toLowerCase()}`,
            confidence,
            type: 'rate_query',
            parameters: {
              currency
            }
          };
        }
      }
    }
    return null;
  }

  /**
   * Мапити текст валюти на код
   */
  private mapCurrency(currencyText: string): string | null {
    const lowerText = currencyText.toLowerCase().trim();
    
    // Спочатку перевіряємо прямі коди
    const upperText = currencyText.toUpperCase();
    if (this.currencyCodes.includes(upperText)) {
      return upperText;
    }
    
    // Перевіряємо чи це код валюти (навіть якщо невідомий)
    if (/^[A-Z]{3,10}$/i.test(currencyText)) {
      return upperText;
    }
    
    // Складні назви валют
    if (lowerText.includes('швейцарський франк') || lowerText.includes('швейцарський')) {
      return 'CHF';
    }
    if (lowerText.includes('польський злот') || lowerText.includes('польський')) {
      return 'PLN';
    }
    if (lowerText.includes('британський фунт') || lowerText.includes('британський')) {
      return 'GBP';
    }
    if (lowerText.includes('канадський долар') || lowerText.includes('канадський')) {
      return 'CAD';
    }
    if (lowerText.includes('австралійський долар') || lowerText.includes('австралійський')) {
      return 'AUD';
    }
    
    // Потім шукаємо в мапі
    return this.currencyMappings.get(lowerText) || null;
  }

  /**
   * Перевірити чи є запит валютним
   */
  isCurrencyQuery(query: string): boolean {
    return this.findCurrencyCommand(query) !== null;
  }

  /**
   * Отримати статистику розпізнавання
   */
  getRecognitionStats(): {
    totalPatterns: number;
    commandTypes: Record<string, number>;
    supportedCurrencies: number;
  } {
    return {
      totalPatterns: this.ratePatterns.length + this.conversionPatterns.length + 
                    this.popularPatterns.length + this.listPatterns.length,
      commandTypes: {
        'rate_query': this.ratePatterns.length,
        'conversion': this.conversionPatterns.length,
        'popular': this.popularPatterns.length,
        'list': this.listPatterns.length
      },
      supportedCurrencies: this.currencyCodes.length
    };
  }

  /**
   * Отримати всі валютні команди
   */
  getAllCurrencyCommands(): Array<{
    command: string;
    patterns: string[];
    type: CurrencyCommandMatch['type'];
    description: string;
  }> {
    return [
      {
        command: 'currency_rate_usd',
        patterns: ['курс долара', 'USD', 'долар курс'],
        type: 'rate_query',
        description: 'Показати курс долара США'
      },
      {
        command: 'currency_rate_eur',
        patterns: ['курс євро', 'EUR', 'євро курс'],
        type: 'rate_query',
        description: 'Показати курс євро'
      },
      {
        command: 'currency_conversion',
        patterns: ['100 USD в UAH', 'конвертувати', 'скільки буде'],
        type: 'conversion',
        description: 'Конвертувати валюту'
      },
      {
        command: 'popular_currencies',
        patterns: ['популярні курси', 'курси валют'],
        type: 'popular',
        description: 'Показати популярні курси'
      },
      {
        command: 'currency_list',
        patterns: ['список валют', 'які валюти'],
        type: 'list',
        description: 'Показати список валют'
      }
    ];
  }

  /**
   * Отримати підказки по командах
   */
  getCurrencyCommandHints(): string[] {
    return [
      'Спробуйте: "курс долара" або "USD"',
      'Для конвертації: "100 USD в UAH"',
      'Для списку: "популярні курси"',
      'Підтримувані валюти: "список валют"'
    ];
  }
} 