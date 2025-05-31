// Тести для CurrencyCommandsFuzzyMatcher
import { CurrencyCommandsFuzzyMatcher, CurrencyCommandMatch } from '../../../src/config/vocabulary/currencyCommandsFuzzyMatcher';

describe('CurrencyCommandsFuzzyMatcher', () => {
  let matcher: CurrencyCommandsFuzzyMatcher;

  beforeEach(() => {
    matcher = new CurrencyCommandsFuzzyMatcher();
  });

  describe('findCurrencyCommand', () => {
    describe('запити курсів валют', () => {
      it('повинен розпізнати запити курсу долара (українською)', () => {
        const queries = [
          'курс долара',
          'курс доллара',
          'курс долара США',
          'доллар курс',
          'USD курс',
          'скільки коштує долар',
          'ціна долара',
          'вартість долара'
        ];

        queries.forEach(query => {
          const result = matcher.findCurrencyCommand(query);
          expect(result).not.toBeNull();
          expect(result?.type).toBe('rate_query');
          expect(result?.command).toContain('usd');
          expect(result?.confidence).toBeGreaterThan(0.6);
        });
      });

      it('повинен розпізнати запити курсу євро (українською)', () => {
        const queries = [
          'курс євро',
          'курс евро',
          'EUR курс',
          'євро курс',
          'скільки коштує євро',
          'ціна євро'
        ];

        queries.forEach(query => {
          const result = matcher.findCurrencyCommand(query);
          expect(result).not.toBeNull();
          expect(result?.type).toBe('rate_query');
          expect(result?.command).toContain('eur');
          expect(result?.confidence).toBeGreaterThan(0.6);
        });
      });

      it('повинен розпізнати запити різних валют', () => {
        const testCases = [
          { query: 'курс фунта', command: 'gbp' },
          { query: 'польський злотий курс', command: 'pln' },
          { query: 'швейцарський франк', command: 'chf' }
        ];

        testCases.forEach(({ query, command }) => {
          const result = matcher.findCurrencyCommand(query);
          expect(result).not.toBeNull();
          expect(result?.type).toBe('rate_query');
          expect(result?.command).toContain(command);
        });
      });

      it('повинен розпізнати прямі коди валют', () => {
        const currencies = ['USD', 'EUR', 'GBP', 'PLN', 'CHF'];

        currencies.forEach(currency => {
          const result = matcher.findCurrencyCommand(currency);
          expect(result).not.toBeNull();
          expect(result?.type).toBe('rate_query');
          expect(result?.command).toContain(currency.toLowerCase());
          expect(result?.confidence).toBe(1.0);
        });
      });
    });

    describe('конвертації валют', () => {
      it('повинен розпізнати конвертацію в гривні', () => {
        const queries = [
          '100 USD в UAH',
          '50 доларів в гривні',
          '200 EUR в гривнях',
          '100 USD to UAH',
          'конвертувати 100 USD в гривні',
          'скільки буде 100 доларів в гривнях'
        ];

        queries.forEach(query => {
          const result = matcher.findCurrencyCommand(query);
          expect(result).not.toBeNull();
          expect(result?.type).toBe('conversion');
          if (result?.parameters) {
            expect(result.parameters.amount).toBeGreaterThan(0);
            expect(result.parameters.fromCurrency).toBeDefined();
          }
          expect(result?.confidence).toBeGreaterThan(0.6);
        });
      });

      it('повинен розпізнати конвертацію між валютами', () => {
        const queries = [
          '100 USD в EUR',
          '50 доларів в євро',
          '200 EUR в USD',
          '100 USD to EUR',
          'конвертувати 100 USD в EUR'
        ];

        queries.forEach(query => {
          const result = matcher.findCurrencyCommand(query);
          expect(result).not.toBeNull();
          expect(result?.type).toBe('conversion');
          if (result?.parameters) {
            expect(result.parameters.amount).toBeGreaterThan(0);
            expect(result.parameters.fromCurrency).toBeDefined();
            expect(result.parameters.toCurrency).toBeDefined();
          }
        });
      });

      it('повинен розпізнати різні числові формати', () => {
        const testCases = [
          { query: '100 USD в UAH', amount: 100 },
          { query: '0.5 USD в UAH', amount: 0.5 },
          { query: '1000000 USD в UAH', amount: 1000000 },
          { query: '1.5 USD в UAH', amount: 1.5 }
        ];

        testCases.forEach(({ query, amount }) => {
          const result = matcher.findCurrencyCommand(query);
          expect(result).not.toBeNull();
          expect(result?.type).toBe('conversion');
          if (result?.parameters) {
            expect(result.parameters.amount).toBe(amount);
          }
        });
      });
    });

    describe('популярні курси', () => {
      it('повинен розпізнати запити популярних курсів', () => {
        const queries = [
          'популярні курси',
          'курси валют',
          'показати курси',
          'основні курси',
          'валютні курси',
          'курси популярних валют'
        ];

        queries.forEach(query => {
          const result = matcher.findCurrencyCommand(query);
          expect(result).not.toBeNull();
          expect(result?.type).toBe('popular');
          expect(result?.confidence).toBeGreaterThan(0.6);
        });
      });
    });

    describe('список валют', () => {
      it('повинен розпізнати запити списку валют', () => {
        const queries = [
          'список валют',
          'які валюти підтримуються',
          'доступні валюти',
          'показати валюти',
          'валюти список'
        ];

        queries.forEach(query => {
          const result = matcher.findCurrencyCommand(query);
          expect(result).not.toBeNull();
          expect(result?.type).toBe('list');
          expect(result?.confidence).toBeGreaterThan(0.6);
        });
      });
    });

    describe('не валютні запити', () => {
      it('повинен не розпізнати звичайні повідомлення', () => {
        const nonCurrencyQueries = [
          'Привіт, як справи?',
          'Hello world',
          'Що нового?',
          'Добрий день',
          'Як погода?',
          'Новини України',
          'У мене 100 друзів',
          'Сьогодні 25 грудня',
          'Купив 5 яблук'
        ];

        nonCurrencyQueries.forEach(query => {
          const result = matcher.findCurrencyCommand(query);
          expect(result).toBeNull();
        });
      });
    });

    describe('крайові випадки', () => {
      it('повинен обробити порожні рядки', () => {
        expect(matcher.findCurrencyCommand('')).toBeNull();
        expect(matcher.findCurrencyCommand('   ')).toBeNull();
      });

      it('повинен обробити дуже довгі повідомлення', () => {
        const longQuery = 'курс долара ' + 'дуже довгий текст '.repeat(100);
        const result = matcher.findCurrencyCommand(longQuery);
        expect(result).not.toBeNull();
        expect(result?.type).toBe('rate_query');
        expect(result?.command).toContain('usd');
      });

      it('повинен обробити повідомлення з спеціальними символами', () => {
        const result = matcher.findCurrencyCommand('курс долара???!!!');
        expect(result).not.toBeNull();
        expect(result?.type).toBe('rate_query');
        expect(result?.command).toContain('usd');
      });

      it('повинен обробити різний регістр', () => {
        const queries = [
          'КУРС ДОЛАРА',
          'Курс Долара',
          'курс долара',
          'КуРс ДоЛаРа'
        ];

        queries.forEach(query => {
          const result = matcher.findCurrencyCommand(query);
          expect(result).not.toBeNull();
          expect(result?.type).toBe('rate_query');
          expect(result?.command).toContain('usd');
        });
      });

      it('повинен обробити зайві пробіли', () => {
        const queries = [
          '  курс   долара  ',
          'курс     долара',
          '   100    USD   в   UAH   '
        ];

        queries.forEach(query => {
          const result = matcher.findCurrencyCommand(query);
          expect(result).not.toBeNull();
        });
      });
    });

    describe('впевненість (confidence)', () => {
      it('повинен давати високу впевненість для точних збігів', () => {
        const exactMatches = [
          'USD',
          'EUR',
          'курс долара'
        ];

        exactMatches.forEach(query => {
          const result = matcher.findCurrencyCommand(query);
          expect(result?.confidence).toBeGreaterThan(0.8);
        });
      });
    });
  });

  describe('getRecognitionStats', () => {
    it('повинен повернути статистику', () => {
      const stats = matcher.getRecognitionStats();

      expect(stats).toHaveProperty('totalPatterns');
      expect(stats).toHaveProperty('commandTypes');
      expect(stats).toHaveProperty('supportedCurrencies');

      expect(stats.totalPatterns).toBeGreaterThan(10);
      expect(stats.supportedCurrencies).toBeGreaterThan(10);
      expect(stats.commandTypes).toHaveProperty('rate_query');
      expect(stats.commandTypes).toHaveProperty('conversion');
      expect(stats.commandTypes).toHaveProperty('popular');
      expect(stats.commandTypes).toHaveProperty('list');
    });
  });

  describe('isCurrencyQuery', () => {
    it('повинен визначити валютний запит', () => {
      const result = matcher.isCurrencyQuery('курс долара');
      expect(result).toBe(true);
    });

    it('повинен визначити не валютний запит', () => {
      const result = matcher.isCurrencyQuery('Привіт як справи');
      expect(result).toBe(false);
    });
  });

  describe('інтеграційні тести з реальними сценаріями', () => {
    it('повинен обробити мішані запити', () => {
      const queries = [
        'Привіт! Скажи курс долара',
        'Можеш показати популярні курси?',
        'А які у вас валюти доступні?'
      ];

      queries.forEach(query => {
        const result = matcher.findCurrencyCommand(query);
        expect(result).not.toBeNull();
        expect(result?.confidence).toBeGreaterThan(0.5);
      });
    });

    it('повинен обробити типові помилки користувачів', () => {
      const typoQueries = [
        'курс доллара', // подвійна л
        'курс евро', // без ї
        'доллар курс',
        'евро курс'
      ];

      typoQueries.forEach(query => {
        const result = matcher.findCurrencyCommand(query);
        expect(result).not.toBeNull();
      });
    });
  });
}); 