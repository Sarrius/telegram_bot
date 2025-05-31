import { NewsCommandsFuzzyMatcher, NewsCommandMatch } from '../../../src/config/vocabulary/newsCommandsFuzzyMatcher';

describe('NewsCommandsFuzzyMatcher', () => {
  let matcher: NewsCommandsFuzzyMatcher;

  beforeEach(() => {
    matcher = new NewsCommandsFuzzyMatcher();
  });

  describe('recognizeCommand', () => {
    describe('Команди новин', () => {
      it('має розпізнавати точні команди новин', () => {
        const commands = ['новини', 'що відбувається', 'що твориться', 'які новини'];
        
        commands.forEach(command => {
          const result = matcher.recognizeCommand(command);
          expect(result).not.toBeNull();
          expect(result!.type).toBe('news');
          expect(result!.confidence).toBe(1.0);
        });
      });

      it('має розпізнавати команди новин з помилками', () => {
        const commandsWithTypos = [
          'новыни',
          'шо відбувається', 
          'шо твориться',
          'які новыны'
        ];
        
        commandsWithTypos.forEach(command => {
          const result = matcher.recognizeCommand(command);
          expect(result).not.toBeNull();
          expect(result!.type).toBe('news');
          expect(result!.confidence).toBeGreaterThan(0.6);
        });
      });

      it('має розпізнавати команди новин у контексті', () => {
        const contextCommands = [
          'привіт, які новини сьогодні?',
          'покажи мені що відбувається у світі',
          'хочу знати останні події',
          'розкажи свіжі новини'
        ];
        
        contextCommands.forEach(command => {
          const result = matcher.recognizeCommand(command);
          expect(result).not.toBeNull();
          expect(result!.type).toBe('news');
        });
      });
    });

    describe('Команди погоди', () => {
      it('має розпізнавати точні команди погоди', () => {
        const commands = ['погода', 'температура', 'як на вулиці', 'яка погода'];
        
        commands.forEach(command => {
          const result = matcher.recognizeCommand(command);
          expect(result).not.toBeNull();
          expect(result!.type).toBe('weather');
          expect(result!.confidence).toBe(1.0);
        });
      });

      it('має розпізнавати команди погоди з помилками', () => {
        const commandsWithTypos = [
          'погоды',
          'темпирература',
          'як навулиці',
          'якая погода'
        ];
        
        commandsWithTypos.forEach(command => {
          const result = matcher.recognizeCommand(command);
          expect(result).not.toBeNull();
          expect(result!.type).toBe('weather');
          expect(result!.confidence).toBeGreaterThan(0.6);
        });
      });

      it('має витягувати назву міста з команд погоди', () => {
        const commandsWithCities = [
          { text: 'погода в Києві', expectedCity: 'Київ' },
          { text: 'яка температура в Харкові', expectedCity: 'Харків' },
          { text: 'погода в одесі', expectedCity: 'Одеса' },
          { text: 'як на вулиці у Львові', expectedCity: 'Львів' }
        ];
        
        commandsWithCities.forEach(({ text, expectedCity }) => {
          const result = matcher.recognizeCommand(text);
          expect(result).not.toBeNull();
          expect(result!.type).toBe('weather');
          expect(result!.city).toBe(expectedCity);
        });
      });

      it('має розпізнавати назви міст з помилками', () => {
        const citiesWithTypos = [
          { text: 'погода в киеві', expectedCity: 'Київ' },
          { text: 'температура в харькові', expectedCity: 'Харків' },
          { text: 'як на вулиці в одессі', expectedCity: 'Одеса' }
        ];
        
        citiesWithTypos.forEach(({ text, expectedCity }) => {
          const result = matcher.recognizeCommand(text);
          expect(result).not.toBeNull();
          expect(result!.type).toBe('weather');
          expect(result!.city).toBe(expectedCity);
        });
      });
    });

    describe('Команди підписки', () => {
      it('має розпізнавати команди підписки', () => {
        const commands = ['хочу підписатися на новини', 'підписка на ранкові новини', 'хочу щоденні новини', 'підписатися на зводки'];
        
        commands.forEach(command => {
          const result = matcher.recognizeCommand(command);
          expect(result).not.toBeNull();
          expect(result!.type).toBe('subscribe');
        });
      });

      it('має розпізнавати команди підписки з помилками', () => {
        const commandsWithTypos = [
          'хочу пітписатися на новини',
          'підпіска на ранкові новини',
          'хочю щоденні новыны'
        ];
        
        commandsWithTypos.forEach(command => {
          const result = matcher.recognizeCommand(command);
          expect(result).not.toBeNull();
          expect(result!.type).toBe('subscribe');
          expect(result!.confidence).toBeGreaterThan(0.75);
        });
      });
    });

    describe('Команди відписки', () => {
      it('має розпізнавати команди відписки', () => {
        const commands = ['відписатися від новин', 'не хочу новини', 'прибрати ранкові зводки', 'відписка від новин'];
        
        commands.forEach(command => {
          const result = matcher.recognizeCommand(command);
          expect(result).not.toBeNull();
          expect(result!.type).toBe('unsubscribe');
        });
      });

      it('має розпізнавати команди відписки з помилками', () => {
        const commandsWithTypos = [
          'відпісатися від новин',
          'не хочю новини більше',
          'прыбрати ранкові новини'
        ];
        
        commandsWithTypos.forEach(command => {
          const result = matcher.recognizeCommand(command);
          expect(result).not.toBeNull();
          expect(result!.type).toBe('unsubscribe');
          expect(result!.confidence).toBeGreaterThan(0.75);
        });
      });
    });

    describe('Нерозпізнані команди', () => {
      it('має повертати null для нерозпізнаних команд', () => {
        const unrecognizedCommands = [
          'привіт',
          'як справи?',
          'розкажи жарт',
          'створи мем',
          'випадковий текст',
          'абракадабра новини хрінь'
        ];
        
        unrecognizedCommands.forEach(command => {
          const result = matcher.recognizeCommand(command);
          expect(result).toBeNull();
        });
      });

      it('має повертати null для команд з низькою впевненістю', () => {
        const lowConfidenceCommands = [
          'абракадабра погода хрінь',
          'хіхахохо підписка безглуздий',
          'фівапролм відписка'
        ];
        
        lowConfidenceCommands.forEach(command => {
          const result = matcher.recognizeCommand(command);
          expect(result).toBeNull();
        });
      });
    });

    describe('Вибір найкращого збігу', () => {
      it('має вибирати найкращий збіг коли є кілька варіантів', () => {
        const command = 'хочу підписатися на свіжі новини';
        const result = matcher.recognizeCommand(command);
        
        expect(result).not.toBeNull();
        expect(result!.type).toBe('subscribe');
        expect(result!.confidence).toBeGreaterThan(0.75);
      });

      it('має правильно обробляти довгі речення', () => {
        const longCommand = 'привіт, я хотів би дізнатися яка зараз погода в Києві, будь ласка';
        const result = matcher.recognizeCommand(longCommand);
        
        expect(result).not.toBeNull();
        expect(result!.type).toBe('weather');
        expect(result!.city).toBe('Київ');
      });
    });
  });

  describe('isQuestion', () => {
    it('має розпізнавати питання з питальними словами', () => {
      const questions = [
        'що робиш?',
        'як справи?',
        'коли буде дощ?',
        'де новини?',
        'які твої можливості?'
      ];
      
      questions.forEach(question => {
        expect(matcher.isQuestion(question)).toBe(true);
      });
    });

    it('має розпізнавати питання з знаком питання', () => {
      const questions = [
        'все гаразд?',
        'готовий?',
        'розумієш?'
      ];
      
      questions.forEach(question => {
        expect(matcher.isQuestion(question)).toBe(true);
      });
    });

    it('не має розпізнавати звичайні твердження як питання', () => {
      const statements = [
        'привіт',
        'дякую',
        'гарного дня',
        'до побачення'
      ];
      
      statements.forEach(statement => {
        expect(matcher.isQuestion(statement)).toBe(false);
      });
    });
  });

  describe('getRecognitionStats', () => {
    it('має повертати коректну статистику', () => {
      const stats = matcher.getRecognitionStats();
      
      expect(stats.totalKeywords).toBeGreaterThan(0);
      expect(stats.totalVariations).toBeGreaterThan(0);
      expect(stats.supportedCities).toBeGreaterThan(0);
      expect(typeof stats.totalKeywords).toBe('number');
      expect(typeof stats.totalVariations).toBe('number');
      expect(typeof stats.supportedCities).toBe('number');
    });

    it('статистика має відповідати реальним даним', () => {
      const stats = matcher.getRecognitionStats();
      
      expect(stats.supportedCities).toBeGreaterThanOrEqual(16);
      
      expect(stats.totalKeywords).toBeGreaterThanOrEqual(20);
      expect(stats.totalVariations).toBeGreaterThanOrEqual(50);
    });
  });

  describe('Fuzzy matching алгоритм', () => {
    it('має правильно розраховувати схожість слів', () => {
      const testCases = [
        { text: 'новини', shouldMatch: true },
        { text: 'новыни', shouldMatch: true },
        { text: 'новини!', shouldMatch: true },
        { text: 'абракадабра', shouldMatch: false }
      ];
      
      testCases.forEach(({ text, shouldMatch }) => {
        const result = matcher.recognizeCommand(text);
        if (shouldMatch) {
          expect(result).not.toBeNull();
        } else {
          expect(result).toBeNull();
        }
      });
    });

    it('має обробляти регістр тексту', () => {
      const commands = [
        'НОВИНИ',
        'Погода',
        'ПіДпИсАтИсЯ',
        'ВІДПИСАТИСЯ'
      ];
      
      commands.forEach(command => {
        const result = matcher.recognizeCommand(command);
        expect(result).not.toBeNull();
      });
    });

    it('має обробляти зайві пробіли', () => {
      const commands = [
        '  новини  ',
        '\t\tпогода\t\t',
        '   підписатися   ',
        'відписатися\n'
      ];
      
      commands.forEach(command => {
        const result = matcher.recognizeCommand(command);
        expect(result).not.toBeNull();
      });
    });
  });

  describe('Граничні випадки', () => {
    it('має обробляти порожні рядки', () => {
      const result = matcher.recognizeCommand('');
      expect(result).toBeNull();
    });

    it('має обробляти дуже короткі рядки', () => {
      const result = matcher.recognizeCommand('а');
      expect(result).toBeNull();
    });

    it('має обробляти дуже довгі рядки', () => {
      const longText = 'а'.repeat(1000) + ' новини ' + 'б'.repeat(1000);
      const result = matcher.recognizeCommand(longText);
      expect(result).not.toBeNull();
      expect(result!.type).toBe('news');
    });

    it('має обробляти спеціальні символи', () => {
      const commands = [
        'новини!!!',
        'погода???',
        'підписатися...',
        'відписатися!!!'
      ];
      
      commands.forEach(command => {
        const result = matcher.recognizeCommand(command);
        expect(result).not.toBeNull();
      });
    });
  });
}); 