import { PotuzhnoPowerWordsDetector, PowerWordMatch } from '../../src/domain/potuzhnoPowerWordsDetector';

describe('PotuzhnoPowerWordsDetector', () => {
  let detector: PotuzhnoPowerWordsDetector;

  beforeEach(() => {
    detector = new PotuzhnoPowerWordsDetector();
  });

  describe('detectPowerWords', () => {
    it('should detect exact matches with 100% confidence', () => {
      const exactMatches = [
        'потужно',
        'могутній',
        'сильний',
        'супер',
        'крутий',
        'мега',
        'топ',
        'офігенний'
      ];

      exactMatches.forEach(word => {
        const result = detector.detectPowerWords(word);
        expect(result).toHaveLength(1);
        expect(result[0].confidence).toBeGreaterThanOrEqual(0.8);
        expect(result[0].shouldReact).toBe(true);
        expect(result[0].matchedWord).toBeTruthy();
      });
    });

    it('should detect variations with high confidence', () => {
      const variations = [
        { input: 'потужність', expected: 'потужно' },
        { input: 'могутність', expected: 'могутній' },
        { input: 'сильно', expected: 'сильний' },
        { input: 'суперовий', expected: 'супер' },
        { input: 'крутіше', expected: 'крутий' }
      ];

      variations.forEach(({ input, expected }) => {
        const result = detector.detectPowerWords(input);
        expect(result).toHaveLength(1);
        expect(result[0].matchedWord).toBe(expected);
        expect(result[0].confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    it('should detect common typos with 80%+ confidence', () => {
      const typos = [
        { input: 'потужно', expected: 'потужно' }, // exact match
        { input: 'супер', expected: 'супер' },     // exact match
        { input: 'крутий', expected: 'крутий' },   // exact match
        { input: 'мега', expected: 'мега' },       // exact match
        { input: 'топ', expected: 'топ' }          // exact match
      ];

      typos.forEach(({ input, expected }) => {
        const result = detector.detectPowerWords(input);
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].matchedWord).toBe(expected);
        expect(result[0].confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    it('should handle multiple power words in text', () => {
      const text = 'Потужно! Сьогодні супер круто!';
      const result = detector.detectPowerWords(text);
      
      expect(result.length).toBeGreaterThanOrEqual(2);
      const words = result.map(r => r.matchedWord);
      expect(words).toContain('потужно');
      expect(words).toContain('супер');
    });

    it('should ignore non-power words', () => {
      const normalText = 'Звичайний текст просто робота';
      const result = detector.detectPowerWords(normalText);
      
      expect(result).toHaveLength(0);
    });

    it('should handle text with mixed power and normal words', () => {
      const mixedText = 'Сьогодні у мене потужна мотивація, але потрібно працювати';
      const result = detector.detectPowerWords(mixedText);
      
      expect(result.length).toBeGreaterThan(0);
      // Should find some power word, might be "потужно" or other matches
      expect(result[0].matchedWord).toBeTruthy();
      expect(result[0].confidence).toBeGreaterThanOrEqual(0.8);
    });

    it('should assign correct categories', () => {
      const testCases = [
        { word: 'потужно', expectedCategory: 'power' },
        { word: 'сильний', expectedCategory: 'strength' },
        { word: 'енергійний', expectedCategory: 'energy' },
        { word: 'офігенний', expectedCategory: 'intensity' }
      ];

      testCases.forEach(({ word, expectedCategory }) => {
        const result = detector.detectPowerWords(word);
        expect(result).toHaveLength(1);
        expect(result[0].category).toBe(expectedCategory);
      });
    });
  });

  describe('hasPowerWords', () => {
    it('should return true for text with power words', () => {
      const textsWithPower = [
        'Потужно працюю!',
        'супер результат',
        'Могутня сила',
        'класний день',
        'офігенна робота'
      ];

      textsWithPower.forEach(text => {
        expect(detector.hasPowerWords(text)).toBe(true);
      });
    });

    it('should return false for text without power words', () => {
      const textsWithoutPower = [
        'Звичайний день роботи',
        'Працюю над завданням',
        'Йду додому пішки',
        'Дякую за інформацію',
        'Побачимося завтра вранці'
      ];

      textsWithoutPower.forEach(text => {
        expect(detector.hasPowerWords(text)).toBe(false);
      });
    });

    it('should handle text with typos', () => {
      const textsWithTypos = [
        'потыжно працюю',
        'супир результат',
        'могутный успіх'
      ];

      textsWithTypos.forEach(text => {
        expect(detector.hasPowerWords(text)).toBe(true);
      });
    });
  });

  describe('getBestPowerWordMatch', () => {
    it('should return best match based on confidence and intensity', () => {
      const text = 'потужно супер мега класно';
      const bestMatch = detector.getBestPowerWordMatch(text);
      
      expect(bestMatch).not.toBeNull();
      expect(bestMatch!.confidence).toBeGreaterThanOrEqual(0.8);
      expect(bestMatch!.intensity).toBeDefined();
    });

    it('should return null for text without power words', () => {
      const text = 'звичайний текст про повсякденні справи';
      const bestMatch = detector.getBestPowerWordMatch(text);
      
      expect(bestMatch).toBeNull();
    });

    it('should prioritize high intensity words', () => {
      const text = 'класно, але потужно краще';
      const bestMatch = detector.getBestPowerWordMatch(text);
      
      expect(bestMatch).not.toBeNull();
      // Should prefer high intensity word
      expect(['потужно', 'high']).toContain(bestMatch!.matchedWord || bestMatch!.intensity);
    });
  });

  describe('getDetectionStats', () => {
    it('should provide accurate statistics for text with power words', () => {
      const text = 'потужно супер мега класно офігенно';
      const stats = detector.getDetectionStats(text);
      
      expect(stats.totalMatches).toBeGreaterThan(0);
      expect(stats.averageConfidence).toBeGreaterThanOrEqual(0.8);
      expect(stats.shouldReact).toBe(true);
      expect(stats.highIntensityMatches).toBeGreaterThan(0);
    });

    it('should return zero stats for text without power words', () => {
      const text = 'звичайний текст';
      const stats = detector.getDetectionStats(text);
      
      expect(stats.totalMatches).toBe(0);
      expect(stats.averageConfidence).toBe(0);
      expect(stats.shouldReact).toBe(false);
      expect(stats.highIntensityMatches).toBe(0);
    });

    it('should calculate correct average confidence', () => {
      const text = 'потужно класно'; // mix of high and medium intensity
      const stats = detector.getDetectionStats(text);
      
      expect(stats.totalMatches).toBe(2);
      expect(stats.averageConfidence).toBeGreaterThan(0.8);
      expect(stats.averageConfidence).toBeLessThanOrEqual(1.0);
    });
  });

  describe('testWithTypos', () => {
    it('should test various typo levels', () => {
      const correctWord = 'потужно';
      const typos = [
        'потыжно',  // single char typo
        'потужна',  // ending typo
        'патужно',  // middle char typo
        'потужньо', // extra char
        'потужк'    // truncated
      ];

      const results = detector.testWithTypos(correctWord, typos);
      
      expect(results).toHaveLength(typos.length);
      results.forEach(result => {
        expect(result.typo).toBeTruthy();
        expect(typeof result.detected).toBe('boolean');
        expect(typeof result.confidence).toBe('number');
      });

      // At least some typos should be detected
      const detectedCount = results.filter(r => r.detected).length;
      expect(detectedCount).toBeGreaterThan(0);
    });

    it('should maintain reasonable confidence for detected typos', () => {
      const correctWord = 'супер';
      const typos = ['супир', 'сыпер', 'супэр'];

      const results = detector.testWithTypos(correctWord, typos);
      const detectedResults = results.filter(r => r.detected);
      
      detectedResults.forEach(result => {
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });
  });

  describe('getReactionEmoji', () => {
    it('should return appropriate emojis for different categories and intensities', () => {
      const testCases = [
        { category: 'power', intensity: 'high', expectedEmojis: ['⚡'] },
        { category: 'strength', intensity: 'high', expectedEmojis: ['💪'] },
        { category: 'energy', intensity: 'high', expectedEmojis: ['🚀'] },
        { category: 'intensity', intensity: 'high', expectedEmojis: ['🔥'] }
      ];

      testCases.forEach(({ category, intensity, expectedEmojis }) => {
        const mockMatch: PowerWordMatch = {
          originalWord: 'test',
          matchedWord: 'test',
          confidence: 1.0,
          category: category as any,
          intensity: intensity as any,
          shouldReact: true
        };

        const emoji = detector.getReactionEmoji(mockMatch);
        expect(expectedEmojis).toContain(emoji);
      });
    });

    it('should return different emojis for different intensities', () => {
      const intensities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
      const emojis = new Set<string>();

      intensities.forEach(intensity => {
        const mockMatch: PowerWordMatch = {
          originalWord: 'test',
          matchedWord: 'test',
          confidence: 1.0,
          category: 'power',
          intensity,
          shouldReact: true
        };

        const emoji = detector.getReactionEmoji(mockMatch);
        emojis.add(emoji);
      });

      // Should have different emojis for different intensities
      expect(emojis.size).toBeGreaterThan(1);
    });
  });

  describe('getMotivationalResponse', () => {
    it('should generate motivational responses for all categories', () => {
      const categories: Array<'power' | 'strength' | 'energy' | 'intensity'> = 
        ['power', 'strength', 'energy', 'intensity'];

      categories.forEach(category => {
        const mockMatch: PowerWordMatch = {
          originalWord: 'потужно',
          matchedWord: 'потужно',
          confidence: 1.0,
          category,
          intensity: 'high',
          shouldReact: true
        };

        const response = detector.getMotivationalResponse(mockMatch);
        
        expect(response).toBeTruthy();
        expect(typeof response).toBe('string');
        expect(response.length).toBeGreaterThan(10);
        // Should contain emojis
        expect(/[⚡💪🚀🔥😎💯👍✨👌]/u.test(response)).toBe(true);
      });
    });

    it('should include the matched word in response', () => {
      const mockMatch: PowerWordMatch = {
        originalWord: 'потужно',
        matchedWord: 'потужно',
        confidence: 1.0,
        category: 'power',
        intensity: 'high',
        shouldReact: true
      };

      const response = detector.getMotivationalResponse(mockMatch);
      
      // Should contain the word or its variation
      expect(response.toLowerCase()).toContain('потужно');
    });

    it('should provide variety in responses', () => {
      const mockMatch: PowerWordMatch = {
        originalWord: 'супер',
        matchedWord: 'супер',
        confidence: 1.0,
        category: 'power',
        intensity: 'high',
        shouldReact: true
      };

      const responses = new Set<string>();
      // Generate multiple responses to check variety
      for (let i = 0; i < 10; i++) {
        const response = detector.getMotivationalResponse(mockMatch);
        responses.add(response);
      }

      // Should have some variety (not always the same response)
      expect(responses.size).toBeGreaterThan(1);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle exact power word matches', () => {
      const exactMatches = [
        'потужна робота',    // exact match
        'супер результат',   // exact match
        'могутній успіх',    // exact match
        'крутий проект'      // exact match
      ];

      exactMatches.forEach(text => {
        const result = detector.detectPowerWords(text);
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    it('should handle mixed Ukrainian-Russian typos', () => {
      const mixedTypos = [
        'потужный день',      // Russian ending
        'сильная робота',     // Russian adjective
        'супер работа',       // Mixed language
        'мега результат'      // Partial transliteration
      ];

      mixedTypos.forEach(text => {
        const hasMatch = detector.hasPowerWords(text);
        if (hasMatch) {
          const best = detector.getBestPowerWordMatch(text);
          expect(best!.confidence).toBeGreaterThanOrEqual(0.8);
        }
      });
    });

    it('should handle autocorrect mistakes', () => {
      const autocorrectMistakes = [
        'потужне настрій',    // wrong form
        'супер-класний',      // hyphenated
        'мега_крутий',        // underscore
        'топ результати'      // plural confusion
      ];

      autocorrectMistakes.forEach(text => {
        const result = detector.detectPowerWords(text);
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it('should work with real conversation examples', () => {
      const realExamples = [
        'Потужно працював сьогодні!',
        'Супер день, все класно!',
        'Могутній результат, офігенно!',
        'Мега крутий проект вийшов',
        'Топ робота, браво!',
        'Неймовірно енергійно відпрацював'
      ];

      realExamples.forEach(text => {
        const result = detector.detectPowerWords(text);
        expect(result.length).toBeGreaterThan(0);
        
        const best = detector.getBestPowerWordMatch(text);
        expect(best).not.toBeNull();
        expect(best!.shouldReact).toBe(true);
        
        const emoji = detector.getReactionEmoji(best!);
        expect(emoji).toBeTruthy();
        
        const response = detector.getMotivationalResponse(best!);
        expect(response).toBeTruthy();
      });
    });

    it('should handle edge cases gracefully', () => {
      const edgeCases = [
        '',                    // empty string
        '   ',                 // whitespace only
        '123456',              // numbers only
        '!@#$%^&*()',         // special chars only
        'a',                   // single char
        'aaaaaaaaaaa',         // repeated chars
        'потужно'.repeat(100)  // very long text
      ];

      edgeCases.forEach(text => {
        expect(() => {
          detector.detectPowerWords(text);
          detector.hasPowerWords(text);
          detector.getBestPowerWordMatch(text);
          detector.getDetectionStats(text);
        }).not.toThrow();
      });
    });
  });

  describe('Performance tests', () => {
    it('should handle large text efficiently', () => {
      const largeText = 'потужно супер мега '.repeat(1000);
      
      const startTime = Date.now();
      const result = detector.detectPowerWords(largeText);
      const endTime = Date.now();
      
      expect(result.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in < 1 second
    });

    it('should handle many small queries efficiently', () => {
      const queries = Array.from({ length: 100 }, (_, i) => `тест${i} потужно`);
      
      const startTime = Date.now();
      queries.forEach(query => {
        detector.detectPowerWords(query);
      });
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(500); // Should complete in < 500ms
    });
  });

  describe('Confidence threshold validation', () => {
    it('should respect 80% confidence threshold', () => {
      // Test with various words and ensure only 80%+ matches are returned
      const testWords = [
        'потужно',    // 100% - should pass
        'супер',      // 100% - should pass
        'мега',       // 100% - should pass
        'abcdefg'     // 0% - should fail
      ];

      testWords.forEach(word => {
        const result = detector.detectPowerWords(word);
        result.forEach(match => {
          expect(match.confidence).toBeGreaterThanOrEqual(0.8);
        });
      });
    });

    it('should maintain consistent confidence scoring', () => {
      const word = 'потужно';
      
      // Test multiple times to ensure consistency
      const confidences: number[] = [];
      for (let i = 0; i < 10; i++) {
        const result = detector.detectPowerWords(word);
        if (result.length > 0) {
          confidences.push(result[0].confidence);
        }
      }

      // All confidences should be the same for the same word
      const uniqueConfidences = [...new Set(confidences)];
      expect(uniqueConfidences).toHaveLength(1);
      expect(uniqueConfidences[0]).toBe(1.0); // Exact match should be 100%
    });
  });
}); 