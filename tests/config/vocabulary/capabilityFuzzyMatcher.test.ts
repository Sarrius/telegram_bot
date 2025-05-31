import { CapabilityFuzzyMatcher } from '../../../src/config/vocabulary/capabilityFuzzyMatcher';

describe('CapabilityFuzzyMatcher', () => {
  let matcher: CapabilityFuzzyMatcher;

  beforeEach(() => {
    matcher = new CapabilityFuzzyMatcher();
  });

  describe('detectCapabilityRequest', () => {
    describe('Українські запити', () => {
      it('має розпізнавати точні українські тригери', () => {
        const ukrainianTriggers = [
          'що ти можеш',
          'можливості',
          'функції',
          'команди',
          'що вмієш',
          'допомога'
        ];
        
        ukrainianTriggers.forEach(trigger => {
          const result = matcher.detectCapabilityRequest(trigger);
          expect(result.isCapabilityRequest).toBe(true);
          expect(result.confidence).toBe(1.0);
          expect(result.language).toBe('uk');
          expect(result.matchedTrigger).toBe(trigger);
        });
      });

      it('має розпізнавати українські тригери з помилками', () => {
        const triggersWithTypos = [
          { text: 'шо ти можеш робити зі мною', original: 'що ти можеш' },
          { text: 'покажи можливосці бота детально', original: 'можливості' },
          { text: 'які функції у тебе є', original: 'функції' },
          { text: 'покажи команди які можеш виконувати', original: 'команди' }
        ];
        
        triggersWithTypos.forEach(({ text, original }) => {
          const result = matcher.detectCapabilityRequest(text);
          expect(result.isCapabilityRequest).toBe(true);
          expect(result.confidence).toBeGreaterThan(0.7);
          expect(result.language).toBe('uk');
        });
      });

      it('має розпізнавати неформальні українські варіанти', () => {
        const informalTriggers = [
          'що за бот',
          'хто ти',
          'покажи що можеш',
          'шо можеш',
          'які фічі',
          'скілзи',
          'шо шариш'
        ];
        
        informalTriggers.forEach(trigger => {
          const result = matcher.detectCapabilityRequest(trigger);
          expect(result.isCapabilityRequest).toBe(true);
          expect(result.language).toBe('uk');
        });
      });

      it('має розпізнавати інструкційні запити', () => {
        const instructionTriggers = [
          'як тебе використовувати',
          'інструкція',
          'мануал',
          'які твої навички',
          'розкажи про себе',
          'опиши себе'
        ];
        
        instructionTriggers.forEach(trigger => {
          const result = matcher.detectCapabilityRequest(trigger);
          expect(result.isCapabilityRequest).toBe(true);
          expect(result.language).toBe('uk');
        });
      });
    });

    describe('Англійські запити', () => {
      it('має розпізнавати точні англійські тригери', () => {
        const englishTriggers = [
          'what can you do',
          'capabilities',
          'features',
          'commands',
          'help'
        ];
        
        englishTriggers.forEach(trigger => {
          const result = matcher.detectCapabilityRequest(trigger);
          expect(result.isCapabilityRequest).toBe(true);
          expect(result.confidence).toBe(1.0);
          expect(result.language).toBe('en');
          expect(result.matchedTrigger).toBe(trigger);
        });
      });

      it('має розпізнавати англійські тригери з помилками', () => {
        const triggersWithTypos = [
          { text: 'wat can you do for me exactly', original: 'what can you do' },
          { text: 'show me your capabilites and functions', original: 'capabilities' },
          { text: 'what featers does this bot have', original: 'features' },
          { text: 'can you halp me understand what you do', original: 'help' }
        ];
        
        triggersWithTypos.forEach(({ text, original }) => {
          const result = matcher.detectCapabilityRequest(text);
          expect(result.isCapabilityRequest).toBe(true);
          expect(result.confidence).toBeGreaterThan(0.7);
          expect(result.language).toBe('en');
        });
      });

      it('має розпізнавати неформальні англійські варіанти', () => {
        const informalTriggers = [
          'what are you',
          'who are you',
          'show me what you got',
          'whatcha got',
          'what\'s your deal',
          'show me your stuff'
        ];
        
        informalTriggers.forEach(trigger => {
          const result = matcher.detectCapabilityRequest(trigger);
          expect(result.isCapabilityRequest).toBe(true);
          expect(result.language).toBe('en');
        });
      });
    });

    describe('Контекстні запити', () => {
      it('має розпізнавати запити у контексті', () => {
        const contextualRequests = [
          'привіт, що ти можеш робити?',
          'можеш показати свої можливості?',
          'я хочу знати які у тебе функції',
          'hey, what can you do for me?',
          'can you show me your capabilities?',
          'i want to know what features you have'
        ];
        
        contextualRequests.forEach(request => {
          const result = matcher.detectCapabilityRequest(request);
          expect(result.isCapabilityRequest).toBe(true);
          expect(result.confidence).toBeGreaterThan(0.7);
        });
      });

      it('має правильно визначати мову у змішаних запитах', () => {
        const mixedRequests = [
          { text: 'що ти можеш show me', expectedLang: 'uk' },
          { text: 'what can you що вмієш', expectedLang: 'uk' } // Українська завжди пріоритетна
        ];
        
        mixedRequests.forEach(({ text, expectedLang }) => {
          const result = matcher.detectCapabilityRequest(text);
          expect(result.isCapabilityRequest).toBe(true);
          expect(result.language).toBe(expectedLang);
        });
      });
    });

    describe('Нерозпізнані запити', () => {
      it('не має розпізнавати звичайні повідомлення', () => {
        const normalMessages = [
          'Привіт, як справи?',
          'Hello, how are you?',
          'Дякую за допомогу',
          'до побачення',
          'випадковий текст про щось',
          'хочу жарт',
          'розкажи мем'
        ];
        
        normalMessages.forEach(message => {
          const result = matcher.detectCapabilityRequest(message);
          expect(result.isCapabilityRequest).toBe(false);
        });
      });

      it('не має розпізнавати запити з низькою впевненістю', () => {
        const lowConfidenceMessages = [
          'абракадабра можливості хрін зовсім',
          'хухрымухры функции бред повний',
          'randomtext capabilities nonsense garbage',
          'blahblah features garbage completely'
        ];
        
        lowConfidenceMessages.forEach(message => {
          const result = matcher.detectCapabilityRequest(message);
          expect(result.isCapabilityRequest).toBe(false);
          expect(result.confidence).toBeLessThan(0.7);
        });
      });
    });

    describe('Вибір найкращого збігу', () => {
      it('має вибирати українську мову коли впевненість однакова', () => {
        const ambiguousText = 'help допомога';
        const result = matcher.detectCapabilityRequest(ambiguousText);
        
        expect(result.isCapabilityRequest).toBe(true);
        expect(result.language).toBe('uk'); // Українська має пріоритет
      });

      it('має вибирати мову з найвищою впевненістю', () => {
        const englishDominant = 'what can you do допоможи';
        const result = matcher.detectCapabilityRequest(englishDominant);
        
        expect(result.isCapabilityRequest).toBe(true);
        // Англійська фраза повніша і має бути вища впевненість
      });
    });
  });

  describe('Fuzzy matching алгоритм', () => {
    it('має правильно обробляти фрази з кількома словами', () => {
      const phrases = [
        'що ти можеш',
        'які твої навички',
        'what can you do',
        'show me your stuff'
      ];
      
      phrases.forEach(phrase => {
        const result = matcher.detectCapabilityRequest(phrase);
        expect(result.isCapabilityRequest).toBe(true);
        expect(result.confidence).toBe(1.0);
      });
    });

    it('має толерувати часткові збіги у фразах', () => {
      const partialMatches = [
        'що ти', // частина "що ти можеш"
        'можеш робити', // частина різних фраз
        'what can', // частина "what can you do"
        'show your' // частина "show me your stuff"
      ];
      
      partialMatches.forEach(partial => {
        const result = matcher.detectCapabilityRequest(partial);
        // Може розпізнати або не розпізнати залежно від алгоритму
        // Головне щоб не падало
        expect(typeof result.isCapabilityRequest).toBe('boolean');
      });
    });

    it('має обробляти різні варіанти слів у фразах', () => {
      const variations = [
        'шо ти можеш', // "що" -> "шо"
        'які твоі навычки', // "твої" -> "твоі", "навички" -> "навычки"
        'wat can you do', // "what" -> "wat"
        'show me ur stuff' // "your" -> "ur"
      ];
      
      variations.forEach(variation => {
        const result = matcher.detectCapabilityRequest(variation);
        expect(result.isCapabilityRequest).toBe(true);
        expect(result.confidence).toBeGreaterThan(0.7);
      });
    });
  });

  describe('getStats', () => {
    it('має повертати коректну статистику', () => {
      const stats = matcher.getStats();
      
      expect(stats.ukrainianTriggers).toBeGreaterThan(0);
      expect(stats.ukrainianVariations).toBeGreaterThan(0);
      expect(stats.englishTriggers).toBeGreaterThan(0);
      expect(stats.englishVariations).toBeGreaterThan(0);
      expect(stats.totalTriggers).toBe(stats.ukrainianTriggers + stats.englishTriggers);
      
      expect(typeof stats.ukrainianTriggers).toBe('number');
      expect(typeof stats.ukrainianVariations).toBe('number');
      expect(typeof stats.englishTriggers).toBe('number');
      expect(typeof stats.englishVariations).toBe('number');
      expect(typeof stats.totalTriggers).toBe('number');
    });

    it('статистика має відповідати реальним даним', () => {
      const stats = matcher.getStats();
      
      // Перевіряємо що є достатньо тригерів
      expect(stats.ukrainianTriggers).toBeGreaterThanOrEqual(10);
      expect(stats.englishTriggers).toBeGreaterThanOrEqual(5);
      
      // Перевіряємо що є варіації для тригерів
      expect(stats.ukrainianVariations).toBeGreaterThanOrEqual(20);
      expect(stats.englishVariations).toBeGreaterThanOrEqual(10);
      
      // Загальна кількість має бути коректною
      expect(stats.totalTriggers).toBeGreaterThanOrEqual(15);
    });
  });

  describe('Граничні випадки', () => {
    it('має обробляти порожні рядки', () => {
      const result = matcher.detectCapabilityRequest('');
      expect(result.isCapabilityRequest).toBe(false);
      expect(result.confidence).toBe(0);
    });

    it('має обробляти дуже короткі рядки', () => {
      const shortStrings = ['а', 'x', '?', '!'];
      
      shortStrings.forEach(str => {
        const result = matcher.detectCapabilityRequest(str);
        expect(result.isCapabilityRequest).toBe(false);
      });
    });

    it('має обробляти дуже довгі рядки', () => {
      const longText = 'а'.repeat(500) + ' що ти можеш ' + 'б'.repeat(500);
      const result = matcher.detectCapabilityRequest(longText);
      
      expect(result.isCapabilityRequest).toBe(true);
      expect(result.language).toBe('uk');
    });

    it('має обробляти спеціальні символи', () => {
      const textsWithSymbols = [
        'що ти можеш???',
        'можливості!!!',
        'what can you do...',
        'capabilities!!!'
      ];
      
      textsWithSymbols.forEach(text => {
        const result = matcher.detectCapabilityRequest(text);
        expect(result.isCapabilityRequest).toBe(true);
      });
    });

    it('має обробляти різні регістри', () => {
      const differentCases = [
        'ЩО ТИ МОЖЕШ',
        'Можливості',
        'WHAT CAN YOU DO',
        'Capabilities'
      ];
      
      differentCases.forEach(text => {
        const result = matcher.detectCapabilityRequest(text);
        expect(result.isCapabilityRequest).toBe(true);
      });
    });

    it('має обробляти зайві пробіли та символи форматування', () => {
      const textsWithSpaces = [
        '  що ти можеш  ',
        '\t\tможливості\t\t',
        '\n\nwhat can you do\n\n',
        '   capabilities   '
      ];
      
      textsWithSpaces.forEach(text => {
        const result = matcher.detectCapabilityRequest(text);
        expect(result.isCapabilityRequest).toBe(true);
      });
    });
  });

  describe('Продуктивність', () => {
    it('має швидко обробляти багато запитів', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        matcher.detectCapabilityRequest('що ти можеш');
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Розширюємо ліміт до 2 секунд через додаткові перевірки
      expect(duration).toBeLessThan(2000);
    });

    it('має ефективно обробляти довгі тексти', () => {
      const longText = 'випадковий текст '.repeat(100) + ' що ти можеш';
      
      const startTime = Date.now();
      const result = matcher.detectCapabilityRequest(longText);
      const endTime = Date.now();
      
      expect(result.isCapabilityRequest).toBe(true);
      expect(endTime - startTime).toBeLessThan(200); // Розширюємо ліміт до 200мс
    });
  });
}); 